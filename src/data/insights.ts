import type { Insight } from '@/types';

export const INSIGHTS: Insight[] = [
  {
    id: 'INS-2204', status: 'review', theme: 'Heat management',
    title: 'Heat management plan non-compliance during elevated temperatures',
    summary: 'Heat-plan requirements not applied consistently past threshold temperatures — work continuing without mandatory rest or hydration breaks.',
    siteNames: ['Coolinga Plant', 'Ridgeback Processing', 'Northgate Open Cut'], observationCount: 4, supporterInitials: ['KO', 'TM'],
    energyTypes: ['thermal'], updated: '18m ago', routed: true, cleared_for_toolbox: false,
    cause: 'Temperature monitoring and the trigger to stop work are not clearly assigned during operations — the plan exists but the stop authority is ambiguous in practice.',
    suggested: 'Heat management plan requirements are not being applied consistently during sustained elevated temperatures. Workers are continuing tasks beyond threshold temperatures without mandatory rest or hydration breaks.',
    suggestedBasis: 'Based on 4 observations across Coolinga, Ridgeback and Northgate — all describing work continuing past temperature thresholds. 3 of 4 flagged a degraded thermal barrier.',
    causeBasis: 'Consistent across all 4 observations: work continued because "someone else was supposed to call it."',
    sourceObservations: [
      { quote: 'Crew working through 42°C — no rest break called despite plan threshold of 38°C.', siteName: 'Coolinga Plant', ago: '2d ago' },
      { quote: 'Temperature hit 40°C at 11:00. No work stop. Crew continuing ore loading.', siteName: 'Ridgeback Processing', ago: '4d ago' },
      { quote: 'Heat plan referenced at pre-start but no stop authority named for the shift.', siteName: 'Northgate Open Cut', ago: '6d ago' },
      { quote: 'Hydration breaks skipped during 39°C window — production priority cited.', siteName: 'Coolinga Plant', ago: '9d ago' },
    ],
    fwClassifications: [
      { factor: 'management_systems', domain: 'enable', maturitySignal: 'compliant', confidence: 0.84, rationale: 'The heat plan exists and is referenced, but does not specify who is responsible for calling a work stop — the system content gap is the cause.' },
      { factor: 'operational_management', domain: 'enable', maturitySignal: 'compliant', confidence: 0.72, rationale: 'Managers visiting these sites have not identified or actioned the enforcement ambiguity.' },
    ],
    endorsements: [
      { name: 'Kwame Osei', note: 'Saw the same pattern at Blackrock last summer — this needs a system fix, not individual coaching.' },
      { name: 'Tanya Morrow', note: 'Regional heat plan review is overdue — this is the right trigger.' },
    ],
  },
  { id: 'INS-2201', status: 'review', theme: 'Pre-start checks', title: 'Pre-start checks slipping during shift handovers',
    summary: '7 observations in 14 days, concentrated 06:00–07:00 across loader and dozer crews. Coincides with the last roster change.',
    siteNames: ['Northgate Open Cut', 'Marlow Stockyard', 'Brookman Pit 2'], observationCount: 7, supporterInitials: ['AP', 'MC', 'SR'], energyTypes: ['none'], updated: '1h ago', cleared_for_toolbox: false },
  { id: 'INS-2198', status: 'review', theme: 'Spotter positioning', title: 'Spotter positioning at crusher exclusion zones',
    summary: 'Spotters standing inside marked exclusion at the Jewell crusher during truck reversing — 4 observations across 2 shifts.',
    siteNames: ['Jewell Crusher'], observationCount: 4, supporterInitials: ['NO', 'JL'], energyTypes: ['kinetic'], updated: '3h ago', cleared_for_toolbox: false },
  { id: 'INS-2187', status: 'action', theme: 'Tool tethering', title: 'Tool tethering on elevated walkways',
    summary: 'Unsecured tools observed at height on overhead conveyor walkways across two shifts at Coolinga.',
    siteNames: ['Coolinga Plant'], observationCount: 6, supporterInitials: ['JL', 'TM'], energyTypes: ['gravitational'], step: 'SOP update drafted', owner: 'J. Liang · Safety', updated: '5d ago', cleared_for_toolbox: true },
  { id: 'INS-2179', status: 'action', theme: 'Radio discipline', title: 'Radio handoff protocol at shift change',
    summary: 'New 2-minute radio handoff trialled with the loader crew; rolling out site-wide at Northgate.',
    siteNames: ['Northgate Open Cut'], observationCount: 5, supporterInitials: ['OS', 'KO'], energyTypes: ['none'], step: 'Rolling out site-wide', owner: 'Ops + Safety', updated: '1w ago', cleared_for_toolbox: true },
  { id: 'INS-2154', status: 'closed', theme: 'Exclusion signage', title: 'Exclusion zone signage refresh',
    summary: 'Faded signage replaced at three zones following manager support.',
    siteNames: ['Northgate Open Cut'], observationCount: 8, supporterInitials: ['SS', 'KO', 'TM', 'AP'], energyTypes: ['none'], outcome: 'Signage replaced at 3 zones', owner: 'Site services', updated: '2w ago', cleared_for_toolbox: true },
];

export const INSIGHTS_BY_ID: Record<string, Insight> = Object.fromEntries(INSIGHTS.map((i) => [i.id, i]));
