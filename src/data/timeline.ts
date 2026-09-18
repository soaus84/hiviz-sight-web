import type { TimelineEvent, TimelineContext, TimelineContextKind, ControlRecommendationType, FwFactor } from '@/types';
import { CRITICAL_CONTROLS_BY_ID } from './risk';

// The Investigation timeline — see [[project_investigation_timeline]] for
// the full design discussion. No lifecycle/status on an event itself
// (unlike WorkStream's draft/live/completed) — while the investigation is
// open, events are just directly editable/removable, no publish step.
//
// 2026-09-15: the standalone Finding entity (data/findings.ts, now deleted)
// was folded into TimelineContext itself — a context tag with a
// `recommendation` *is* a finding now, intrinsically linked to the one
// event it's on (see TimelineContext's own doc comment, types/timeline.ts,
// and views/incidents/findingsView.ts's deriveFindings). The two old
// FIND-1/FIND-2 (INV-3098) and FIND-3 (INV-3101) seed records are now just
// `recommendation` values on the matching context entries below.

export const TIMELINE_EVENTS: TimelineEvent[] = [
  // INV-3098 — Jewell Crusher fatality (closed). A full, read-only
  // demonstration timeline: normal work leading into two real control
  // failures (cc6, cc7 — both already named in this investigation's own
  // contributing factors) and a partial recovery (cc8) that came too late.
  { id: 'TL-1', investigationId: 'INV-3098', at: '2025-04-16T08:45:00', description: 'Shift handover completed; incoming crew briefed on haul routes for the shift.',
    context: [{ id: 'TLC-1', kind: 'normal_work' }], createdBy: 'Marcus Okafor', createdAt: '2025-04-23T10:00:00' },
  { id: 'TL-2', investigationId: 'INV-3098', at: '2025-04-16T08:58:00', description: 'Contractor walked toward the crusher exclusion boundary to check stockpile levels.',
    context: [{ id: 'TLC-2', kind: 'normal_work' }], createdBy: 'Marcus Okafor', createdAt: '2025-04-23T10:00:00' },
  { id: 'TL-3', investigationId: 'INV-3098', at: '2025-04-16T08:59:00', description: 'Haul truck began reversing toward the crusher with no spotter confirmed in position first.',
    context: [{ id: 'TLC-3', kind: 'failure', controlId: 'cc6', controlName: 'Spotter confirmed in position for reversing', controlRecommendationType: 'improve_control', recommendation: 'Fit proximity detection or collision-avoidance technology at this boundary so reversing doesn’t depend on a spotter being remembered and present every time — a re-confirmation step at handover is a reasonable stopgap, not the fix.' }], createdBy: 'Marcus Okafor', createdAt: '2025-04-23T10:00:00' },
  { id: 'TL-4', investigationId: 'INV-3098', at: '2025-04-16T08:59:00', description: 'Contractor was standing inside the marked exclusion zone, which relies on signage only with no physical barrier.',
    context: [{ id: 'TLC-4', kind: 'failure', controlId: 'cc7', controlName: 'Exclusion zone barricaded' }], createdBy: 'Marcus Okafor', createdAt: '2025-04-23T10:00:00' },
  { id: 'TL-5', investigationId: 'INV-3098', at: '2025-04-16T09:00:00', description: 'Reversing alarm sounded; a nearby worker heard it and shouted a warning toward the contractor.',
    context: [{ id: 'TLC-5', kind: 'recovery', controlId: 'cc8', controlName: 'Reversing alarm functional', note: 'Sounded and was heard, but too late for the contractor to react.' }], createdBy: 'Marcus Okafor', createdAt: '2025-04-23T10:00:00' },
  { id: 'TL-6', investigationId: 'INV-3098', at: '2025-04-16T09:00:30', description: 'Truck made contact with the contractor before the warning could be acted on. Operator stopped immediately and raised the alarm.',
    context: [{ id: 'TLC-6', kind: 'deviation', expectedBehavior: 'The reversing alarm and spotter confirmation should have stopped the truck before contact was made.', influence: 'Both the spotter check and the exclusion barrier were already known gaps — the truck reversed into a zone that had no functioning layer left to stop it.' }], createdBy: 'Marcus Okafor', createdAt: '2025-04-23T10:00:00' },
  // A systemic "decision" event, not a moment in the incident sequence
  // itself — exact date isn't known/meaningful, only that it predates the
  // incident, hence timeUnknown. Demonstrates the workshop's own example:
  // a decision made in the past can be a timeline event in its own right.
  // Carries the recommendation for the cc7 gap (TL-4's own cc7 tag doesn't
  // repeat it — same underlying finding, one place to read the fix).
  { id: 'TL-9', investigationId: 'INV-3098', at: '2025-03-01T00:00:00', timeUnknown: true, description: 'Decision made to defer installing a physical exclusion barrier at this boundary in favour of signage, citing budget prioritisation.',
    context: [{ id: 'TLC-9', kind: 'failure', controlId: 'cc7', controlName: 'Exclusion zone barricaded', controlRecommendationType: 'improve_control', note: 'A known, deliberately deferred gap rather than an unnoticed one.', recommendation: 'Install a physical barrier at the crusher exclusion boundary; revisit the budget decision that deferred it.' }], createdBy: 'Marcus Okafor', createdAt: '2025-04-23T10:00:00' },

  // INV-3101 — tailgate pin (open). Lighter, still-being-built timeline —
  // no hazard/control in the current Risk register maps to manual handling
  // of this kind. TL-8 deliberately has no context yet, to demonstrate that
  // an event can be logged before it's classified.
  { id: 'TL-7', investigationId: 'INV-3101', at: '2025-04-30T08:50:00', description: 'Tailgate pin failed to release using the normal opening lever.',
    context: [
      { id: 'TLC-7', kind: 'deviation', expectedBehavior: 'The pin should release cleanly using the standard lever without requiring additional force.', influence: 'No scheduled lubrication exists for this pin, so it seizing was a matter of time, not a one-off.' },
      {
        id: 'TLC-10', kind: 'systemic', fwFactor: 'management_systems',
        contribution: 'Crews resorted to manual force to free the pin because no pin-release tool or lubrication schedule existed for this trailer type.',
        origin: 'Maintenance planning never accounted for this tailgate model needing scheduled pin lubrication, so the gap was never caught before it became routine.',
        confidence: 0.8, leadsToInsight: true,
        recommendation: 'Issue a pin-release tool to haul crews and add pin lubrication to the scheduled maintenance program.',
      },
      // No CriticalControl in the register covers "a tool is available to
      // release a seized tailgate pin without manual force" — a genuine
      // register gap, not an existing control that failed, so this is the
      // 'new_control' case (controlId unset, controlName is the
      // investigator's own free-text description) rather than 'improve_control'.
      {
        id: 'TLC-15', kind: 'failure', controlRecommendationType: 'new_control',
        controlName: 'Pin-release tool fitted as standard kit on this trailer type',
        recommendation: 'Mount a pin-release tool as permanent, standard kit on every truck running this trailer type, rather than relying on a pre-shift check to catch its absence — removes the failure mode instead of just checking for it.',
      },
    ], createdBy: 'R. Bridges', createdAt: '2025-04-30T09:30:00' },
  { id: 'TL-8', investigationId: 'INV-3101', at: '2025-04-30T08:52:00', description: 'Crew member applied manual force directly to free the pin, straining their shoulder in the process.',
    context: [], createdBy: 'R. Bridges', createdAt: '2025-04-30T09:30:00' },

  // INV-3095 — Coolinga gantry walkway fall (closed). No CriticalControl in
  // the current Risk register genuinely fits "guarding reinstated after
  // maintenance" (hz5's own cc14/cc15 are fall-arrest-harness controls, a
  // different bowtie layer to a missing physical guard — matches the source
  // Incident's own barrierAssessment: 'barrier_absent', not 'barrier_failed')
  // — so this timeline stays uncontrolled, told through deviation + systemic
  // tags only, same approach as INV-3101's tooling gap.
  { id: 'TL-10', investigationId: 'INV-3095', at: '2025-01-01T00:00:00', timeUnknown: true, description: 'The gantry maintenance work order template was set up with no mandatory step confirming guarding is reinstated before a walkway returns to service.',
    context: [{
      id: 'TLC-11', kind: 'systemic', fwFactor: 'management_systems',
      contribution: 'The work order template had no checklist step requiring guarding to be confirmed reinstated before sign-off, so the missing handrail wasn’t caught before the walkway reopened.',
      origin: 'The maintenance work order template was authored without a review step for barrier-critical tasks, so a guarding-reinstatement check was never designed in.',
      confidence: 0.85, leadsToInsight: true,
      recommendation: 'Redesign the gantry work order so guarding reinstatement must be verified by a second person before a walkway can be signed off — a checklist line can be ticked without being checked; a required verification step can’t.',
    }], createdBy: 'Jess Liang', createdAt: '2025-04-04T10:00:00' },
  { id: 'TL-11', investigationId: 'INV-3095', at: '2025-03-31T07:30:00', description: 'Maintenance crew removed a section of gantry handrail to access the walkway support strut under an approved work permit.',
    context: [{ id: 'TLC-12', kind: 'normal_work' }], createdBy: 'Jess Liang', createdAt: '2025-04-04T10:00:00' },
  { id: 'TL-12', investigationId: 'INV-3095', at: '2025-03-31T15:45:00', description: 'The work order was signed off as complete and the walkway reopened without the handrail section being reinstated.',
    context: [{ id: 'TLC-13', kind: 'deviation', expectedBehavior: 'The handrail section should have been reinstated and inspected before the work order was signed off and the walkway reopened.', influence: 'The work order template has no explicit checklist step forcing a guarding-reinstated check before sign-off, so the gap wasn’t caught at review.' }], createdBy: 'Jess Liang', createdAt: '2025-04-04T10:00:00' },
  { id: 'TL-13', investigationId: 'INV-3095', at: '2025-04-02T09:00:00', description: 'Crew member stepped onto the unguarded section of walkway during a routine round and fell, sustaining a fractured ankle.',
    context: [{ id: 'TLC-14', kind: 'deviation', expectedBehavior: 'The walkway should have been fully guarded and safe to use as a routine access route.', influence: 'The missing handrail section wasn’t barricaded or signed after reopening, so it looked like a normal, safe walkway.' }], createdBy: 'Jess Liang', createdAt: '2025-04-04T10:00:00' },
];

export const TIMELINE_EVENTS_BY_ID: Record<string, TimelineEvent> = Object.fromEntries(TIMELINE_EVENTS.map((e) => [e.id, e]));

let nextEventSeq = 14;
let nextContextSeq = 16;

export function timelineForInvestigation(investigationId: string): TimelineEvent[] {
  return TIMELINE_EVENTS.filter((e) => e.investigationId === investigationId).sort((a, b) => a.at.localeCompare(b.at));
}

function replaceEvent(id: string, patch: Partial<TimelineEvent>): TimelineEvent | null {
  const idx = TIMELINE_EVENTS.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const updated: TimelineEvent = { ...TIMELINE_EVENTS[idx], ...patch };
  TIMELINE_EVENTS[idx] = updated;
  TIMELINE_EVENTS_BY_ID[id] = updated;
  return updated;
}

/** Creates immediately (no draft state to speak of, unlike WorkStream) —
 * "+ Add event" calls this straight away and opens the new record in the
 * drawer for editing, same as createWorkStream does for a new stream. */
export function addTimelineEvent(params: { investigationId: string; at: string; description: string; createdBy: string }): TimelineEvent {
  const id = `TL-${nextEventSeq++}`;
  const event: TimelineEvent = { id, investigationId: params.investigationId, at: params.at, description: params.description, context: [], createdBy: params.createdBy, createdAt: new Date().toISOString() };
  TIMELINE_EVENTS.push(event);
  TIMELINE_EVENTS_BY_ID[id] = event;
  return event;
}

export function updateTimelineEvent(id: string, patch: { at?: string; description?: string; timeUnknown?: boolean }): TimelineEvent | null {
  return replaceEvent(id, patch);
}

/** "Populate with Hiviz suggestions" for the timeline — one real event per
 * InvestigationAssistFields.aiSuggestedTimelineEvents entry, marked
 * `populatedByHiviz`. `at` is caller-supplied (the "now" the investigator
 * opened the drawer at, same as addTimelineEvent) since the AI genuinely
 * doesn't know a real time for a suggestion like this — `timeUnknown` is
 * always set to reflect that honestly, matching the "decision as an event"
 * convention TimelineEvent already has. A `contextKind` on the suggestion
 * becomes one context tag immediately (controlName resolved and cached from
 * the real register, same as addTimelineContext) — never required, since
 * the mocked job can't always classify what it's suggesting. */
export function populateEventFromAssist(params: { investigationId: string; at: string; description: string; contextKind?: TimelineContextKind; controlId?: string; fwFactor?: FwFactor; createdBy: string }): TimelineEvent {
  const id = `TL-${nextEventSeq++}`;
  const control = params.controlId ? CRITICAL_CONTROLS_BY_ID[params.controlId] : undefined;
  const context: TimelineContext[] = params.contextKind
    ? [{ id: `TLC-${nextContextSeq++}`, kind: params.contextKind, controlId: params.controlId, controlName: control?.name, fwFactor: params.fwFactor }]
    : [];
  const event: TimelineEvent = {
    id, investigationId: params.investigationId, at: params.at, timeUnknown: true,
    description: params.description, context, populatedByHiviz: true,
    createdBy: params.createdBy, createdAt: new Date().toISOString(),
  };
  TIMELINE_EVENTS.push(event);
  TIMELINE_EVENTS_BY_ID[id] = event;
  return event;
}

export function removeTimelineEvent(id: string): void {
  const idx = TIMELINE_EVENTS.findIndex((e) => e.id === id);
  if (idx === -1) return;
  TIMELINE_EVENTS.splice(idx, 1);
  delete TIMELINE_EVENTS_BY_ID[id];
}

/** Adds a fully-specified context tag in one call now — 2026-09-15's redesign
 * gave each kind its own fields (expectedBehavior/influence for 'deviation',
 * fwFactor for 'systemic', recommendation for 'failure'/'systemic', per
 * TimelineContext's own doc comment), all captured up front on
 * ContextDrawer.tsx's create form rather than added piecemeal. Resolves
 * controlName from the real Risk register at creation, cached from there on,
 * same convention as BarrierFailure.controlName. */
export interface TimelineContextFields {
  controlId?: string;
  /** Free-text control description — only meaningful when `controlId` is
   * unset (the 'new_control' recommendation case, see
   * TimelineContext.controlRecommendationType's own doc comment); a real
   * `controlId` always wins and resolves `controlName` from the register
   * instead. */
  controlName?: string;
  controlRecommendationType?: ControlRecommendationType;
  expectedBehavior?: string;
  influence?: string;
  fwFactor?: FwFactor;
  note?: string;
  contribution?: string;
  origin?: string;
  confidence?: number;
  leadsToInsight?: boolean;
  recommendation?: string;
}

export function addTimelineContext(eventId: string, kind: TimelineContextKind, opts?: TimelineContextFields): TimelineEvent | null {
  const current = TIMELINE_EVENTS_BY_ID[eventId];
  if (!current) return null;
  const control = opts?.controlId ? CRITICAL_CONTROLS_BY_ID[opts.controlId] : undefined;
  const newContext: TimelineContext = {
    id: `TLC-${nextContextSeq++}`, kind,
    controlId: opts?.controlId, controlName: control?.name ?? opts?.controlName,
    controlRecommendationType: opts?.controlRecommendationType,
    expectedBehavior: opts?.expectedBehavior, influence: opts?.influence, fwFactor: opts?.fwFactor,
    note: opts?.note, contribution: opts?.contribution, origin: opts?.origin,
    confidence: opts?.confidence, leadsToInsight: opts?.leadsToInsight,
    recommendation: opts?.recommendation,
  };
  return replaceEvent(eventId, { context: [...current.context, newContext] });
}

/** Edits an existing context tag in place — ContextDrawer.tsx's edit mode.
 * `controlId` re-resolves `controlName` from the register when it changes
 * (falling back to `controlName`'s own free-text value once cleared, for
 * the 'new_control' case); omit both to leave the control untouched. */
export function updateTimelineContext(eventId: string, contextId: string, patch: TimelineContextFields): TimelineEvent | null {
  const current = TIMELINE_EVENTS_BY_ID[eventId];
  if (!current) return null;
  const control = patch.controlId ? CRITICAL_CONTROLS_BY_ID[patch.controlId] : undefined;
  const context = current.context.map((c) => {
    if (c.id !== contextId) return c;
    const controlName = patch.controlId !== undefined ? (control?.name ?? patch.controlName) : (patch.controlName !== undefined ? patch.controlName : c.controlName);
    return { ...c, ...patch, controlName };
  });
  return replaceEvent(eventId, { context });
}

export function removeTimelineContext(eventId: string, contextId: string): TimelineEvent | null {
  const current = TIMELINE_EVENTS_BY_ID[eventId];
  if (!current) return null;
  return replaceEvent(eventId, { context: current.context.filter((c) => c.id !== contextId) });
}

/** Set once a finding's (i.e. a context's) recommendation has been pushed
 * into a real Work Stream during the Action phase — see WorkStreamsSection's
 * "Populate with Hiviz suggestions", now also fed by these recommendations
 * alongside AI output. */
export function markContextPromoted(eventId: string, contextId: string, workStreamId: string): TimelineEvent | null {
  const current = TIMELINE_EVENTS_BY_ID[eventId];
  if (!current) return null;
  const context = current.context.map((c) => (c.id === contextId ? { ...c, promotedWorkStreamId: workStreamId } : c));
  return replaceEvent(eventId, { context });
}
