export type ExtensionState = { skills: any[]; servers: any[]; tools: any[] };

export function deriveExtensionSummary(state: ExtensionState) {
  const skills = state.skills || [];
  const servers = state.servers || [];
  const tools = state.tools || [];
  const enabledSkills = skills.filter((skill) => skill.enabled).length;
  const mcpOnline = servers.filter((server) => server.enabled && server.status?.status === "connected").length;
  const mcpIssues = servers.filter((server) => server.status?.status === "error" || (server.enabled && server.status?.status !== "connected")).length;
  const untrustedSkills = skills.filter((skill) => !skill.builtin && !skill.trusted).length;
  return { enabledSkills, mcpOnline, mcpIssues, toolCount: tools.length, attentionCount: mcpIssues + untrustedSkills };
}

export function parseKeyValueLines(text: string) {
  const result: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    const colon = trimmed.indexOf(":");
    const separator = eq > 0 && (colon < 0 || eq < colon) ? eq : colon;
    if (separator > 0) result[trimmed.slice(0, separator).trim()] = trimmed.slice(separator + 1).trim();
  }
  return result;
}
