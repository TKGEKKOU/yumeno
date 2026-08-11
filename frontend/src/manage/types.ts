export type CapabilityStatus = "available" | "partial" | "unassigned" | "blocked" | "pending" | "error";
export type NodeKind = "persona" | "profile" | "memory" | "rag" | "voice" | "live2d" | "extensions" | "skill" | "tool" | "mcp";

export interface PersonaSummary {
  id: string;
  name: string;
  knowledge_space_id?: string;
  profile?: Record<string, unknown>;
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
    voiceAssets: Array<{ id: string; name: string; status: string; reference_language?: string }>;
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
