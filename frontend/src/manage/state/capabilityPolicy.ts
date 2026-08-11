import type { WorkbenchSnapshot } from "../types";

export function applyCapabilityPolicy(
  snapshot: WorkbenchSnapshot,
  packageId: string,
  mode: "allow" | "deny" | "inherit",
): WorkbenchSnapshot {
  const next: WorkbenchSnapshot = {
    ...snapshot,
    capabilities: {
      ...snapshot.capabilities,
      overrides: { ...snapshot.capabilities.overrides },
    },
    grants: { servers: snapshot.grants.servers.map((server) => ({ ...server })) },
  };
  const capability = snapshot.capabilities.packages.find((item) => item.id === packageId);
  if (!capability) return next;
  if (mode === "inherit") delete next.capabilities.overrides[packageId];
  else next.capabilities.overrides[packageId] = mode === "allow";
  if (mode !== "allow") return next;
  for (const dependency of capability.dependencies) {
    if (dependency.id) next.capabilities.overrides[dependency.id] = true;
  }
  const required = new Set(capability.required_servers);
  next.grants.servers.forEach((server) => {
    if (!server.global && required.has(server.name)) server.authorized = true;
  });
  return next;
}
