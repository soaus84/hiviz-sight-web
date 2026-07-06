import { regionMatchesScope, COMPANY, type RegionName, type ScopeName } from './regions';
import { divisionMatchesScope, ALL_DIVISIONS, type DivisionName, type DivisionScope } from './divisions';
import { SITES } from './sites';

export interface PurviewFilter {
  region: ScopeName;
  division: DivisionScope;
}

/** A site (or anything carrying a region+division pair) is in purview only
 * if it satisfies both axes at once — region and division are independent
 * filters that AND together, not a nested hierarchy. */
export function inPurview(item: { region: string; division: string }, purview: PurviewFilter): boolean {
  return regionMatchesScope(item.region, purview.region) && divisionMatchesScope(item.division, purview.division);
}

/** Compact header/switcher label — "Company", "Pilbara", "Gold", "Gold · Pilbara".
 * Division leads when both are set, matching the switcher's Division-first order. */
export function purviewLabel(region: ScopeName, division: DivisionScope): string {
  const parts = [division !== ALL_DIVISIONS ? division : null, region !== COMPANY ? region : null].filter(Boolean);
  return parts.length ? parts.join(' · ') : COMPANY;
}

/** Mid-sentence noun phrase — "the company", "Pilbara", "Gold division", "Gold division (Pilbara)". */
export function purviewPhrase(region: ScopeName, division: DivisionScope): string {
  const regionPart = region !== COMPANY ? region : null;
  const divisionPart = division !== ALL_DIVISIONS ? `${division} division` : null;
  if (!regionPart && !divisionPart) return 'the company';
  if (regionPart && divisionPart) return `${divisionPart} (${regionPart})`;
  return regionPart ?? divisionPart!;
}

/** Switcher trigger icon — globe for a pinned region, a grouping icon for a
 * division-only scope, the company glyph when nothing is narrowed. */
export function purviewIcon(region: ScopeName, division: DivisionScope): string {
  if (region === COMPANY && division === ALL_DIVISIONS) return 'corporate_fare';
  if (region !== COMPANY) return 'public';
  return 'category';
}

/** Whether this region has any site in the currently-selected division —
 * used to grey out regions that would combine with the pinned division to
 * produce a guaranteed-empty result (e.g. Iron Ore only exists in Pilbara). */
export function regionCompatibleWithDivision(region: RegionName, division: DivisionScope): boolean {
  return division === ALL_DIVISIONS || SITES.some((s) => s.region === region && s.division === division);
}

/** Whether this division has any site in the currently-selected region —
 * the mirror image of regionCompatibleWithDivision. */
export function divisionCompatibleWithRegion(division: DivisionName, region: ScopeName): boolean {
  return region === COMPANY || SITES.some((s) => s.division === division && s.region === region);
}
