import type { EnergyType, Observation, SignalType } from '@/types';
import { colors } from '@/tokens';
import { SITE_ID_BY_NAME } from './sites';

export const SIGNAL_DISPLAY: Record<SignalType, { label: string; hue: string }> = {
  positive_performance: { label: 'Positive', hue: colors.green },
  weak_signal: { label: 'Weak signal', hue: colors.amber },
  at_risk_condition: { label: 'At-risk condition', hue: colors.amber },
  unwanted_energy_event: { label: 'Unwanted energy event', hue: colors.red },
  barrier_failure: { label: 'Barrier failure', hue: colors.red },
};

function site(name: string) {
  return { siteId: SITE_ID_BY_NAME[name], siteName: name };
}

export const OBSERVATIONS: Observation[] = [
  { id: 'OB-5821', when: 'Today 09:14', occurredAt: '2025-05-07T09:14:00', ...site('Northgate Open Cut'), observerName: 'Jordan Marsh', summary: 'Spotter not in position when an excavator began reversing near the live haul road — work stopped on the radio.', signal_type: 'barrier_failure', energy_type: 'kinetic', status: 'enriched', cleared_for_sharing: true, sharing_scope: 'region' },
  { id: 'OB-5820', when: 'Today 08:58', occurredAt: '2025-05-07T08:58:00', ...site('Northgate Open Cut'), observerName: 'Jordan Marsh', summary: 'Pre-start walked thoroughly, two housekeeping items raised and actioned before shift.', signal_type: 'positive_performance', energy_type: 'none', status: 'classified', cleared_for_sharing: true, sharing_scope: 'site' },
  { id: 'OB-5819', when: 'Today 08:51', occurredAt: '2025-05-07T08:51:00', ...site('Northgate Open Cut'), observerName: 'K. Lee', summary: 'Water station undersupplied for the forecast 39°C peak — flagged to crib hut.', signal_type: 'weak_signal', energy_type: 'thermal', status: 'classified', cleared_for_sharing: true, sharing_scope: 'site' },
  { id: 'OB-5814', when: 'Yest 15:12', occurredAt: '2025-05-06T15:12:00', ...site('Coolinga Plant'), observerName: 'J. Liang', summary: 'No shaded break observed at the fuel bay during the afternoon heat window.', signal_type: 'weak_signal', energy_type: 'thermal', status: 'linked', cleared_for_sharing: true, sharing_scope: 'region', linkedInsightId: 'INS-2204' },
  { id: 'OB-5810', when: 'Yest 14:38', occurredAt: '2025-05-06T14:38:00', ...site('Coolinga Plant'), observerName: 'D. Whitlock', summary: 'Dozer 4 crew did not rotate at the scheduled hydration break on a 38°C afternoon.', signal_type: 'barrier_failure', energy_type: 'thermal', status: 'linked', cleared_for_sharing: true, sharing_scope: 'region', linkedInsightId: 'INS-2204' },
  { id: 'OB-5807', when: 'Yest 11:02', occurredAt: '2025-05-06T11:02:00', ...site('Ridgeback Processing'), observerName: 'A. Pereira', summary: 'Temperature hit 40°C at 11:00 with no work stop — crew continuing ore loading.', signal_type: 'barrier_failure', energy_type: 'thermal', status: 'linked', cleared_for_sharing: true, sharing_scope: 'region', linkedInsightId: 'INS-2204' },
  { id: 'OB-5801', when: '2d ago', occurredAt: '2025-05-05T00:00:00', ...site('Marlow Stockyard'), observerName: 'D. Cole', summary: 'Crew stopped work to re-position a spotter before reversing — strong example of stop-work culture.', signal_type: 'positive_performance', energy_type: 'kinetic', status: 'classified', cleared_for_sharing: true, sharing_scope: 'site' },
  { id: 'OB-5798', when: '2d ago', occurredAt: '2025-05-05T00:00:00', ...site('Jewell Crusher'), observerName: 'M. Okafor', summary: 'Spotter standing inside the marked exclusion zone during truck reversing at the crusher.', signal_type: 'barrier_failure', energy_type: 'kinetic', status: 'linked', cleared_for_sharing: true, sharing_scope: 'region', linkedInsightId: 'INS-2198' },
  { id: 'OB-5790', when: '4d ago', occurredAt: '2025-05-03T00:00:00', ...site('Brookman Pit 2'), observerName: 'R. Bridges', summary: 'Two pre-starts unsigned at the start of the day shift after handover.', signal_type: 'weak_signal', energy_type: 'none', status: 'classified', cleared_for_sharing: true, sharing_scope: 'site' },
  { id: 'OB-5786', when: '6d ago', occurredAt: '2025-05-01T00:00:00', ...site('Northgate Open Cut'), observerName: 'A. Patel', summary: 'Loader pre-start skipped after the shift handover — caught at the 06:42 walkaround.', signal_type: 'weak_signal', energy_type: 'none', status: 'classified', cleared_for_sharing: true, sharing_scope: 'site' },
];

export function energyLabel(e: EnergyType): string {
  return e === 'none' ? 'Procedural' : e[0].toUpperCase() + e.slice(1);
}
