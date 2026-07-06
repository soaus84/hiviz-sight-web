import { formatVisitWhen } from '@/utils/format';
import type { Site, Visit } from '@/types';

export const VISITS: Visit[] = [
  { id: 'v1', siteName: 'Northgate Open Cut', region: 'Pilbara', division: 'Iron Ore', visitor: 'Jordan Marsh', when: 'Today · arrived 08:42', date: '2025-05-07', state: 'live', elapsed: '1h 18m', observationCount: 4, signals: { pos: 1, weak: 2, barrier: 1 } },
  { id: 'v2', siteName: 'Ridgeback Processing', region: 'Pilbara', division: 'Iron Ore', visitor: 'Jordan Marsh', when: 'Thu 8 May · 09:30', date: '2025-05-08', state: 'upcoming', briefing: 'ready', observationCount: 0 },
  { id: 'v3', siteName: 'Sylvania Underground', region: 'Kalgoorlie', division: 'Gold', visitor: 'Priya Singh', when: 'Mon 12 May · 07:00', date: '2025-05-12', state: 'upcoming', briefing: 'pending', observationCount: 0 },
  { id: 'v4', siteName: 'Brookman Pit 2', region: 'Pilbara', division: 'Iron Ore', visitor: 'Jordan Marsh', when: 'Wed 14 May · 06:30', date: '2025-05-14', state: 'upcoming', briefing: 'pending', observationCount: 0 },
  { id: 'v5', siteName: 'Northgate Open Cut', region: 'Pilbara', division: 'Iron Ore', visitor: 'Jordan Marsh', when: 'Mon 5 May', date: '2025-05-05', state: 'past', observationCount: 6, signals: { pos: 2, weak: 3, barrier: 1 }, ledToInsight: true },
  { id: 'v6', siteName: 'Ridgeback Processing', region: 'Pilbara', division: 'Iron Ore', visitor: 'Jordan Marsh', when: 'Thu 1 May', date: '2025-05-01', state: 'past', observationCount: 4, signals: { pos: 1, weak: 2, barrier: 1 } },
  { id: 'v7', siteName: 'Marlow Stockyard', region: 'Pilbara', division: 'Gold', visitor: 'P. Singh', when: 'Tue 29 Apr', date: '2025-04-29', state: 'past', observationCount: 5, signals: { pos: 3, weak: 2, barrier: 0 } },
  { id: 'v8', siteName: 'Coolinga Plant', region: 'Goldfields', division: 'Gold', visitor: 'J. Liang', when: 'Mon 28 Apr', date: '2025-04-28', state: 'past', observationCount: 7, signals: { pos: 2, weak: 4, barrier: 1 } },
];

export function createVisit(input: {
  site: Site;
  date: string;
  time: string;
  visitorName: string;
  focusNotes?: string;
  relatedInsightIds?: string[];
}): Visit {
  const visit: Visit = {
    id: `v${VISITS.length + 1}`,
    siteName: input.site.name,
    region: input.site.region,
    division: input.site.division,
    visitor: input.visitorName,
    when: input.date ? formatVisitWhen(input.date, input.time) : 'Date to be confirmed',
    date: input.date,
    time: input.time,
    state: 'upcoming',
    observationCount: 0,
    briefing: input.focusNotes ? 'ready' : 'pending',
    focusNotes: input.focusNotes,
    relatedInsightIds: input.relatedInsightIds,
  };
  VISITS.push(visit);
  return visit;
}

export function updateVisit(id: string, input: {
  site: Site;
  date: string;
  time: string;
  focusNotes?: string;
  relatedInsightIds?: string[];
}): Visit | null {
  const idx = VISITS.findIndex((v) => v.id === id);
  if (idx === -1) return null;
  const updated: Visit = {
    ...VISITS[idx],
    siteName: input.site.name,
    region: input.site.region,
    division: input.site.division,
    when: input.date ? formatVisitWhen(input.date, input.time) : 'Date to be confirmed',
    date: input.date,
    time: input.time,
    briefing: input.focusNotes ? 'ready' : 'pending',
    focusNotes: input.focusNotes,
    relatedInsightIds: input.relatedInsightIds,
  };
  VISITS[idx] = updated;
  return updated;
}
