import type { Insight, InsightKind } from '@/types';
import type { Tone } from '@/tokens';
import { SITES_BY_ID, SITE_ID_BY_NAME } from './sites';
import { inPurview, type PurviewFilter } from './purview';

// Card label + tone per specs/features/CRITICAL-INSIGHT.md's trigger_source →
// card label mapping (site-level algorithm trigger = Worksite Trend,
// region/division/org-level or atrophy_pattern = Cross-site Pattern,
// critical_observation = Critical Observation).
export const INSIGHT_KIND_LABEL: Record<InsightKind, [string, Tone]> = {
  worksite_trend: ['Worksite Trend', 'warning'],
  cross_site_pattern: ['Cross-site Pattern', 'info'],
  critical_observation: ['Critical Observation', 'error'],
};

// Fixed narrative "now" for this mock dataset (matches the "Today"/"Yest"
// timestamps used across observations/visits) rather than the real
// wall-clock date, so the Kanban board's 45-day window doesn't silently
// drift as real time passes.
const MOCK_NOW = new Date('2025-05-07T10:00:00');
export const RESOLVED_WINDOW_DAYS = 45;

export function daysSince(updatedAt: string): number {
  return Math.floor((MOCK_NOW.getTime() - new Date(updatedAt).getTime()) / 86_400_000);
}

export const INSIGHTS: Insight[] = [
  {
    id: 'INS-2210', status: 'review', kind: 'critical_observation', theme: 'Barrier failure',
    title: 'Spotter absent when excavator began reversing at Northgate haul road',
    summary: 'A single high-confidence barrier failure — spotter not in position during a live reversing sequence. Bypasses the trend threshold and routes immediately.',
    siteNames: ['Northgate Open Cut'], observationCount: 1, supporterInitials: [],
    energyTypes: ['kinetic'], updated: '6m ago', updatedAt: '2025-05-07T09:54:00', cleared_for_toolbox: false,
  },
  {
    id: 'INS-2204', status: 'review', kind: 'cross_site_pattern', theme: 'Heat management',
    title: 'Heat management plan non-compliance during elevated temperatures',
    summary: 'Heat-plan requirements not applied consistently past threshold temperatures — work continuing without mandatory rest or hydration breaks.',
    siteNames: ['Coolinga Plant', 'Ridgeback Processing', 'Northgate Open Cut'], observationCount: 4, supporterInitials: ['KO', 'TM'],
    energyTypes: ['thermal'], updated: '18m ago', updatedAt: '2025-05-07T09:42:00', cleared_for_toolbox: false,
    cause: 'Temperature monitoring and the trigger to stop work are not clearly assigned during operations — the plan exists but the stop authority is ambiguous in practice.',
    suggested: 'Heat management plan requirements are not being applied consistently during sustained elevated temperatures. Workers are continuing tasks beyond threshold temperatures without mandatory rest or hydration breaks.',
    suggestedBasis: 'Based on 4 observations across Coolinga, Ridgeback and Northgate — all describing work continuing past temperature thresholds. 3 of 4 flagged a degraded thermal barrier.',
    causeBasis: 'Consistent across all 4 observations: work continued because "someone else was supposed to call it."',
    fwClassifications: [
      { factor: 'management_systems', domain: 'enable', maturitySignal: 'compliant', confidence: 0.84, rationale: 'The heat plan exists and is referenced, but does not specify who is responsible for calling a work stop — the system content gap is the cause.' },
      { factor: 'operational_management', domain: 'enable', maturitySignal: 'compliant', confidence: 0.72, rationale: 'Managers visiting these sites have not identified or actioned the enforcement ambiguity.' },
    ],
    endorsements: [
      { name: 'Kwame Osei', note: 'Saw the same pattern at Blackrock last summer — this needs a system fix, not individual coaching.' },
      { name: 'Tanya Morrow', note: 'Regional heat plan review is overdue — this is the right trigger.' },
    ],
  },
  { id: 'INS-2201', status: 'review', kind: 'cross_site_pattern', theme: 'Pre-start checks', title: 'Pre-start checks slipping during shift handovers',
    summary: '7 observations in 14 days, concentrated 06:00–07:00 across loader and dozer crews. Coincides with the last roster change.',
    siteNames: ['Northgate Open Cut', 'Marlow Stockyard', 'Brookman Pit 2'], observationCount: 7, supporterInitials: ['AP', 'MC', 'SR'], energyTypes: ['none'], updated: '1h ago', updatedAt: '2025-05-07T09:00:00', cleared_for_toolbox: false },
  { id: 'INS-2198', status: 'review', kind: 'worksite_trend', theme: 'Spotter positioning', title: 'Spotter positioning at crusher exclusion zones',
    summary: 'Spotters standing inside marked exclusion at the Jewell crusher during truck reversing — 4 observations across 2 shifts.',
    siteNames: ['Jewell Crusher'], observationCount: 4, supporterInitials: ['NO', 'JL'], energyTypes: ['kinetic'], updated: '3h ago', updatedAt: '2025-05-07T07:00:00', cleared_for_toolbox: false },
  { id: 'INS-2187', status: 'action', kind: 'worksite_trend', theme: 'Tool tethering', title: 'Tool tethering on elevated walkways',
    summary: 'Unsecured tools observed at height on overhead conveyor walkways across two shifts at Coolinga.',
    siteNames: ['Coolinga Plant'], observationCount: 6, supporterInitials: ['JL', 'TM'], energyTypes: ['gravitational'], step: 'SOP update drafted', owner: 'J. Liang · Safety', updated: '5d ago', updatedAt: '2025-05-02T10:00:00', cleared_for_toolbox: true },
  { id: 'INS-2179', status: 'action', kind: 'worksite_trend', theme: 'Radio discipline', title: 'Radio handoff protocol at shift change',
    summary: 'New 2-minute radio handoff trialled with the loader crew; rolling out site-wide at Northgate.',
    siteNames: ['Northgate Open Cut'], observationCount: 5, supporterInitials: ['OS', 'KO'], energyTypes: ['none'], step: 'Rolling out site-wide', owner: 'Ops + Safety', updated: '1w ago', updatedAt: '2025-04-30T10:00:00', cleared_for_toolbox: true },
  { id: 'INS-2154', status: 'closed', kind: 'worksite_trend', theme: 'Exclusion signage', title: 'Exclusion zone signage refresh',
    summary: 'Faded signage replaced at three zones following manager support.',
    siteNames: ['Northgate Open Cut'], observationCount: 8, supporterInitials: ['SS', 'KO', 'TM', 'AP'], energyTypes: ['none'], outcome: 'Signage replaced at 3 zones', owner: 'Site services', updated: '2w ago', updatedAt: '2025-04-23T10:00:00', cleared_for_toolbox: true },
  { id: 'INS-2140', status: 'closed', kind: 'worksite_trend', theme: 'Housekeeping', title: 'Fuel bay housekeeping standard rolled out',
    summary: 'Recurring housekeeping gaps at the fuel bay closed out with a new standard, now embedded in the site induction.',
    siteNames: ['Marlow Stockyard'], observationCount: 5, supporterInitials: ['DC'], energyTypes: ['none'], outcome: 'Housekeeping standard rolled out sitewide', owner: 'Site services', updated: '2mo ago', updatedAt: '2025-03-08T10:00:00', cleared_for_toolbox: true },
];

export const INSIGHTS_BY_ID: Record<string, Insight> = Object.fromEntries(INSIGHTS.map((i) => [i.id, i]));

/** True if at least one of the insight's contributing sites satisfies the
 * FULL current purview (region AND division together, on the same site) —
 * a cross-region pattern (e.g. one spanning Pilbara + Goldfields) is visible
 * from every region it touches, not just one "home" region, and from
 * Company regardless. Mixing "site A matches the region, site B matches the
 * division" would be wrong — the purview has to land on one real site. */
export function insightInRegion(insight: Insight, purview: PurviewFilter): boolean {
  return insight.siteNames.some((name) => {
    const site = SITES_BY_ID[SITE_ID_BY_NAME[name]];
    return !!site && inPurview(site, purview);
  });
}
