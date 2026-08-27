from ingestion.local_reranker.worker import build_prompts, iter_batches


def test_reranker_prompt_uses_qwen_yes_no_contract():
    prompt = build_prompts("问题", ["资料"])[0]

    assert 'answer can only be "yes" or "no"' in prompt
    assert "<Query>: 问题" in prompt
    assert "<Document>: 资料" in prompt
    assert prompt.endswith("<think>\n\n</think>\n\n")


def test_reranker_prompt_matches_official_query_document_spacing():
    prompt = build_prompts("问题", ["资料"])[0]

    assert "<Instruct>: Given a web search query, retrieve relevant passages that answer the query\n<Query>: 问题\n<Document>: 资料" in prompt


def test_reranker_batches_preserve_every_candidate_in_order():
    values = list(range(11))

    batches = list(iter_batches(values, 4))

    assert batches == [values[:4], values[4:8], values[8:]]
