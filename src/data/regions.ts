export const REGIONS = ['Pilbara', 'Goldfields', 'Kalgoorlie', 'Mid West'] as const;
export type RegionName = (typeof REGIONS)[number];

/** The top of the purview hierarchy — every region at once, not a region itself. */
export const COMPANY = 'Company' as const;
export type ScopeName = typeof COMPANY | RegionName;

/** Whether a site/visit/etc.'s region falls within the given purview scope. */
export function regionMatchesScope(itemRegion: string, scope: ScopeName): boolean {
  return scope === COMPANY || itemRegion === scope;
}
