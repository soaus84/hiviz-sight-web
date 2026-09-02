import type { BarrierFailure, Observation, SeverityClass } from '@/types';
import { SITES_BY_ID, SITE_ID_BY_NAME } from './sites';
import { inPurview, type PurviewFilter } from './purview';
import { pushExternalObservation } from './observations';

// Reconciliation with Hiviz roadmap v1/specs/features/RISK-CONTROLS.md — see
// data/risk.ts for the register-side notes. On the barrier failure side:
//
// - The resolution fork (self-resolve vs needs manager approval) is
//   deliberately structural — driven by the failing control's hazard
//   severity (serious/critical requires approval; minor/moderate doesn't) —
//   not a per-control flag and not a judgment call made at resolution time.
//   This is a product decision made for this prototype, not something
//   RISK-CONTROLS.md itself specifies. It reuses the SeverityClass threshold
//   already established for Incident's auto-severe criterion, on purpose —
//   the same "severity crosses a line -> needs a decision-maker above the
//   field" rule, not a new one invented for Risk.
// - escalateToInsightPipeline below is a real implementation of §6.4's
//   SLA-breach escalation — it pushes a genuine barrier_failure Observation
//   into the shared OBSERVATIONS pool. Manually triggered here (no
//   background clock in a static mock), same simplification already applied
//   to the Incident workspace's systemic cause bridge.

const MOCK_NOW = new Date('2025-05-07T10:00:00');

function requiresApproval(severityClass: SeverityClass): boolean {
  return severityClass === 'serious' || severityClass === 'critical';
}

function site(name: string) {
  return SITES_BY_ID[SITE_ID_BY_NAME[name]];
}

export const BARRIER_FAILURES: BarrierFailure[] = [
  {
    id: 'BF-101', worksiteControlId: 'wc16', siteId: site('Northgate Open Cut').id, siteName: 'Northgate Open Cut',
    controlName: 'Equipment returned to designated storage after use', controlType: 'prevention', hazardName: 'Equipment left out of storage — damage or trip hazard',
    severityClass: 'minor', energyType: 'none', requiresApproval: requiresApproval('minor'),
    flaggedBy: 'James Morrow', when: '3d ago', flaggedAt: '2025-05-04T15:00:00',
    notes: 'Two impact wrenches left on the workshop bench overnight instead of the tool cage.',
    status: 'resolved', resolutionNote: 'Equipment returned to the tool cage and crew reminded at toolbox talk.', resolvedBy: 'James Morrow',
  },
  {
    id: 'BF-102', worksiteControlId: 'wc12', siteId: site('Jewell Crusher').id, siteName: 'Jewell Crusher',
    controlName: 'Spotter confirmed in position for reversing', controlType: 'prevention', hazardName: 'Struck-by — uncontrolled mobile plant movement',
    severityClass: 'critical', energyType: 'kinetic', requiresApproval: requiresApproval('critical'),
    flaggedBy: 'Marcus Okafor', when: '2d ago', flaggedAt: '2025-05-05T09:20:00',
    notes: 'Spotter left position mid-shift to answer a radio call — reversing continued for roughly 10 minutes before it was caught.',
    status: 'open',
  },
  {
    id: 'BF-103', worksiteControlId: 'wc9', siteId: site('Coolinga Plant').id, siteName: 'Coolinga Plant',
    controlName: 'Fire watch confirmed in position', controlType: 'prevention', hazardName: 'Uncontrolled fire — hot work ignition',
    severityClass: 'critical', energyType: 'thermal', requiresApproval: requiresApproval('critical'),
    flaggedBy: 'Jess Liang', when: 'Yesterday', flaggedAt: '2025-05-06T14:00:00',
    notes: 'Fire watch stepped away during a fuel bay hot work task to help with an unrelated task.',
    status: 'pending_approval', resolutionNote: 'Fire watch retrained on the requirement and repositioned; PTW re-briefed to the whole crew before work resumed.', resolvedBy: 'Jess Liang',
  },
  {
    id: 'BF-104', worksiteControlId: 'wc10', siteId: site('Coolinga Plant').id, siteName: 'Coolinga Plant',
    controlName: 'Fall arrest anchor point inspected', controlType: 'prevention', hazardName: 'Fall from height',
    severityClass: 'serious', energyType: 'gravitational', requiresApproval: requiresApproval('serious'),
    flaggedBy: 'Jess Liang', when: '3w ago', flaggedAt: '2025-04-16T09:00:00',
    notes: 'Anchor point inspection tag had expired — no record of re-certification.',
    status: 'resolved', resolutionNote: 'Anchor point re-certified and inspection tag renewed.', resolvedBy: 'R. Bridges',
  },
];

export const BARRIER_FAILURES_BY_ID: Record<string, BarrierFailure> = Object.fromEntries(BARRIER_FAILURES.map((b) => [b.id, b]));

function replaceBarrierFailure(id: string, patch: Partial<BarrierFailure>): BarrierFailure | null {
  const idx = BARRIER_FAILURES.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  const updated: BarrierFailure = { ...BARRIER_FAILURES[idx], ...patch };
  BARRIER_FAILURES[idx] = updated;
  BARRIER_FAILURES_BY_ID[id] = updated;
  return updated;
}

/** open -> resolved. Only valid when the failure doesn't require approval
 * (minor/moderate hazard). */
export function resolveDirectly(id: string, note: string, resolvedBy: string): { failure: BarrierFailure | null; error?: string } {
  const current = BARRIER_FAILURES_BY_ID[id];
  if (!current) return { failure: null, error: 'Barrier failure not found.' };
  if (current.requiresApproval) return { failure: current, error: 'This hazard requires manager approval to resolve.' };
  if (!note.trim()) return { failure: current, error: 'A resolution note is required.' };
  return { failure: replaceBarrierFailure(id, { status: 'resolved', resolutionNote: note.trim(), resolvedBy }) };
}

/** open -> pending_approval. Only valid when the failure requires approval
 * (serious/critical hazard). */
export function submitForApproval(id: string, note: string, submittedBy: string): { failure: BarrierFailure | null; error?: string } {
  const current = BARRIER_FAILURES_BY_ID[id];
  if (!current) return { failure: null, error: 'Barrier failure not found.' };
  if (!current.requiresApproval) return { failure: current, error: 'This hazard can be resolved directly, no approval needed.' };
  if (!note.trim()) return { failure: current, error: 'A resolution note is required.' };
  return { failure: replaceBarrierFailure(id, { status: 'pending_approval', resolutionNote: note.trim(), resolvedBy: submittedBy }) };
}

/** pending_approval -> resolved. */
export function approveResolution(id: string): BarrierFailure | null {
  return replaceBarrierFailure(id, { status: 'resolved' });
}

/** pending_approval -> open. Clears the submitted resolution note — the
 * reason for sending it back is what stays visible, not a half-approved fix. */
export function sendBack(id: string, reason: string): BarrierFailure | null {
  return replaceBarrierFailure(id, { status: 'open', notes: `${BARRIER_FAILURES_BY_ID[id]?.notes ?? ''}\n\nSent back: ${reason}`.trim(), resolutionNote: undefined, resolvedBy: undefined });
}

/** specs/features/RISK-CONTROLS.md §6.4 — SLA-breach escalation. Pushes a
 * real barrier_failure Observation into the shared pool and records the
 * link. Available on any still-open failure; the UI gates this to failures
 * actually past their control's rectification SLA. */
export function escalateToInsightPipeline(id: string): { failure: BarrierFailure | null; observation?: Observation; error?: string } {
  const current = BARRIER_FAILURES_BY_ID[id];
  if (!current) return { failure: null, error: 'Barrier failure not found.' };
  if (current.status !== 'open') return { failure: current, error: 'Only open barrier failures can be escalated.' };
  if (current.linkedObservationId) return { failure: current, error: 'Already escalated.' };

  const obsId = `OB-EXT-${current.id}`;
  const observation: Observation = {
    id: obsId,
    when: 'Just now',
    occurredAt: MOCK_NOW.toISOString(),
    siteId: current.siteId,
    siteName: current.siteName,
    observerName: current.flaggedBy,
    summary: `${current.controlName} not in place, unresolved past SLA — ${current.hazardName}.`,
    signal_type: 'barrier_failure',
    energy_type: current.energyType,
    status: 'enriched',
    cleared_for_sharing: true,
    sharing_scope: 'region',
  };
  pushExternalObservation(observation);
  const updated = replaceBarrierFailure(id, { linkedObservationId: obsId });
  return { failure: updated, observation };
}

export function barrierFailureInRegion(failure: BarrierFailure, purview: PurviewFilter): boolean {
  const s = SITES_BY_ID[failure.siteId];
  return !!s && inPurview(s, purview);
}
