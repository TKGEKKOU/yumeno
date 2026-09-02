import { normalizeEvaluationReports } from "./knowledge-quality";
import type { KnowledgeEvaluationSummary, KnowledgeSpaceReport, Live2dModel, McpServer, PersonaSummary, PersonaVersion, PersonaVersionMutationResponse, PersonaVersionSummary, WorkbenchSnapshot } from "./types";

export function plainClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(data?.detail || `请求失败 (${response.status})`, response.status);
  return data as T;
}

async function fetchOptionalJson<T>(input: RequestInfo, init?: RequestInit): Promise<T | null> {
  try {
    return await fetchJson<T>(input, init);
  } catch (reason) {
    if (reason instanceof ApiError && reason.status === 404) return null;
    throw reason;
  }
}

export function listPersonas(): Promise<PersonaSummary[]> {
  return fetchJson("/api/personas", { cache: "no-store" });
}

export function listPersonaDocuments(personaId: string): Promise<Array<Record<string, unknown>>> {
  return fetchJson(`/api/personas/${encodeURIComponent(personaId)}/documents`, { cache: "no-store" });
}

export async function listLive2dModels(): Promise<Live2dModel[]> {
  const data = await fetchJson<{ models: Live2dModel[] }>("/api/live2d/models", { cache: "no-store" });
  return data.models;
}

export async function openLive2dModelDirectory(): Promise<void> {
  await fetchJson("/api/live2d/model-directory", {
    method: "POST",
    headers: { "X-YUMENO-Request": "web" },
  });
}

export async function loadRoleWorkbench(persona: PersonaSummary): Promise<WorkbenchSnapshot> {
  const [capabilities, grants, documents, runtimeServers, live2d, voices] = await Promise.all([
    fetchJson<any>(`/api/personas/${encodeURIComponent(persona.id)}/capabilities`, { cache: "no-store" }),
    fetchJson<{ servers: McpServer[] }>(`/api/personas/${encodeURIComponent(persona.id)}/mcp-grants`, { cache: "no-store" }),
    listPersonaDocuments(persona.id),
    fetchJson<Array<{ name: string; status: Record<string, unknown> }>>("/api/mcp/servers", { cache: "no-store" }).catch(() => []),
    listLive2dModels().then((models) => ({ models })).catch(() => ({ models: [] })),
    fetchJson<{ items: Array<{ id: string; name: string; status: string; engine?: string; reference_language?: string }> }>("/api/voice-assets", { cache: "no-store" }).catch(() => ({ items: [] })),
  ]);
  const runtime = new Map(runtimeServers.map((server) => [server.name, server.status]));
  return {
    persona: plainClone(persona),
    documents,
    capabilities,
    grants: { servers: grants.servers.map((server) => ({ ...server, status: runtime.get(server.name) || { status: server.enabled ? "unknown" : "disabled" } })) },
    resources: { live2dModels: live2d.models, voiceAssets: voices.items.filter((item) => item.status === "ready" && (!((item as any).engine) || (item as any).engine === "gpt_sovits")) },
  };
}

export async function savePersona(persona: PersonaSummary): Promise<void> {
  await fetchJson(`/api/personas/${encodeURIComponent(persona.id)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: persona.name, profile: persona.profile || {} }),
  });
}

export async function saveCapabilities(personaId: string, overrides: Record<string, boolean>): Promise<void> {
  await fetchJson(`/api/personas/${encodeURIComponent(personaId)}/capabilities`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ overrides }),
  });
}

export async function saveGrants(personaId: string, servers: McpServer[]): Promise<void> {
  const serverNames = servers.filter((server) => server.authorized && !server.global).map((server) => server.name);
  await fetchJson(`/api/personas/${encodeURIComponent(personaId)}/mcp-grants`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ server_names: serverNames }),
  });
}

export async function deletePersona(personaId: string): Promise<void> {
  await fetchJson(`/api/personas/${encodeURIComponent(personaId)}`, { method: "DELETE" });
}

export async function uploadDocuments(persona: PersonaSummary, files: File[], directText: string): Promise<void> {
  if (!persona.knowledge_space_id) throw new Error("角色知识空间不可用");
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  if (directText.trim()) form.append("files", new File([directText.trim()], `text-${Date.now()}.txt`, { type: "text/plain;charset=utf-8" }));
  const jobs = await fetchJson<Array<{ id: string }>>(`/api/knowledge-spaces/${encodeURIComponent(persona.knowledge_space_id)}/documents/upload`, { method: "POST", body: form });
  await Promise.all(jobs.map((job) => fetchJson(`/api/documents/${encodeURIComponent(job.id)}/confirm`, { method: "POST" })));
}

export async function deleteDocument(documentId: string): Promise<void> {
  const response = await fetch(`/api/documents/${encodeURIComponent(documentId)}`, { method: "DELETE" });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail || `删除失败 (${response.status})`);
}

export async function retryDocument(documentId: string): Promise<void> {
  await fetchJson(`/api/documents/${encodeURIComponent(documentId)}/retry-index`, { method: "POST" });
}

export async function synthesizeVoicePreview(assetId: string, language: string): Promise<Blob> {
  const samples: Record<string, string> = {
    zh: "你好，这是我的声音。很高兴认识你。",
    ja: "こんにちは、これは私の声です。お会いできてうれしいです。",
    en: "Hello, this is my voice. Nice to meet you.",
    auto: "こんにちは、这是我的声音。Hello!",
  };
  const response = await fetch(`/api/voice-assets/${encodeURIComponent(assetId)}/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
    body: JSON.stringify({ text: samples[language] || samples.auto, text_lang: language || "auto" }),
  });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail || "试听失败");
  return response.blob();
}


export function listPersonaVersions(personaId: string): Promise<PersonaVersionSummary[]> {
  return fetchJson(`/api/personas/${encodeURIComponent(personaId)}/versions`, { cache: "no-store" });
}

export function getPersonaVersion(personaId: string, versionId: string): Promise<PersonaVersion> {
  return fetchJson(`/api/personas/${encodeURIComponent(personaId)}/versions/${encodeURIComponent(versionId)}`, { cache: "no-store" });
}

export function createPersonaVersion(
  personaId: string,
  payload: { label?: string; note?: string } = {},
): Promise<PersonaVersion> {
  return fetchJson(`/api/personas/${encodeURIComponent(personaId)}/versions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label: payload.label || "", note: payload.note || "" }),
  });
}

export async function publishPersonaVersion(personaId: string, versionId: string): Promise<PersonaVersion> {
  const data = await fetchJson<PersonaVersionMutationResponse>(
    `/api/personas/${encodeURIComponent(personaId)}/versions/${encodeURIComponent(versionId)}/publish`,
    { method: "POST" },
  );
  return data.version;
}

export async function rollbackPersonaVersion(personaId: string, versionId: string): Promise<PersonaVersion> {
  const data = await fetchJson<PersonaVersionMutationResponse>(
    `/api/personas/${encodeURIComponent(personaId)}/versions/${encodeURIComponent(versionId)}/rollback`,
    { method: "POST" },
  );
  return data.version;
}


export async function getKnowledgeSpaceReport(spaceId: string): Promise<KnowledgeSpaceReport | null> {
  return fetchOptionalJson<KnowledgeSpaceReport>(
    `/api/knowledge-spaces/${encodeURIComponent(spaceId)}/documents/report`,
    { cache: "no-store" },
  );
}

export async function listKnowledgeSpaceEvaluations(personaId: string, limit = 1): Promise<KnowledgeEvaluationSummary[]> {
  const payload = await fetchOptionalJson<unknown>(
    `/api/eval/history?persona_id=${encodeURIComponent(personaId)}&limit=${encodeURIComponent(String(limit))}`,
    { cache: "no-store" },
  );
  return normalizeEvaluationReports(payload);
}
