export type CapabilityStatus = "available" | "partial" | "unassigned" | "blocked" | "pending" | "error";
export type NodeKind = "persona" | "profile" | "memory" | "rag" | "voice" | "live2d" | "extensions" | "skill" | "tool" | "mcp";

export interface PersonaSummary {
  id: string;
  name: string;
  knowledge_space_id?: string;
  profile?: Record<string, unknown>;
}

export interface RetrievalConfig {
  profile?: "precise" | "deep" | "custom";
  retrieval_k?: number;
  rerank_k?: number;
  final_context_k?: number;
  evidence_token_budget?: number;
  allow_neighbors?: boolean;
}

export interface CapabilityDependency {
  id: string;
  name: string;
  source: string;
  server: string;
  level: number;
  effective: boolean;
  reason: string;
}

export interface CapabilityPackage {
  id: string;
  name: string;
  description: string;
  kind: "skill" | "tool";
  level: number;
  assigned: boolean;
  status: string;
  reason: string;
  dependencies: CapabilityDependency[];
  required_servers: string[];
}

export interface CapabilityItem {
  id: string;
  name: string;
  source: string;
  server: string;
  default_allowed: boolean;
}

export interface McpServer {
  name: string;
  description: string;
  enabled: boolean;
  global: boolean;
  authorized: boolean;
  status?: { status?: string; tool_count?: number };
}

export interface Live2dModel {
  id: string;
  name: string;
  compatible: boolean;
  kind?: "cubism2" | "cubism4" | string;
  moc_version?: number | null;
  entry?: string;
}

export interface WorkbenchSnapshot {
  persona: PersonaSummary;
  documents: Array<Record<string, unknown>>;
  capabilities: {
    overrides: Record<string, boolean>;
    packages: CapabilityPackage[];
    capabilities: CapabilityItem[];
  };
  grants: { servers: McpServer[] };
  resources?: {
    live2dModels: Live2dModel[];
    voiceAssets: Array<{ id: string; name: string; status: string; engine?: string; reference_language?: string }>;
  };
}

export interface RoleGraphNodeData {
  kind: NodeKind;
  label: string;
  summary: string;
  status: CapabilityStatus;
  level: number;
  assigned?: boolean;
  configurable?: boolean;
  sourceId?: string;
}

export interface RoleGraphNode {
  id: string;
  type: "persona" | "module" | "capability";
  position: { x: number; y: number };
  data: RoleGraphNodeData;
}

export interface RoleGraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface RoleGraph {
  nodes: RoleGraphNode[];
  edges: RoleGraphEdge[];
}
export type PersonaVersionStatus = "draft" | "published" | "superseded" | "archived" | string;

export interface PersonaRuntimeSnapshot {
  schema_version: number;
  name: string;
  persona_type: string;
  profile: Record<string, unknown>;
  knowledge_space_id: string;
  document_ids: string[];
  capability_overrides: Record<string, boolean>;
  mcp_server_names: string[];
}

export interface PersonaVersionSummary {
  id: string;
  persona_id: string;
  version_number: number;
  status: PersonaVersionStatus;
  label: string;
  note: string;
  created_at: string;
  published_at?: string | null;
}

export interface PersonaVersion extends PersonaVersionSummary {
  snapshot: PersonaRuntimeSnapshot;
}

export interface PersonaVersionMutationResponse {
  version: PersonaVersion;
  persona?: PersonaSummary;
  rollback?: boolean;
}

export interface KnowledgeSpaceReport {
  knowledge_space_id?: string;
  total_documents?: number;
  status_counts?: Record<string, number>;
  indexed_count?: number;
  failed_count?: number;
  in_progress_count?: number;
  ready_count?: number;
  document_type_counts?: Record<string, number>;
  chunking_preset_counts?: Record<string, number>;
  chunker_version_counts?: Record<string, number>;
  index_version_counts?: Record<string, number>;
  latest_updated_at?: string | null;
  latest_indexed_at?: string | null;
  // 兼容其他后端或旧版缓存返回的字段，避免质量面板因字段演进而失效。
  status?: string;
  state?: string;
  generated_at?: string | null;
  updated_at?: string | null;
  summary?: string;
  indexed_documents?: number;
  processing_documents?: number;
  failed_documents?: number;
  chunk_count?: number;
  chunks?: number;
  [key: string]: unknown;
}

export interface KnowledgeEvaluationSummary {
  id?: string;
  status?: string;
  created_at?: string | null;
  completed_at?: string | null;
  summary?: string;
  score?: number | null;
  metrics?: Record<string, unknown>;
  [key: string]: unknown;
}
