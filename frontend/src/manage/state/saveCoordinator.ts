export type SaveDomain = "profile" | "capabilities" | "grants";
export type SaveResult = { ok: boolean; savedDomains: SaveDomain[]; failedDomains: Array<{ domain: SaveDomain; message: string }> };

export async function saveDomains(operations: Partial<Record<SaveDomain, () => Promise<void>>>): Promise<SaveResult> {
  const entries = Object.entries(operations) as Array<[SaveDomain, () => Promise<void>]>;
  const results = await Promise.all(entries.map(async ([domain, operation]) => {
    try {
      await operation();
      return { domain, ok: true as const };
    } catch (error) {
      return { domain, ok: false as const, message: error instanceof Error ? error.message : String(error) };
    }
  }));
  return {
    ok: results.every((item) => item.ok),
    savedDomains: results.filter((item) => item.ok).map((item) => item.domain),
    failedDomains: results.filter((item): item is { domain: SaveDomain; ok: false; message: string } => !item.ok).map(({ domain, message }) => ({ domain, message })),
  };
}
