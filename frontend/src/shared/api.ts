export async function apiRequest<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const detail = typeof payload === "object" && payload && "detail" in payload ? (payload as { detail?: unknown }).detail : payload;
    throw new Error(typeof detail === "string" ? detail : `请求失败（${response.status}）`);
  }
  return payload as T;
}

export function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason || "操作失败");
}
