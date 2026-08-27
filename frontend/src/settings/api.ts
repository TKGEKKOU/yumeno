export type RerankerStatus = {
  model_id: string;
  source: string;
  device: string;
  installed: boolean;
  ready: boolean;
  installing: boolean;
  cancelling: boolean;
  phase: string;
  current_file: string;
  elapsed_seconds: number;
  error: string;
  model_dir: string;
};

async function fetchJson(input: RequestInfo, init?: RequestInit): Promise<RerankerStatus> {
  const response = await fetch(input, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.detail || `请求失败 (${response.status})`);
  return data as RerankerStatus;
}

export function getRerankerStatus(): Promise<RerankerStatus> {
  return fetchJson("/api/reranker/status", { cache: "no-store" });
}

export function installReranker(device: string): Promise<RerankerStatus> {
  return fetchJson("/api/reranker/install", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
    body: JSON.stringify({ model_id: "Qwen/Qwen3-Reranker-0.6B", source: "modelscope", device }),
  });
}

export function cancelRerankerInstall(): Promise<RerankerStatus> {
  return fetchJson("/api/reranker/install/cancel", { method: "DELETE", headers: { "X-YUMENO-Request": "web" } });
}

export function removeReranker(): Promise<RerankerStatus> {
  return fetchJson("/api/reranker/model", { method: "DELETE", headers: { "X-YUMENO-Request": "web" } });
}

export function openRerankerDirectory(): Promise<RerankerStatus> {
  return fetchJson("/api/reranker/model-directory", { method: "POST", headers: { "X-YUMENO-Request": "web" } });
}
