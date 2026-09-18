import type { ControlAssessment, Incident, Insight, Investigation, WitnessAnswer, WitnessStatement, WorksiteControlStatus } from '@/types';
import { SITES_BY_ID, SITE_ID_BY_NAME } from './sites';
import { inPurview, type PurviewFilter } from './purview';
import { pushExternalInsight } from './insights';
import { CRITICAL_CONTROLS_BY_ID } from './risk';

// Reconciliation with Hiviz roadmap v1/specs — see data/incidents.ts for the
// incident-side notes. On the investigation side:
// - `investigation.assist` (specs/features/INCIDENT-CAPTURE.md Stage 3) IS
//   modeled — the aiSuggested* fields below (InvestigationAssistFields,
//   types/incident.ts) are read-only AI context rendered alongside the real
//   immediateCause/contributingFactors/rootCause/correctiveActions, which
//   stay investigator-authored exactly as before. The suggestions never get
//   copied into the confirmed fields automatically. As of 2026-09-11 these
//   fields originate on the Incident itself (seeded there, shown on
//   SevereIncidentReview.tsx) and are copied across by
//   openInvestigationFromIncident below, not generated fresh here — INV-3101
//   is the one exception, seeded directly since it predates that change and
//   has no still-severe source Incident to copy from.
// - flagSystemicCause below IS a real implementation of the systemic cause
//   bridge in specs/features/INVESTIGATION.md Stage 3 — the one sanctioned
//   path from the incident pipeline back into the insight pipeline. It
//   pushes a genuine entry into data/insights.ts's shared INSIGHTS array.
// - There is deliberately no 'review' status on Investigation itself. The
//   human review/triage gate — mirroring Insight's review status exactly,
//   story plus an Acknowledge/Progress fork — happens one step earlier, on
//   the Incident (status 'severe', see data/incidents.ts). An Investigation
//   record is only created once that fork resolves to "progress," so by the
//   time one exists there's nothing left to review before work starts.
//   The Incident/Investigations workspace UI (views/incidents/Investigations.tsx)
//   presents severe incidents as the first ("Needs review") stage of the same
//   pipeline even though they're a different underlying entity.
// - 2026-09-14 redesign (see [[project_investigation_timeline]]):
//   InvestigationStatus gained a real third value, 'actions', and the old
//   direct 'open' -> 'closed' close gate was replaced by a two-signoff gate
//   (submitInvestigationForApproval, then approveInvestigation) sitting
//   between 'timeline' and 'actions'. closeInvestigation itself moved to
//   gate 'actions' -> 'closed' on a live Work Stream, mirroring Insight's own
//   resolve gate, instead of on correctiveActions — corrective-action
//   dissemination is the Action phase's own job now. Both new gate functions
//   take their extra check (whether any findings exist / a live-work-stream
//   boolean) as a caller-supplied argument rather than importing
//   data/timeline.ts or data/workStreams.ts directly — the latter already
//   imports INVESTIGATIONS_BY_ID from this file, so importing back would be
//   a real circular value-import, same reasoning as resolveActionedInsight
//   (data/insights.ts) taking its summary as a parameter instead of building
//   it internally.
// - 2026-09-15: the standalone Finding entity was folded into
//   TimelineContext (see [[project_investigation_timeline]]) — a "finding"
//   is now just any context tag with a recommendation, derived on the fly
//   (views/incidents/findingsView.ts), never a separately validated record.
//   That's why submitInvestigationForApproval below takes a plain
//   `hasFindings: boolean` rather than a findings array to inspect — there's
//   nothing left to inspect per-finding (a derived finding always has a
//   recommendation by construction), only "does at least one exist."

const MOCK_NOW = new Date('2025-05-07T10:00:00');

export const INVESTIGATIONS: Investigation[] = [
  {
    id: 'INV-3101', status: 'timeline',
    title: 'Manual handling injury freeing a stuck tailgate pin',
    summary: 'Crew member strained a shoulder freeing a seized tailgate pin by hand — investigating whether a tool or procedure gap is driving repeat manual interventions on this equipment.',
    siteNames: ['Brookman Pit 2'], incidentCount: 1, energyTypes: ['none'],
    // Hand-matched to INC-4340's own keyHazard/safetyPracticeIds — this
    // investigation predates openInvestigationFromIncident's copy-across
    // (seeded directly, per this file's own top-of-file note), so kept in
    // sync by hand. See [[project_upstream_classification_enrichment]].
    keyHazard: { title: 'Seized tailgate pin requiring manual force to release — musculoskeletal risk', rationale: 'Without a pin-release tool or a maintenance schedule, crews resort to manual force whenever the pin seizes, and that’s the injury mechanism here.' },
    safetyPracticeIds: ['sp23', 'sp1'],
    updated: '1w ago', updatedAt: '2025-04-30T09:30:00', severityClass: 'serious', investigatorName: 'R. Bridges',
    immediateCause: 'Tailgate pin was seized and required manual force to free.',
    clearedForSharing: false,
    aiSuggestedRootCause: 'Tailgate pin maintenance is reactive — there is no scheduled lubrication or replacement interval, so crews resort to manual force whenever a pin seizes.',
    aiSuggestedRootCauseRationale: 'The crew described freeing the pin by hand as routine, and no maintenance record exists for pin servicing on this trailer type — points to an absent preventive-maintenance schedule rather than a one-off equipment fault.',
    aiSuggestedContributingFactors: [
      { factor: 'No scheduled preventive maintenance for tailgate pin lubrication', rationale: 'Repeat manual interventions on the same component point to a maintenance gap, not just a missing tool.' },
    ],
    aiSuggestedCorrectiveActions: [
      { action: 'Issue a pin-release tool to all haul crews operating this trailer type', rationale: 'Removes the need for manual force as an interim fix.' },
      { action: 'Add tailgate pin lubrication to the scheduled preventive maintenance program', rationale: 'Addresses the root cause rather than just the symptom.' },
    ],
    aiSuggestedInterviewQuestions: [
      { question: 'How often has this pin needed freeing by hand in the last month?', rationale: 'Establishes whether this is a one-off or a recurring condition crews have normalised.' },
      { question: 'Is a pin-release tool available anywhere on site, even if not issued to this crew?', rationale: 'Distinguishes a tool-access gap from a tool-existence gap.' },
    ],
    aiFactorHint: { factor: 'resource_allocation', confidence: 0.74, rationale: 'A missing tool and an absent maintenance schedule both point to a resourcing gap rather than an individual action.' },
    // Same analysis as aiSuggestedRootCause/aiSuggestedContributingFactors
    // above, reshaped for "Populate with Hiviz suggestions" on the Timeline
    // (2026-09-14, see [[project_investigation_timeline]]). The first
    // suggestion is a genuine organisational-level factor (no scheduled
    // maintenance program), so it's tagged 'systemic' with a Forge Works
    // Map® factor — 2026-09-15's fix once 'systemic' became its own
    // TimelineContextKind (it didn't fit any of the original four:
    // normal_work/deviation/recovery/failure all describe what happened at
    // a moment in the sequence, not an absent organisational process). The
    // second is left unclassified on purpose — a crew's own normalised
    // behaviour toward a known defect isn't itself a systemic factor, and no
    // CriticalControl in the current Risk register covers manual-handling/
    // tooling gaps like this one — still demonstrates that an unclassified
    // suggestion is a normal, expected outcome, not every suggestion needs
    // to force-fit a kind now that there's a 5th option.
    aiSuggestedTimelineEvents: [
      { description: 'No scheduled preventive maintenance exists for tailgate pin lubrication on this trailer type.', contextKind: 'systemic', fwFactor: 'management_systems' },
      { description: 'Freeing a seized tailgate pin by hand has become treated as routine on this crew, rather than being escalated as a recurring defect.' },
    ],
  },
  {
    id: 'INV-3098', status: 'closed',
    title: 'Fatality at Jewell Crusher exclusion boundary',
    summary: 'Contractor struck by a reversing haul truck at the crusher exclusion boundary. Closed under legal hold — findings not yet cleared for sharing.',
    siteNames: ['Jewell Crusher'], incidentCount: 1, energyTypes: ['kinetic'],
    // Hand-matched to INC-4320's own keyHazard/safetyPracticeIds — same
    // reason as INV-3101 above, this investigation is also hand-seeded.
    keyHazard: { title: 'Unbarricaded crusher exclusion boundary — struck-by risk from reversing haul trucks', rationale: 'With no physical barrier and a spotter check that also didn’t hold, there was nothing left to stop a person from being in the truck’s path when it reversed.' },
    safetyPracticeIds: ['sp27', 'sp25'],
    updated: '2w ago', updatedAt: '2025-04-23T14:00:00', severityClass: 'critical', investigatorName: 'Marcus Okafor',
    immediateCause: 'Contractor was standing inside the marked exclusion zone when the haul truck began reversing.',
    rootCause: 'Exclusion control at this crusher relies entirely on procedural compliance — signage and a radio call — with no physical or engineered barrier.',
    correctiveActions: [
      { action: 'Install a physical barrier at the crusher exclusion boundary', rationale: 'Removes reliance on procedural compliance alone.', owner: 'Marcus Okafor', dueDate: '2025-05-20' },
    ],
    clearedForSharing: false,
    legalHold: true,
    // ICAM-style Risk assessment (2026-09-18) — the same three controls
    // already tagged on the Timeline (TLC-3/TLC-4/TLC-5, data/timeline.ts)
    // judged systematically here, in the order the incident actually
    // exercised them: the spotter step and the reversing alarm both
    // existed and were rolled out (status: 'active') but still didn't
    // prevent the incident — one from not being executed, one from acting
    // too late — while the exclusion barrier was signage-only from the
    // start, a real rollout gap rather than an execution one.
    controlAssessments: [
      { controlId: 'cc6', controlName: 'Spotter confirmed in position for reversing', status: 'active', note: 'Rostered and rolled out, but nothing in the daily routine made confirming it a hard stop before reversing — the check was skippable, which is the real gap, not who skipped it.' },
      { controlId: 'cc7', controlName: 'Exclusion zone barricaded', status: 'active_degraded', note: 'Signage-only since installation; a physical barrier was budgeted but deliberately deferred.' },
      { controlId: 'cc8', controlName: 'Reversing alarm functional', status: 'active', note: 'Functioned as designed — sounded in time to warn, but too late for the contractor to react. A limits-of-mitigation issue, not a control failure.' },
    ],
    fwClassifications: [
      { factor: 'management_systems', domain: 'enable', maturitySignal: 'compliant', confidence: 0.88, rationale: 'The exclusion procedure exists but specifies no engineered control, only administrative ones.' },
    ],
  },
  {
    id: 'INV-3095', status: 'closed',
    title: 'Fall from an unguarded gantry walkway section',
    summary: 'Crew member fell from an unguarded section of gantry walkway during maintenance work, sustaining a fractured ankle. Closed with a confirmed root cause pointing to a shared handrail work-order gap.',
    siteNames: ['Coolinga Plant'], incidentCount: 1, energyTypes: ['gravitational'],
    // Hand-matched to INC-4270's own keyHazard/safetyPracticeIds — this
    // investigation is a hand-seeded record, not created via
    // openInvestigationFromIncident at runtime, so the usual copy-across
    // doesn't apply here; kept in sync by hand instead. See
    // [[project_upstream_classification_enrichment]].
    keyHazard: { title: 'Unguarded gantry walkway section — fall from height', rationale: 'A section of handrail removed for maintenance access was not reinstated before the walkway reopened, leaving an unguarded edge on an active access route.' },
    safetyPracticeIds: ['sp23', 'sp1'],
    updated: '5w ago', updatedAt: '2025-04-04T11:00:00', severityClass: 'critical', investigatorName: 'Jess Liang',
    immediateCause: 'A section of gantry handrail had been removed for maintenance access and not reinstated before the walkway was reopened.',
    rootCause: 'The gantry maintenance work order template has no mandatory step confirming guarding is reinstated before a walkway returns to service — likely present wherever the same template is used, not just this walkway.',
    correctiveActions: [
      { action: 'Redesign the gantry work order so a walkway can’t be signed off without a second person verifying guarding is reinstated', rationale: 'A checklist line can be ticked without being checked; a required, verified step before sign-off is possible removes the reliance on memory or good intentions.', owner: 'Jess Liang', dueDate: '2025-05-14', done: true },
    ],
    clearedForSharing: true,
    sharingScope: 'organisation',
    legalHold: false,
    fwClassifications: [
      { factor: 'management_systems', domain: 'enable', maturitySignal: 'compliant', confidence: 0.81, rationale: 'The work order template is a management-system gap, not an individual lapse — it applies wherever the same template is used.' },
    ],
  },
];

export const INVESTIGATIONS_BY_ID: Record<string, Investigation> = Object.fromEntries(INVESTIGATIONS.map((v) => [v.id, v]));

function replaceInvestigation(id: string, patch: Partial<Investigation>): Investigation | null {
  const idx = INVESTIGATIONS.findIndex((v) => v.id === id);
  if (idx === -1) return null;
  const updated: Investigation = { ...INVESTIGATIONS[idx], ...patch, updated: 'Just now', updatedAt: MOCK_NOW.toISOString() };
  INVESTIGATIONS[idx] = updated;
  INVESTIGATIONS_BY_ID[id] = updated;
  return updated;
}

let nextInvestigationSeq = 3200;

/** Opens a new investigation from a progressed incident — the code-level
 * equivalent of a CriticalIncident approval creating an investigation record
 * (specs/features/CRITICAL-INCIDENT.md Stage 2). Called from
 * data/incidents.ts's progressToInvestigation, which has already gated on
 * `investigatorName` being set — assigning an investigator up front, at
 * review time, means the investigation never starts unowned, same principle
 * as requiring a manager before it can leave the Timeline phase (see
 * [[project_investigation_timeline]]). Copies the incident's own
 * `investigation.assist` fields across rather than regenerating them — per
 * spec that job already ran at intake, on the incident, so the investigator
 * should pick up exactly what the reviewer already saw on
 * SevereIncidentReview.tsx, not a fresh (and possibly different) draft. */
export function openInvestigationFromIncident(incident: Incident, investigatorName: string): Investigation {
  const id = `INV-${nextInvestigationSeq++}`;
  const investigation: Investigation = {
    id, status: 'timeline',
    title: `Investigation — ${incident.description.length > 72 ? `${incident.description.slice(0, 72)}…` : incident.description}`,
    summary: incident.description,
    siteNames: [incident.siteName],
    incidentCount: 1,
    energyTypes: [incident.energyType],
    updated: 'Just now',
    updatedAt: MOCK_NOW.toISOString(),
    severityClass: incident.severityClass,
    investigatorName,
    keyHazard: incident.keyHazard,
    safetyPracticeIds: incident.safetyPracticeIds,
    clearedForSharing: false,
    aiSuggestedRootCause: incident.aiSuggestedRootCause,
    aiSuggestedRootCauseRationale: incident.aiSuggestedRootCauseRationale,
    aiSuggestedContributingFactors: incident.aiSuggestedContributingFactors,
    aiSuggestedCorrectiveActions: incident.aiSuggestedCorrectiveActions,
    aiSuggestedInterviewQuestions: incident.aiSuggestedInterviewQuestions,
    aiFactorHint: incident.aiFactorHint,
  };
  INVESTIGATIONS.push(investigation);
  INVESTIGATIONS_BY_ID[id] = investigation;
  return investigation;
}

export function assignInvestigator(id: string, name: string): Investigation | null {
  return replaceInvestigation(id, { investigatorName: name });
}

/** Distinct from the investigator (see `Investigation.managerName`'s own
 * doc comment, types/incident.ts) — assignable independently, at any point,
 * same as the investigator. */
export function assignManager(id: string, name: string): Investigation | null {
  return replaceInvestigation(id, { managerName: name });
}

/** Patches the in-progress framework fields without changing status —
 * autosaves as the investigator works through the workbench. */
export function updateFrameworkFields(id: string, fields: Partial<Investigation>): Investigation | null {
  return replaceInvestigation(id, fields);
}

/** Adds one control to this investigation's ICAM-style Risk assessment —
 * see ControlAssessment's own doc comment (types/incident.ts). No-ops if
 * already added (RiskAssessment.tsx's "Add control" drawer already excludes
 * controls already on the list; this guards the data layer too). Left
 * unassessed (`status` unset) until the investigator judges it. */
export function addControlAssessment(id: string, controlId: string): Investigation | null {
  const current = INVESTIGATIONS_BY_ID[id];
  if (!current) return null;
  if (current.controlAssessments?.some((a) => a.controlId === controlId)) return current;
  const control = CRITICAL_CONTROLS_BY_ID[controlId];
  if (!control) return current;
  const assessment: ControlAssessment = { controlId, controlName: control.name };
  return replaceInvestigation(id, { controlAssessments: [...(current.controlAssessments ?? []), assessment] });
}

export function updateControlAssessment(id: string, controlId: string, patch: { status?: WorksiteControlStatus; note?: string }): Investigation | null {
  const current = INVESTIGATIONS_BY_ID[id];
  if (!current) return null;
  const controlAssessments = (current.controlAssessments ?? []).map((a) => (a.controlId === controlId ? { ...a, ...patch } : a));
  return replaceInvestigation(id, { controlAssessments });
}

export function removeControlAssessment(id: string, controlId: string): Investigation | null {
  const current = INVESTIGATIONS_BY_ID[id];
  if (!current) return null;
  return replaceInvestigation(id, { controlAssessments: (current.controlAssessments ?? []).filter((a) => a.controlId !== controlId) });
}

/** True once the investigator has judged every control they added — "the
 * risk management failure has been identified," as a heuristic (ICAM pass,
 * 2026-09-18) rather than a rendered milestone: a brief visible checkbox
 * strip for this (plus a "recorded with evidence" one) was tried and pulled
 * the same day per direct feedback — "they are heuristics not UI." Kept as a
 * pure derived function so it's available for real gating logic later (e.g.
 * a future submit-for-approval check) without resurrecting the checklist
 * UI. Deliberately NOT "at least one marked absent/not in place" — a
 * control finding can recommend a brand-new control even when every control
 * that already exists in the register was judged in place, so completeness
 * (every added control has a real status), not any specific outcome, is
 * what this measures. */
export function riskAssessmentComplete(v: Investigation): boolean {
  return !!v.controlAssessments?.length && v.controlAssessments.every((a) => !!a.status);
}

let nextWitnessStatementSeq = 1;

/** Adds one witness's statement — see WitnessStatement's own doc comment
 * (types/incident.ts). `answers` arrives pre-built by the caller
 * (WitnessStatementDrawer.tsx merges the best-practice question bank with
 * this investigation's own aiSuggestedInterviewQuestions before the
 * investigator edits/extends it), not assembled here — this function only
 * stores whatever transcript it's given. */
export function addWitnessStatement(id: string, input: { witnessName: string; witnessRole?: string; answers: WitnessAnswer[]; takenBy: string }): Investigation | null {
  const current = INVESTIGATIONS_BY_ID[id];
  if (!current) return null;
  const statement: WitnessStatement = {
    id: `WS-${nextWitnessStatementSeq++}`,
    witnessName: input.witnessName, witnessRole: input.witnessRole,
    answers: input.answers, takenBy: input.takenBy, takenAt: MOCK_NOW.toISOString(),
  };
  return replaceInvestigation(id, { witnessStatements: [...(current.witnessStatements ?? []), statement] });
}

export function updateWitnessStatement(id: string, statementId: string, patch: { witnessName?: string; witnessRole?: string; answers?: WitnessAnswer[] }): Investigation | null {
  const current = INVESTIGATIONS_BY_ID[id];
  if (!current) return null;
  const witnessStatements = (current.witnessStatements ?? []).map((s) => (s.id === statementId ? { ...s, ...patch } : s));
  return replaceInvestigation(id, { witnessStatements });
}

export function removeWitnessStatement(id: string, statementId: string): Investigation | null {
  const current = INVESTIGATIONS_BY_ID[id];
  if (!current) return null;
  return replaceInvestigation(id, { witnessStatements: (current.witnessStatements ?? []).filter((s) => s.id !== statementId) });
}

/** The investigator's own signoff — the first half of the two-signoff gate
 * (see InvestigationStatus's own doc comment, types/incident.ts). Does NOT
 * change status by itself; `approveInvestigation` below does that. `findings`
 * is caller-supplied (see this file's top-of-file note on why) — the gate
 * mirrors the workshop's own six-criteria checklist as far as this
 * prototype can enforce it: immediate cause + root cause set, both roles
 * assigned, at least one finding, every finding has a recommendation.
 * Evidence-related criteria aren't enforced yet (Phase 2, not built). */
export function submitInvestigationForApproval(id: string, submittedBy: string, hasFindings: boolean): { investigation: Investigation | null; error?: string } {
  const current = INVESTIGATIONS_BY_ID[id];
  if (!current) return { investigation: null, error: 'Investigation not found.' };
  if (current.status !== 'timeline') return { investigation: current, error: 'This investigation has already moved past Timeline.' };
  if (!current.immediateCause?.trim()) return { investigation: current, error: 'Immediate cause is required before submitting.' };
  if (!current.rootCause?.trim()) return { investigation: current, error: 'Root cause is required before submitting.' };
  if (!current.investigatorName) return { investigation: current, error: 'An investigator must be assigned before submitting.' };
  if (!current.managerName) return { investigation: current, error: 'A manager must be assigned before submitting.' };
  if (!hasFindings) return { investigation: current, error: 'At least one finding is required before submitting.' };
  return { investigation: replaceInvestigation(id, { submittedAt: new Date().toISOString(), submittedBy }) };
}

/** The manager's signoff — the second half of the gate, and the thing that
 * actually advances 'timeline' -> 'actions'. Requires the investigator to
 * have already submitted; doesn't re-run the whole checklist (submitting
 * already confirmed it), just confirms a manager is on record approving it. */
export function approveInvestigation(id: string, approvedBy: string): { investigation: Investigation | null; error?: string } {
  const current = INVESTIGATIONS_BY_ID[id];
  if (!current) return { investigation: null, error: 'Investigation not found.' };
  if (current.status !== 'timeline') return { investigation: current, error: 'This investigation has already moved past Timeline.' };
  if (!current.submittedAt) return { investigation: current, error: 'The investigator needs to submit before this can be approved.' };
  if (!current.managerName) return { investigation: current, error: 'A manager must be assigned before approving.' };
  return { investigation: replaceInvestigation(id, { status: 'actions', approvedAt: new Date().toISOString(), approvedBy }) };
}

/** actions -> closed. Mirrors Insight's own resolve gate exactly — at least
 * one Work Stream live — rather than the old corrective-actions count;
 * `hasLiveWorkStream` is caller-supplied for the same circular-import
 * reason `findings` is above. No separate approval step beyond this gate,
 * same as Insight has none between 'action' and 'closed'. */
export function closeInvestigation(id: string, hasLiveWorkStream: boolean): { investigation: Investigation | null; error?: string } {
  const current = INVESTIGATIONS_BY_ID[id];
  if (!current) return { investigation: null, error: 'Investigation not found.' };
  if (current.status !== 'actions') return { investigation: current, error: 'Move to Actions before closing.' };
  if (!hasLiveWorkStream) return { investigation: current, error: 'Push at least one work stream live before closing.' };
  return { investigation: replaceInvestigation(id, { status: 'closed' }) };
}

/** The systemic cause phase — specs/features/INVESTIGATION.md Stage 3. Human-
 * initiated, closed investigations only, blocked entirely while legalHold is
 * true. Pushes a real Insight into the shared INSIGHTS pool with
 * cleared_for_toolbox auto-approved (per spec: Stage 1 AI generation is
 * skipped for this trigger source, the safety manager's authored content is
 * authoritative) and records the link back on the investigation. */
export function flagSystemicCause(id: string, patternSummary: string): { investigation: Investigation | null; insight?: Insight; error?: string } {
  const current = INVESTIGATIONS_BY_ID[id];
  if (!current) return { investigation: null, error: 'Investigation not found.' };
  if (current.status !== 'closed') return { investigation: current, error: 'Only closed investigations can be flagged for systemic cause.' };
  if (current.legalHold) return { investigation: current, error: 'Blocked while legal hold is active.' };
  if (current.systemicCauseInsightId) return { investigation: current, error: 'Already flagged as a systemic cause.' };
  if (!patternSummary.trim()) return { investigation: current, error: 'A pattern summary is required.' };

  const insightId = `INS-EXT-${current.id}`;
  const insight: Insight = {
    id: insightId,
    status: 'review',
    kind: 'cross_site_pattern',
    theme: 'Systemic cause',
    title: `Systemic finding from ${current.id}`,
    summary: patternSummary.trim(),
    siteNames: current.siteNames,
    observationCount: current.incidentCount,
    supporterInitials: [],
    energyTypes: current.energyTypes,
    updated: 'Just now',
    updatedAt: MOCK_NOW.toISOString(),
    cleared_for_toolbox: true,
    cause: current.rootCause,
  };
  pushExternalInsight(insight);
  const updated = replaceInvestigation(id, { systemicCauseInsightId: insightId });
  return { investigation: updated, insight };
}

export function investigationInRegion(investigation: Investigation, purview: PurviewFilter): boolean {
  return investigation.siteNames.some((name) => {
    const site = SITES_BY_ID[SITE_ID_BY_NAME[name]];
    return !!site && inPurview(site, purview);
  });
}

export function daysSince(updatedAt: string): number {
  return Math.floor((MOCK_NOW.getTime() - new Date(updatedAt).getTime()) / 86_400_000);
}

export const RESOLVED_WINDOW_DAYS = 45;
