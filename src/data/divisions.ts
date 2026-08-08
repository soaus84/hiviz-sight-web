export const DIVISIONS = ['Iron Ore', 'Gold'] as const;
export type DivisionName = (typeof DIVISIONS)[number];

/** The "no division filter" state — every division at once. */
export const ALL_DIVISIONS = 'All divisions' as const;
export type DivisionScope = typeof ALL_DIVISIONS | DivisionName;

export function divisionMatchesScope(itemDivision: string, scope: DivisionScope): boolean {
  return scope === ALL_DIVISIONS || itemDivision === scope;
}

/** Mock subdivision vocabulary — shared by the PurviewSwitcher preview and
 * Communities' auto-derived org-level communities, so both read the same
 * tiers instead of maintaining two lists that can drift apart. */
export const SUBDIVISIONS: Partial<Record<DivisionName, string[]>> = {
  'Iron Ore': ['Crushing & Screening', 'Rail & Port'],
  Gold: ['Open Pit'],
};
