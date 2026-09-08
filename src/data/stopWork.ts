import type { StopWorkEvent, SeverityClass } from '@/types';
import { INCIDENTS_BY_ID, markIncidentStopWorkCalled, dismissIncidentStopWork } from './incidents';
import { requiresApproval, BARRIER_FAILURES_BY_ID, markBarrierFailureStopWorkCalled, dismissBarrierFailureStopWork } from './barrierFailures';
import { SITES_BY_ID } from './sites';
import { inPurview, type PurviewFilter } from './purview';

type SourceKind = 'incident' | 'barrierFailure';

// A StopWorkEvent asks a different question than a BarrierFailure does —
// "is it safe to resume the broader work" rather than "is this one
// registered control back in place" — so it's its own record, not folded
// into either source. The two can coexist on the same underlying event
// without either one carrying weight it wasn't built for.
//
// The "was a stop warranted, was it called" decision never gets its own
// record at all — it's answered directly on the Incident or BarrierFailure
// (stopWorkWarranted/stopWorkCalled/stopWorkDismissedBy* — types/incident.ts,
// types/risk.ts). A StopWorkEvent is only ever created at the moment a stop
// is actually called:
// - The reporter/supervisor already called it at capture time
//   (stopWorkCalled: true) -> the event is born straight into 'stopped'.
//   Work already stopped in the moment; nothing to request or confirm.
// - A manager calls it off the warranted-but-not-called divergence (or
//   upgrades one already called) -> callStopWork creates it in
//   'pending_stop'. If instead a manager judges no stop is warranted, that's
//   dismissStopWorkWarning — recorded on the source directly, no event ever
//   created. Both exits matter: without the dismiss path, every AI flag
//   would be a forced escalation, the same funnel-vs-fork mistake Insight
//   and Incident's own review stages already avoid.
//
// This also means a manager never has to manage the same real-world event
// on two separate surfaces: the "should we stop" decision lives on the
// source's own screen (SevereIncidentReview.tsx / IncidentDetail.tsx /
// BarrierFailureDetail.tsx), and only once a stop is genuinely happening
// does it become its own trackable thing here — a different, later
// decision ("is it now safe to resume"), not a duplicate of the first.
//
// pending_stop is deliberately its own visible stage, not folded into
// 'stopped': a manager requesting a stop isn't the same as the stop having
// actually happened — someone on site still has to execute it — and
// *assuming* it happened is a safety failure, not just a bookkeeping gap.
// The equivalent gap on the resume side doesn't get the same treatment:
// resuming stays folded inside 'stopped' as a single gated action, because
// assuming a resume happened promptly after approval is, worst case, a
// production-time cost, not a safety risk. Approval reuses BarrierFailure's
// exact severity threshold for the same reason it's reused a third time —
// same "severity crosses a line -> needs a decision-maker above the field"
// rule, not a fourth version of it — but it's a condition on who can click
// Resume, not a status of its own.

function sourceFieldsFor(kind: SourceKind, id: string): { siteId: string; siteName: string; workType: string; severityClass: SeverityClass } {
  if (kind === 'incident') {
    const i = INCIDENTS_BY_ID[id];
    return { siteId: i.siteId, siteName: i.siteName, workType: i.workType, severityClass: i.severityClass };
  }
  const b = BARRIER_FAILURES_BY_ID[id];
  // BarrierFailure has no work-type taxonomy of its own — the failed
  // control is the closest equivalent to "what this stop is about".
  return { siteId: b.siteId, siteName: b.siteName, workType: b.controlName, severityClass: b.severityClass };
}

function warrantedRationaleFor(kind: SourceKind, id: string): string | undefined {
  return kind === 'incident' ? INCIDENTS_BY_ID[id].stopWorkWarrantedRationale : BARRIER_FAILURES_BY_ID[id].stopWorkWarrantedRationale;
}

function fromIncident(incidentId: string) {
  return { sourceKind: 'incident' as const, sourceId: incidentId, ...sourceFieldsFor('incident', incidentId) };
}

// Seed ids aren't necessarily dense (SW-2/SW-4 were retired when the review/
// dismissed stages moved off StopWorkEvent entirely) — next id is the
// highest existing numeric suffix + 1, not the array length, so a newly
// created event can never collide with one already seeded.
function nextStopWorkId(): string {
  const max = STOP_WORK_EVENTS.reduce((m, e) => {
    const n = Number(e.id.replace('SW-', ''));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `SW-${max + 1}`;
}

/** Action timestamps here are real wall-clock time (new Date() at the
 * moment of the action), not authored against MOCK_NOW like the rest of
 * this mock's seed data — so a relative "2d ago" style doesn't apply
 * honestly. A plain absolute stamp instead. */
export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export const STOP_WORK_EVENTS: StopWorkEvent[] = [
  {
    id: 'SW-1', status: 'stopped', ...fromIncident('INC-4320'), siteWide: true,
    confirmedBy: 'Marcus Okafor', confirmedAt: '2025-04-16T09:05:00',
    requiresApproval: requiresApproval(INCIDENTS_BY_ID['INC-4320'].severityClass),
  },
  {
    id: 'SW-3', status: 'resumed', ...fromIncident('INC-4375'),
    confirmedBy: 'A. Pereira', confirmedAt: '2025-05-05T13:05:00',
    requiresApproval: requiresApproval(INCIDENTS_BY_ID['INC-4375'].severityClass),
    resumedBy: 'A. Pereira', resumedAt: '2025-05-05T15:30:00',
    resumeNote: 'Area barricaded, damaged guarding replaced and inspected before resuming.',
  },
];

export const STOP_WORK_EVENTS_BY_ID: Record<string, StopWorkEvent> = Object.fromEntries(STOP_WORK_EVENTS.map((e) => [e.id, e]));

function replaceStopWorkEvent(id: string, patch: Partial<StopWorkEvent>): StopWorkEvent | null {
  const idx = STOP_WORK_EVENTS.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const updated: StopWorkEvent = { ...STOP_WORK_EVENTS[idx], ...patch };
  STOP_WORK_EVENTS[idx] = updated;
  STOP_WORK_EVENTS_BY_ID[id] = updated;
  return updated;
}

/** Creates a StopWorkEvent at the moment a manager actually calls a stop —
 * off the warranted-but-not-called divergence on an Incident or
 * BarrierFailure, the only way one gets created for that case. Stamps the
 * source with stopWorkCalled/stopWorkEventId so its own screen collapses
 * from the decision fork to a status link-through. siteWide is always the
 * manager's own explicit call here, never inferred. */
export function callStopWork(sourceKind: SourceKind, sourceId: string, requestedBy: string, siteWide: boolean, requestNote?: string): StopWorkEvent {
  const src = sourceFieldsFor(sourceKind, sourceId);
  const id = nextStopWorkId();
  const event: StopWorkEvent = {
    id, status: 'pending_stop', sourceKind, sourceId, siteWide,
    ...src, warrantedRationale: warrantedRationaleFor(sourceKind, sourceId),
    requestedBy, requestedAt: new Date().toISOString(), requestNote,
    requiresApproval: requiresApproval(src.severityClass),
  };
  STOP_WORK_EVENTS.push(event);
  STOP_WORK_EVENTS_BY_ID[id] = event;
  if (sourceKind === 'incident') markIncidentStopWorkCalled(sourceId, id);
  else markBarrierFailureStopWorkCalled(sourceId, id);
  return event;
}

/** The warranted-but-not-called divergence, judged not to need a stop — no
 * StopWorkEvent is ever created for this exit, so it's recorded directly on
 * the source (Incident or BarrierFailure). */
export function dismissStopWorkWarning(sourceKind: SourceKind, sourceId: string, dismissedBy: string, note: string): void {
  if (sourceKind === 'incident') dismissIncidentStopWork(sourceId, dismissedBy, note);
  else dismissBarrierFailureStopWork(sourceId, dismissedBy, note);
}

/** pending_stop -> stopped. The site confirming the request actually happened. */
export function confirmStopped(id: string, confirmedBy: string): StopWorkEvent | null {
  return replaceStopWorkEvent(id, { status: 'stopped', confirmedBy, confirmedAt: new Date().toISOString() });
}

/** stopped -> resumed. One transition regardless of requiresApproval — that
 * flag only changes what the UI asks for (any name vs a manager's) before
 * enabling this, not a separate pipeline stage to pass through. */
export function resume(id: string, resumedBy: string, note: string): StopWorkEvent | null {
  return replaceStopWorkEvent(id, { status: 'resumed', resumedBy, resumedAt: new Date().toISOString(), resumeNote: note });
}

export function stopWorkEventInRegion(e: StopWorkEvent, purview: PurviewFilter): boolean {
  const s = SITES_BY_ID[e.siteId];
  return !!s && inPurview(s, purview);
}
