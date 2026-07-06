export const DIVISIONS = ['Iron Ore', 'Gold'] as const;
export type DivisionName = (typeof DIVISIONS)[number];

/** The "no division filter" state — every division at once. */
export const ALL_DIVISIONS = 'All divisions' as const;
export type DivisionScope = typeof ALL_DIVISIONS | DivisionName;

export function divisionMatchesScope(itemDivision: string, scope: DivisionScope): boolean {
  return scope === ALL_DIVISIONS || itemDivision === scope;
}
