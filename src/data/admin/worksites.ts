import type { AdminWorksite } from '@/types';

// Standalone from data/sites.ts's SITES, which drives the live Insights
// workspace (Dashboard, Sites, Visits, Observations, Insights all read it).
// Seeded with the same worksite names for narrative consistency, but this
// is its own array — editing/deleting here can't affect the live prototype.
export const ADMIN_WORKSITES: AdminWorksite[] = [
  { id: 'aw1', name: 'Northgate Open Cut', region: 'Pilbara', division: 'Iron Ore', type: 'Open cut', supervisor: 'James Morrow', crewSize: 42 },
  { id: 'aw2', name: 'Ridgeback Processing', region: 'Pilbara', division: 'Iron Ore', type: 'Processing', supervisor: 'A. Pereira', crewSize: 28 },
  { id: 'aw3', name: 'Marlow Stockyard', region: 'Pilbara', division: 'Gold', type: 'Logistics', supervisor: 'D. Cole', crewSize: 19 },
  { id: 'aw4', name: 'Coolinga Plant', region: 'Goldfields', division: 'Gold', type: 'Processing', supervisor: 'Jess Liang', crewSize: 36 },
  { id: 'aw5', name: 'Brookman Pit 2', region: 'Pilbara', division: 'Iron Ore', type: 'Open cut', supervisor: 'R. Bridges', crewSize: 23 },
  { id: 'aw6', name: 'Jewell Crusher', region: 'Pilbara', division: 'Iron Ore', type: 'Processing', supervisor: 'Marcus Okafor', crewSize: 14 },
  { id: 'aw7', name: 'Sylvania Underground', region: 'Kalgoorlie', division: 'Gold', type: 'Underground', supervisor: 'Kim Lee', crewSize: 31 },
];

export interface AdminWorksiteInput {
  name: string;
  region: string;
  division: string;
  type: string;
  supervisor: string;
  crewSize: number;
}

export function addWorksite(input: AdminWorksiteInput): AdminWorksite {
  const record: AdminWorksite = { id: `aw${ADMIN_WORKSITES.length + 1}-${Date.now()}`, ...input };
  ADMIN_WORKSITES.push(record);
  return record;
}

export function updateWorksite(id: string, input: AdminWorksiteInput): AdminWorksite | null {
  const idx = ADMIN_WORKSITES.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  ADMIN_WORKSITES[idx] = { ...ADMIN_WORKSITES[idx], ...input };
  return ADMIN_WORKSITES[idx];
}

export function removeWorksite(id: string): void {
  const idx = ADMIN_WORKSITES.findIndex((w) => w.id === id);
  if (idx !== -1) ADMIN_WORKSITES.splice(idx, 1);
}
