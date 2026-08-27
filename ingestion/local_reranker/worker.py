"""Qwen3 reranker JSON Lines worker."""

import argparse
import json
import sys
from pathlib import Path


SYSTEM_PROMPT = 'Judge whether the Document meets the requirements based on the Query and the Instruct provided. Note that the answer can only be "yes" or "no".'
INSTRUCTION = "Given a web search query, retrieve relevant passages that answer the query"
DEFAULT_BATCH_SIZE = 4


def build_prompts(query: str, documents: list[str]) -> list[str]:
    return [
        f"<|im_start|>system\n{SYSTEM_PROMPT}<|im_end|>\n<|im_start|>user\n<Instruct>: {INSTRUCTION}\n<Query>: {query}\n<Document>: {document}<|im_end|>\n<|im_start|>assistant\n<think>\n\n</think>\n\n"
        for document in documents
    ]


def iter_batches(values: list, batch_size: int):
    if batch_size < 1:
        raise ValueError("Reranker batch size must be positive")
    for start in range(0, len(values), batch_size):
        yield values[start : start + batch_size]


def load_model(model_dir: Path, requested_device: str):
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer

    devices = [requested_device]
    if requested_device == "auto":
        devices = ["cuda", "cpu"] if torch.cuda.is_available() else ["cpu"]
    last_error = None
    for device in devices:
        try:
            tokenizer = AutoTokenizer.from_pretrained(str(model_dir), padding_side="left", trust_remote_code=False)
            dtype = torch.float16 if device == "cuda" else torch.float32
            model = AutoModelForCausalLM.from_pretrained(str(model_dir), torch_dtype=dtype, trust_remote_code=False).to(device).eval()
            return tokenizer, model, device
        except Exception as exc:
            last_error = exc
            if device == "cuda" and requested_device == "auto":
                torch.cuda.empty_cache()
                continue
            raise
    raise RuntimeError(str(last_error or "Reranker model load failed"))


def score(tokenizer, model, query: str, documents: list[str], batch_size: int = DEFAULT_BATCH_SIZE) -> list[float]:
    import torch

    yes_id = tokenizer.convert_tokens_to_ids("yes")
    no_id = tokenizer.convert_tokens_to_ids("no")
    scores = []
    for prompts in iter_batches(build_prompts(query, documents), batch_size):
        inputs = tokenizer(prompts, padding=True, truncation=True, max_length=8192, return_tensors="pt").to(model.device)
        with torch.no_grad():
            logits = model(**inputs).logits[:, -1, [no_id, yes_id]]
            scores.extend(torch.softmax(logits, dim=-1)[:, 1].float().cpu().tolist())
    return scores


def probe(model_dir: Path, device: str) -> dict:
    try:
        tokenizer, model, actual_device = load_model(model_dir, device)
        score(tokenizer, model, "test", ["test document"])
        return {"ok": True, "actual_device": actual_device}
    except Exception as exc:
        return {"ok": False, "error": str(exc)}


def serve(model_dir: Path, device: str) -> None:
    tokenizer, model, actual_device = load_model(model_dir, device)
    print(json.dumps({"ok": True, "event": "ready", "actual_device": actual_device}), flush=True)
    for line in sys.stdin:
        try:
            request = json.loads(line)
            query = request.get("query")
            documents = request.get("documents")
            if request.get("operation") != "score_pairs" or not isinstance(query, str) or not isinstance(documents, list):
                raise ValueError("Invalid reranker request")
            scores = score(tokenizer, model, query, [str(item) for item in documents])
            print(json.dumps({"ok": True, "scores": scores}), flush=True)
        except Exception as exc:
            print(json.dumps({"ok": False, "error": str(exc)}), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--probe", action="store_true")
    parser.add_argument("model_dir", type=Path)
    parser.add_argument("device", choices=["auto", "cuda", "cpu"])
    args = parser.parse_args()
    print(json.dumps(probe(args.model_dir, args.device), ensure_ascii=False)) if args.probe else serve(args.model_dir, args.device)
