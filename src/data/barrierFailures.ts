import type { BarrierFailure, SeverityClass } from '@/types';
import { SITES_BY_ID, SITE_ID_BY_NAME } from './sites';
import { inPurview, type PurviewFilter } from './purview';

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
// - §6.4's SLA-breach escalation (a manual "push this one to Insight" action)
//   was deliberately removed, not just left unbuilt — a single barrier
//   failure sitting past SLA isn't itself a pattern. The right home for
//   that signal is algorithmic: data/risk.ts's computeWorkTypeRisk already
//   aggregates barrier-failure + incident history into a risk rating; a
//   real systemic-pattern Insight should eventually be sourced from that
//   crossing a threshold, not from a person manually flagging one record.
// - The manager-facing surface (Focus's "Critical Barrier Failures") only
//   ever shows `review` status — see data/myWorkspace.ts's stocktake note.
//   `open` and `returned` are both the site's turn, not the manager's.

// Exported — data/stopWork.ts reuses this exact rule for its own resume
// gate, on purpose: same "severity crosses a line -> needs a decision-maker
// above the field" threshold, not a fourth version of it.
export function requiresApproval(severityClass: SeverityClass): boolean {
  return severityClass === 'serious' || severityClass === 'critical';
}

function site(name: string) {
  return SITES_BY_ID[SITE_ID_BY_NAME[name]];
}

export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export const BARRIER_FAILURES: BarrierFailure[] = [
  {
    id: 'BF-101', worksiteControlId: 'wc16', siteId: site('Northgate Open Cut').id, siteName: 'Northgate Open Cut',
    controlName: 'Equipment returned to designated storage after use', controlType: 'prevention', hazardName: 'Equipment left out of storage — damage or trip hazard',
    severityClass: 'minor', energyType: 'none', requiresApproval: requiresApproval('minor'),
    flaggedBy: 'James Morrow', when: '3d ago', flaggedAt: '2025-05-04T15:00:00',
    notes: 'Two impact wrenches left on the workshop bench overnight instead of the tool cage.',
    status: 'resolved', resolutionNote: 'Equipment returned to the tool cage and crew reminded at toolbox talk.', resolvedBy: 'James Morrow',
    rounds: [{ kind: 'submitted', by: 'James Morrow', at: '2025-05-04T16:00:00', note: 'Equipment returned to the tool cage and crew reminded at toolbox talk.' }],
  },
  {
    id: 'BF-102', worksiteControlId: 'wc12', siteId: site('Jewell Crusher').id, siteName: 'Jewell Crusher',
    controlName: 'Spotter confirmed in position for reversing', controlType: 'prevention', hazardName: 'Struck-by — uncontrolled mobile plant movement',
    severityClass: 'critical', energyType: 'kinetic', requiresApproval: requiresApproval('critical'),
    flaggedBy: 'Marcus Okafor', when: '2d ago', flaggedAt: '2025-05-05T09:20:00',
    notes: 'Spotter left position mid-shift to answer a radio call — reversing continued for roughly 10 minutes before it was caught.',
    status: 'open', rounds: [],
    stopWorkWarranted: true, stopWorkWarrantedRationale: 'Spotter absent while reversing continued — a live struck-by exposure, not yet contained.', stopWorkCalled: false,
  },
  {
    id: 'BF-103', worksiteControlId: 'wc9', siteId: site('Coolinga Plant').id, siteName: 'Coolinga Plant',
    controlName: 'Fire watch confirmed in position', controlType: 'prevention', hazardName: 'Uncontrolled fire — hot work ignition',
    severityClass: 'critical', energyType: 'thermal', requiresApproval: requiresApproval('critical'),
    flaggedBy: 'Jess Liang', when: 'Yesterday', flaggedAt: '2025-05-06T14:00:00',
    notes: 'Fire watch stepped away during a fuel bay hot work task to help with an unrelated task.',
    status: 'review', resolutionNote: 'Fire watch retrained on the requirement and repositioned; PTW re-briefed to the whole crew before work resumed.', resolvedBy: 'Jess Liang',
    rounds: [{ kind: 'submitted', by: 'Jess Liang', at: '2025-05-06T14:30:00', note: 'Fire watch retrained on the requirement and repositioned; PTW re-briefed to the whole crew before work resumed.' }],
  },
  {
    id: 'BF-104', worksiteControlId: 'wc10', siteId: site('Coolinga Plant').id, siteName: 'Coolinga Plant',
    controlName: 'Fall arrest anchor point inspected', controlType: 'prevention', hazardName: 'Fall from height',
    severityClass: 'serious', energyType: 'gravitational', requiresApproval: requiresApproval('serious'),
    flaggedBy: 'Jess Liang', when: '3w ago', flaggedAt: '2025-04-16T09:00:00',
    notes: 'Anchor point inspection tag had expired — no record of re-certification.',
    // Demonstrates the loop: submitted once, sent back with a specific
    // direction (not rejected outright — a real "this, plus one more thing"
    // case, per the exact scenario that prompted adding `returned`), now
    // sitting with the site again, not a fresh manager decision.
    status: 'returned', resolutionNote: 'Anchor point re-certified and inspection tag renewed.', resolvedBy: 'R. Bridges',
    rounds: [
      { kind: 'submitted', by: 'R. Bridges', at: '2025-04-16T11:00:00', note: 'Anchor point re-certified and inspection tag renewed.' },
      { kind: 'returned', by: 'Priya Singh', at: '2025-04-16T15:00:00', note: 'Good — but confirm the same inspection gap doesn’t exist on the other anchor points on this gantry before I sign off.' },
    ],
  },
  // BF-105/106 round out the minor/moderate, resolves-directly end of the
  // pool — every other seed record here is serious/critical, which reads
  // honestly for a critical-control-verification program (most controls in
  // this register guard serious/critical hazards by design) but left the
  // routine "Barrier Failures" list with a single record. These are the same
  // housekeeping-type control as BF-101 (cc16 — see risk.ts's wc17/wc18),
  // just at the two sites that otherwise had zero Risk-workspace presence.
  {
    id: 'BF-105', worksiteControlId: 'wc17', siteId: site('Marlow Stockyard').id, siteName: 'Marlow Stockyard',
    controlName: 'Equipment returned to designated storage after use', controlType: 'prevention', hazardName: 'Equipment left out of storage — damage or trip hazard',
    severityClass: 'minor', energyType: 'none', requiresApproval: requiresApproval('minor'),
    flaggedBy: 'D. Cole', when: '5d ago', flaggedAt: '2025-05-02T08:00:00',
    notes: 'Loading chute maintenance kit left at the base of the stacker instead of the site lockup overnight.',
    status: 'resolved', resolutionNote: 'Kit returned to the lockup; shift handover checklist updated to include a lockup check.', resolvedBy: 'D. Cole',
    rounds: [{ kind: 'submitted', by: 'D. Cole', at: '2025-05-02T09:00:00', note: 'Kit returned to the lockup; shift handover checklist updated to include a lockup check.' }],
  },
  {
    id: 'BF-106', worksiteControlId: 'wc18', siteId: site('Brookman Pit 2').id, siteName: 'Brookman Pit 2',
    controlName: 'Equipment returned to designated storage after use', controlType: 'prevention', hazardName: 'Equipment left out of storage — damage or trip hazard',
    severityClass: 'minor', energyType: 'none', requiresApproval: requiresApproval('minor'),
    flaggedBy: 'R. Bridges', when: 'Today', flaggedAt: '2025-05-07T07:30:00',
    notes: 'Grade control drill rods left stacked beside the haul road instead of the designated rod rack.',
    status: 'open', rounds: [],
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
 * (minor/moderate hazard) — no manager ever sees these. */
export function resolveDirectly(id: string, note: string, resolvedBy: string): { failure: BarrierFailure | null; error?: string } {
  const current = BARRIER_FAILURES_BY_ID[id];
  if (!current) return { failure: null, error: 'Barrier failure not found.' };
  if (current.requiresApproval) return { failure: current, error: 'This hazard requires manager approval to resolve.' };
  if (!note.trim()) return { failure: current, error: 'A resolution note is required.' };
  return {
    failure: replaceBarrierFailure(id, {
      status: 'resolved', resolutionNote: note.trim(), resolvedBy,
      rounds: [...current.rounds, { kind: 'submitted', by: resolvedBy, at: new Date().toISOString(), note: note.trim() }],
    }),
  };
}

/** open|returned -> review. Same action either way — first submission or a
 * resubmission after being returned — the difference is only in what the
 * UI asks for (see BarrierFailureDetail.tsx): a full account of what was
 * done the first time, a lighter confirmation against the manager's own
 * stated direction after a return, not a fresh essay each round. */
export function submitForReview(id: string, note: string, submittedBy: string): { failure: BarrierFailure | null; error?: string } {
  const current = BARRIER_FAILURES_BY_ID[id];
  if (!current) return { failure: null, error: 'Barrier failure not found.' };
  if (!current.requiresApproval) return { failure: current, error: 'This hazard can be resolved directly, no approval needed.' };
  if (!note.trim()) return { failure: current, error: 'A note is required.' };
  return {
    failure: replaceBarrierFailure(id, {
      status: 'review', resolutionNote: note.trim(), resolvedBy: submittedBy,
      rounds: [...current.rounds, { kind: 'submitted', by: submittedBy, at: new Date().toISOString(), note: note.trim() }],
    }),
  };
}

/** review -> resolved. */
export function approve(id: string, approvedBy: string): BarrierFailure | null {
  const current = BARRIER_FAILURES_BY_ID[id];
  if (!current) return null;
  return replaceBarrierFailure(id, { status: 'resolved', rounds: [...current.rounds, { kind: 'approved', by: approvedBy, at: new Date().toISOString() }] });
}

/** review -> returned. Not capped — a manager can send the same failure
 * back more than once if a resubmission genuinely isn't adequate — but see
 * sentBackCount below for making repeat rounds visible rather than letting
 * them silently look identical to a first-time review. */
export function returnForRevision(id: string, direction: string, returnedBy: string): BarrierFailure | null {
  const current = BARRIER_FAILURES_BY_ID[id];
  if (!current) return null;
  return replaceBarrierFailure(id, { status: 'returned', rounds: [...current.rounds, { kind: 'returned', by: returnedBy, at: new Date().toISOString(), note: direction.trim() }] });
}

/** How many times this has been sent back — the thing that makes a 3rd-round
 * review read differently from a 1st-round one, since `status` alone can't
 * tell them apart (it's `'review'` either way). */
export function sentBackCount(b: BarrierFailure): number {
  return b.rounds.filter((r) => r.kind === 'returned').length;
}

/** Stamps the fields a new StopWorkEvent is created alongside — called only
 * from data/stopWork.ts's callStopWork, mirroring markIncidentStopWorkCalled. */
export function markBarrierFailureStopWorkCalled(id: string, stopWorkEventId: string): BarrierFailure | null {
  return replaceBarrierFailure(id, { stopWorkCalled: true, stopWorkEventId });
}

/** The warranted-but-not-called divergence, judged not to need a stop —
 * mirrors dismissIncidentStopWork. */
export function dismissBarrierFailureStopWork(id: string, dismissedBy: string, note: string): BarrierFailure | null {
  return replaceBarrierFailure(id, { stopWorkDismissedBy: dismissedBy, stopWorkDismissedAt: new Date().toISOString(), stopWorkDismissedNote: note });
}

export function barrierFailureInRegion(failure: BarrierFailure, purview: PurviewFilter): boolean {
  const s = SITES_BY_ID[failure.siteId];
  return !!s && inPurview(s, purview);
}

/** Which of the two Barrier Failures pages (routine vs Critical) a given
 * record lives on — severity is fixed for the life of a record (never
 * reassigned by any mutator above), so this never has to react to a status
 * change, only ever be computed from `requiresApproval`. Every call site
 * that links to a barrier failure by id should go through this rather than
 * hardcoding `/risk/barrier-failures/${id}`, since a link built for the
 * wrong page would resolve the record (BARRIER_FAILURES_BY_ID doesn't care)
 * but drop it from that page's severity-filtered list. */
export function barrierFailurePath(b: Pick<BarrierFailure, 'id' | 'requiresApproval'>): string {
  return b.requiresApproval ? `/risk/critical-barrier-failures/${b.id}` : `/risk/barrier-failures/${b.id}`;
}
