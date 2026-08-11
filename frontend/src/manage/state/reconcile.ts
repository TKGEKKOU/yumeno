import { plainClone } from "../api";
import type { WorkbenchSnapshot } from "../types";
import type { SaveDomain } from "./saveCoordinator";

export function reconcileAfterSave(fresh: WorkbenchSnapshot, attempted: WorkbenchSnapshot, failed: Set<SaveDomain>): WorkbenchSnapshot {
  const next = plainClone(fresh);
  if (failed.has("profile")) next.persona = plainClone(attempted.persona);
  if (failed.has("capabilities")) next.capabilities.overrides = plainClone(attempted.capabilities.overrides);
  if (failed.has("grants")) next.grants.servers = plainClone(attempted.grants.servers);
  return next;
}
