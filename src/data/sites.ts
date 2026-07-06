import type { Site } from '@/types';

export const SITES: Site[] = [
  { id: 's1', name: 'Northgate Open Cut', region: 'Pilbara', division: 'Iron Ore', type: 'Iron Ore West', visibility: 'high', visibilityLabel: 'High visibility', lastVisit: 'Today', lastVisitDays: 0, openInsightsCount: 3, observationsCount: 184, atrophyScore: 28, status: 'On site now', live: true, supervisor: 'J. Morrow', crewSize: 42 },
  { id: 's2', name: 'Ridgeback Processing', region: 'Pilbara', division: 'Iron Ore', type: 'Processing', visibility: 'high', visibilityLabel: 'High visibility', lastVisit: '2 days ago', lastVisitDays: 2, openInsightsCount: 2, observationsCount: 96, atrophyScore: 34, status: 'Visit planned', supervisor: 'A. Pereira', crewSize: 28 },
  { id: 's3', name: 'Marlow Stockyard', region: 'Pilbara', division: 'Gold', type: 'Logistics', visibility: 'high', visibilityLabel: 'Trending positive', lastVisit: '2 days ago', lastVisitDays: 2, openInsightsCount: 1, observationsCount: 71, atrophyScore: 22, status: 'Healthy', supervisor: 'D. Cole', crewSize: 19 },
  { id: 's4', name: 'Coolinga Plant', region: 'Goldfields', division: 'Gold', type: 'Processing', visibility: 'high', visibilityLabel: '2 open barriers', lastVisit: '5 days ago', lastVisitDays: 5, openInsightsCount: 4, observationsCount: 132, atrophyScore: 41, status: 'At risk', risk: true, supervisor: 'J. Liang', crewSize: 36 },
  { id: 's5', name: 'Brookman Pit 2', region: 'Pilbara', division: 'Iron Ore', type: 'Iron Ore East', visibility: 'moderate', visibilityLabel: 'Moderate visibility', lastVisit: '3 weeks ago', lastVisitDays: 21, openInsightsCount: 2, observationsCount: 54, atrophyScore: 58, status: 'Needs a visit', needsVisit: true, supervisor: 'R. Bridges', crewSize: 23 },
  { id: 's6', name: 'Jewell Crusher', region: 'Pilbara', division: 'Iron Ore', type: 'Processing', visibility: 'low', visibilityLabel: 'Low visibility', lastVisit: '6 weeks ago', lastVisitDays: 42, openInsightsCount: 1, observationsCount: 31, atrophyScore: 64, status: 'At risk', risk: true, needsVisit: true, supervisor: 'M. Okafor', crewSize: 14 },
  { id: 's7', name: 'Sylvania Underground', region: 'Kalgoorlie', division: 'Gold', type: 'Underground', visibility: 'moderate', visibilityLabel: 'Moderate visibility', lastVisit: '12 days ago', lastVisitDays: 12, openInsightsCount: 1, observationsCount: 47, atrophyScore: 35, status: 'Healthy', supervisor: 'K. Lee', crewSize: 31 },
];

export const SITES_BY_ID: Record<string, Site> = Object.fromEntries(SITES.map((s) => [s.id, s]));
export const SITE_ID_BY_NAME: Record<string, string> = Object.fromEntries(SITES.map((s) => [s.name, s.id]));
