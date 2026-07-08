import type { CompanyDetails, TagRecord } from '@/types';

export const COMPANY_DETAILS: CompanyDetails = {
  name: 'Forge Works',
  legalName: 'Forge Works Resources Pty Ltd',
  abn: '54 621 883 407',
  address: '14 Wellington Street, Perth WA 6000',
  timezone: 'Australia/Perth (AWST, UTC+8)',
};

export function updateCompanyDetails(patch: Partial<CompanyDetails>): CompanyDetails {
  Object.assign(COMPANY_DETAILS, patch);
  return COMPANY_DETAILS;
}

// Standalone from data/divisions.ts's DIVISIONS — that tuple is a literal
// type (DivisionName) threaded through the live purview system; this list
// is just what Admin displays and can be freely edited without touching it.
export const ADMIN_DIVISIONS: TagRecord[] = [
  { id: 'div1', name: 'Iron Ore', description: 'Iron ore extraction and processing operations.' },
  { id: 'div2', name: 'Gold', description: 'Gold extraction and processing operations.' },
];

// Standalone from data/regions.ts's REGIONS — same reasoning as above.
export const ADMIN_REGIONS: TagRecord[] = [
  { id: 'reg1', name: 'Pilbara', description: 'Iron ore heartland — Northgate, Ridgeback, Marlow, Brookman, Jewell.' },
  { id: 'reg2', name: 'Goldfields', description: 'Gold processing region — Coolinga Plant.' },
  { id: 'reg3', name: 'Kalgoorlie', description: 'Underground gold operations — Sylvania.' },
  { id: 'reg4', name: 'Mid West', description: 'No active worksites yet.' },
];

// A second level under Division — "business unit" is the other name this
// goes by. Every record requires a parentId (see TagList's `parent` prop).
export const ADMIN_SUBDIVISIONS: TagRecord[] = [
  { id: 'sub1', name: 'Crushing & Screening', description: 'Primary and secondary crushing circuits.', parentId: 'div1' },
  { id: 'sub2', name: 'Rail & Port', description: 'Rail haulage and port loadout.', parentId: 'div1' },
  { id: 'sub3', name: 'Open Pit', description: 'Open pit mining operations.', parentId: 'div2' },
];

function makeId(prefix: string, list: TagRecord[]): string {
  return `${prefix}${list.length + 1}-${Date.now()}`;
}

export function addTag(list: TagRecord[], idPrefix: string, name: string, description?: string, parentId?: string): TagRecord {
  const record: TagRecord = { id: makeId(idPrefix, list), name, description: description || undefined, parentId };
  list.push(record);
  return record;
}

export function updateTag(list: TagRecord[], id: string, name: string, description?: string, parentId?: string): TagRecord | null {
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], name, description: description || undefined, parentId };
  return list[idx];
}

export function removeTag(list: TagRecord[], id: string): void {
  const idx = list.findIndex((t) => t.id === id);
  if (idx !== -1) list.splice(idx, 1);
}
