import type { AiClassification, BarrierAssessment, EnergyType, KeyHazard, SharingScope } from './observation';
import type { FwClassification, FwFactor } from './insight';
import type { TimelineContextKind } from './timeline';
import type { WorksiteControlStatus } from './risk';

// Field names/values follow the canonical taxonomy in the Hiviz roadmap specs
// (specs/features/INCIDENT-CAPTURE.md, CRITICAL-INCIDENT.md, INVESTIGATION.md)
// — terminology reference only, this project has no dependency on that
// repo's code or backend. See data/incidents.ts and data/investigations.ts
// for what's deliberately simplified relative to those specs.

export type IncidentType = 'near-miss' | 'injury' | 'property-damage' | 'environmental';

export type InjuryClassification = 'none' | 'first_aid' | 'medical_treatment' | 'restricted_work' | 'lost_time' | 'fatality';

export type SeverityClass = 'minor' | 'moderate' | 'serious' | 'critical';

/**
 * reported     — captured, doesn't meet severe criteria (mirrors Observation 'enriched')
 * severe       — meets escalation criteria, pending safety-manager review (mirrors Insight 'review')
 * acknowledged — reviewed, closed without opening an investigation (terminal)
 * linked       — progressed to investigation, linkedInvestigationId set (mirrors Observation 'linked')
 */
export type IncidentStatus = 'reported' | 'severe' | 'acknowledged' | 'linked';

export interface Incident extends InvestigationAssistFields {
  id: string;
  when: string;
  occurredAt: string;
  siteId: string;
  siteName: string;
  reporterName: string;
  description: string;
  workType: string;
  /** -> HIGH_RISK_WORK id (data/admin/taxonomies.ts). Unset when the incident
   * doesn't correspond to a defined high-risk-work category — not every
   * incident should be force-mapped just to have one. Powers the Risk
   * workspace's likelihood computation (data/risk.ts's computeWorkTypeRisk). */
  workTypeId?: string;
  incidentType: IncidentType;
  injuryClassification: InjuryClassification;
  peopleInvolvedCount: number;
  sceneSecured: boolean | null;
  notifiableFlag: boolean;
  energyType: EnergyType;
  barrierAssessment: BarrierAssessment;
  severityClass: SeverityClass;
  status: IncidentStatus;
  linkedInvestigationId?: string;
  /** Set when status = 'acknowledged' — the reviewer's reason for closing without an investigation. */
  acknowledgeComment?: string;

  // Richer classification, 2026-09-15 (see AiClassification's own doc
  // comment, types/observation.ts) — optional enhancements layered on top
  // of the bare energyType/barrierAssessment above, only populated where
  // the mocked enrichment job would genuinely have reasoned about it.
  energyClassification?: AiClassification<EnergyType>;
  barrierClassification?: AiClassification<BarrierAssessment>;
  keyHazard?: KeyHazard;
  /** -> SAFETY_PRACTICES ids (data/admin/taxonomies.ts) — same shape as
   * Observation's own field of the same name. */
  safetyPracticeIds?: string[];

  // Stop-work fields — specs/features/INCIDENT-CAPTURE.md's stop_work_relevant/
  // stop_work_called, collected at capture time. The "was a stop warranted,
  // was it called" decision lives entirely on these fields (mirrored on
  // BarrierFailure — types/risk.ts) — a StopWorkEvent is only ever created
  // once a stop is actually called, never for the undecided divergence. See
  // data/stopWork.ts's top-of-file note.
  /** AI enrichment's judgment, independent of what actually happened. */
  stopWorkWarranted?: boolean;
  stopWorkWarrantedRationale?: string;
  /** What the reporter/supervisor actually did at the time, or what a
   * manager subsequently decided — true the moment either happens. */
  stopWorkCalled?: boolean;
  /** Set once a StopWorkEvent exists — data/stopWork.ts. Only ever set
   * alongside stopWorkCalled: true. */
  stopWorkEventId?: string;
  /** The warranted-but-not-called divergence, judged by a manager not to
   * need a stop — the terminal exit that isn't "call it". Recorded directly
   * here since no StopWorkEvent is ever created for a dismissed one. */
  stopWorkDismissedBy?: string;
  stopWorkDismissedAt?: string;
  stopWorkDismissedNote?: string;
}

/**
 * pending_stop — a stop has been requested (by a manager, off the
 *                warranted-but-not-called divergence, or by upgrading one
 *                already called) but the site hasn't confirmed it's
 *                actually stopped yet. Its own visible stage: assuming a
 *                requested stop actually happened is a safety failure, not
 *                just a bookkeeping gap (unlike the equivalent gap on the
 *                resume side — see `resumed` below).
 * stopped      — confirmed stopped, either via pending_stop's confirmation
 *                or immediately when the reporter/supervisor already called
 *                it at capture time (stopWorkCalled: true) — no request/
 *                confirm gap to speak of. Covers the whole span until
 *                resumed — approval to resume (see requiresApproval) is a
 *                condition on that one action, not a separate visible stage.
 * resumed      — work has resumed, with sign-off. Terminal.
 *
 * The "was a stop warranted, was it called" decision itself isn't a status
 * here — it's Incident.stopWorkWarranted/stopWorkCalled/stopWorkDismissedBy
 * (or BarrierFailure's mirrored fields, types/risk.ts). A StopWorkEvent is
 * only ever born once a stop is actually happening — see data/stopWork.ts's
 * top-of-file note.
 */
export type StopWorkStatus = 'pending_stop' | 'stopped' | 'resumed';

/** A distinct authority question from BarrierFailure's: "is it safe to
 * resume the broader work" rather than "is this one registered control
 * back in place" — the two can coexist on the same underlying event
 * without either one carrying weight it wasn't built for. See
 * data/stopWork.ts's top-of-file note.
 *
 * Two possible origins, not one funnel — sourceKind/sourceId point at
 * whichever raised it: an Incident's stop-work fields, or BarrierFailure's
 * mirrored ones. Either can itself be "the site already called it" or "a
 * manager called it off the undecided divergence" — see requestedBy vs
 * confirmedBy below. */
export interface StopWorkEvent {
  id: string;
  status: StopWorkStatus;
  siteId: string;
  siteName: string;
  sourceKind: 'incident' | 'barrierFailure';
  sourceId: string;
  workType: string;
  severityClass: SeverityClass;
  /** Copied at creation from the source's own warranted rationale — the
   * "why" for this specific stop, not re-derived from the source each render. */
  warrantedRationale?: string;
  /** Whether this stop covers the whole site or just workType — a
   * manager's call, never settable from a site-side capture. Fixed at the
   * moment the stop is requested/called (see callStopWork), not editable
   * afterward — the confirm/resolve steps only ever display it (badge,
   * and folded into the confirm button's own label), never let it change. */
  siteWide?: boolean;
  /** Set at creation via a manager's Request stop work action — who
   * requested it, not who executed it. Unset when the site already called
   * it at capture (nothing to request, it already happened). */
  requestedBy?: string;
  requestedAt?: string;
  /** Optional instruction a manager adds when requesting the stop — shown
   * alongside "Stop requested" in the drawer's Story timeline, the same
   * treatment resumeNote already gets for the resume step. */
  requestNote?: string;
  /** Set once the site confirms it's actually stopped — pending_stop ->
   * stopped — or immediately at creation, when it was already
   * stopWorkCalled = true at capture (no request/confirm gap to speak of). */
  confirmedBy?: string;
  confirmedAt?: string;
  /** Derived: severityClass is 'serious' | 'critical' — reuses
   * BarrierFailure's exact rule. Gates *who* can action the single resume
   * transition (a name is required either way; for serious/critical it
   * needs to read as a manager's), not a separate pipeline stage. */
  requiresApproval: boolean;
  resumeNote?: string;
  resumedBy?: string;
  resumedAt?: string;
}

/**
 * Redesigned 2026-09-14 after a workshop with a risk specialist and an
 * investigation specialist — see [[project_investigation_timeline]] for the
 * full design discussion. The review/triage decision still happens one step
 * earlier, on the Incident (status 'severe', "Needs review" in the UI) —
 * that part is unchanged and is NOT one of these three values.
 *
 * timeline — the investigator builds the case: the timeline itself
 *            (InvestigationTimeline.tsx), Findings drawn from it (each
 *            tracing to at least one timeline event, per the workshop's own
 *            framing that "it is in a sense the investigation"), immediate
 *            cause, root cause. Ends with a two-signoff gate — the
 *            investigator submits (`submittedAt`/`submittedBy`), then the
 *            assigned manager approves (`approvedAt`/`approvedBy`), which is
 *            what actually advances the status. There's no separate
 *            persisted "under review" status for this — the gate + the
 *            manager's approval action together *are* the review, not a
 *            fourth status value.
 * actions  — corrective-action dissemination, via the same Work Streams
 *            mechanism Insight already uses (toolbox_talk/learn/improve).
 *            Corrective actions are deliberately NOT part of what it takes
 *            to finish 'timeline' — "doing something with the investigation"
 *            is its own phase, not a condition of the investigation's
 *            findings being done.
 * closed   — terminal, once Action's work is dispatched (mirrors Insight's
 *            own gate: at least one Work Stream live).
 */
export type InvestigationStatus = 'timeline' | 'actions' | 'closed';

export interface ContributingFactor {
  factor: string;
  rationale: string;
}

/** One control the investigator has explicitly chosen to assess for this
 * investigation — the ICAM-style "Risk assessment" pass, added 2026-09-18
 * (see [[project_investigation_timeline]]). Added one at a time via the
 * Risk assessment section's "Add control" drawer, not auto-enumerated from
 * every control the relevant work type(s) carry — a work type's full
 * control set can run long, and not all of it bears on any one incident, so
 * the investigator curates which controls actually matter here (mirrors why
 * `TimelineContext.controlId` is resolved from the real register rather
 * than free text — same register, same `CriticalControl`). `status` reuses
 * `WorksiteControlStatus` verbatim rather than a bespoke pass/fail enum —
 * the investigator is judging the same real-world state a site verifier
 * already judges ("was this active, not required, mid-rollout..."), at the
 * time of the incident, not inventing new vocabulary for it. Left unset
 * until assessed — "added but not yet judged" is a real, distinct state
 * (see `riskAssessmentComplete`, data/investigations.ts) from any actual
 * status value. `controlName` is cached at add time, same
 * convention as `TimelineContext.controlName`/`BarrierFailure.controlName`. */
export interface ControlAssessment {
  controlId: string;
  controlName: string;
  status?: WorksiteControlStatus;
  note?: string;
}

/** One question-and-answer pair within a `WitnessStatement` — a real
 * transcript, not a summary, so the timeline can be checked against the
 * witness's own words rather than the investigator's paraphrase of them.
 * `answer` starts unset when a question is added to the transcript before
 * the witness has actually responded — same "added but not yet judged"
 * shape as `ControlAssessment.status`. */
export interface WitnessAnswer {
  question: string;
  answer?: string;
}

/** One witness's account, added 2026-09-18 (ICAM pass, see
 * [[project_investigation_timeline]]) — a deliberately lighter-weight stand-in
 * for the full witness enquiry the roadmap spec envisions
 * (`specs/features/INVESTIGATION.md` Stage 2, delegating to
 * `ENQUIRY.md`'s `investigation_witness` trigger — multi-recipient dispatch,
 * live AI synthesis across responses, FW classification). That machinery is
 * built for broadcasting a question set to many recipients across sites and
 * synthesising the pattern across their answers; a witness statement is one
 * named person's account, taken directly by the investigator, with nothing
 * to synthesise across multiple respondents — so this models just the
 * transcript itself, not the dispatch/synthesis pipeline. `answers` starts
 * pre-populated from best-practice witness questions
 * (`views/incidents/witnessQuestions.ts`) plus the investigation's own
 * `aiSuggestedInterviewQuestions`, editable and extendable per statement —
 * every witness doesn't have to be asked the identical set. Existing purely
 * to help the investigator cross-check the Timeline they've built against
 * what a witness actually says happened — no automatic linking to specific
 * TimelineEvents, that cross-referencing is a human judgment call, not
 * something to force into a data relationship. */
export interface WitnessStatement {
  id: string;
  witnessName: string;
  witnessRole?: string;
  answers: WitnessAnswer[];
  takenBy: string;
  takenAt: string;
}

export interface CorrectiveAction {
  action: string;
  rationale: string;
  owner?: string;
  dueDate?: string;
  done?: boolean;
}

/** Shared with Insight's own aiSuggestedInterviewQuestions — one AI-drafted
 * question, same shape regardless of which parent (Insight or
 * Investigation) it was suggested for. */
export interface InterviewQuestion {
  question: string;
  rationale: string;
}

/** `investigation.assist`'s suggestions (specs/features/INCIDENT-CAPTURE.md
 * Stage 3) — read-only AI context, same "Hiviz has suggested" pattern as
 * Insight.suggested/suggestedBasis. Never written into any confirmed field
 * automatically — a human always reads it and writes their own value.
 *
 * Lives on **both** `Incident` and `Investigation`, not just the latter: per
 * spec this job queues at server triage, immediately on incident intake —
 * before any human review and before an Investigation record necessarily
 * exists. `Incident` carries it so `SevereIncidentReview.tsx` (this app's
 * mirror of Insight's 'review' status) has a real synthesized narrative to
 * show instead of just echoing back the raw reported description; once
 * progressed, `openInvestigationFromIncident` (data/investigations.ts)
 * copies the same content onto the new Investigation record rather than
 * regenerating it, so the investigator picks up exactly what the reviewer
 * already saw. Stage 3 has no immediate_cause suggestion, only these. */
export interface InvestigationAssistFields {
  aiSuggestedRootCause?: string;
  aiSuggestedRootCauseRationale?: string;
  aiSuggestedContributingFactors?: ContributingFactor[];
  aiSuggestedCorrectiveActions?: CorrectiveAction[];
  aiSuggestedInterviewQuestions?: InterviewQuestion[];
  /** The cheap, early single-factor guess investigation.assist emits — distinct
   * from the full fwClassifications[] a separate, heavier fw_classify job
   * populates only once the investigation closes (Stage 5, Investigation
   * only — Incident never gets fwClassifications). Superseded by
   * fwClassifications once real classification lands. */
  aiFactorHint?: { factor: FwFactor; confidence: number; rationale: string };
  /** The same analysis, reshaped for the Timeline (2026-09-14 redesign, see
   * [[project_investigation_timeline]]) — structured suggestions an
   * investigator can drop straight onto the timeline via "Populate with
   * Hiviz suggestions," then edit, delete, or ignore, rather than the
   * free-text fields above staying a wall of prose to manually re-key.
   * `contextKind`/`controlId`/`fwFactor` are the AI's best guess at
   * classification, never required — the mocked job can't always tell what
   * happened without a witness account, and a bare, unclassified event is a
   * normal, expected outcome here. `fwFactor` is only meaningful alongside
   * `contextKind: 'systemic'` (2026-09-15, once 'systemic' became its own
   * TimelineContextKind rather than nested under 'deviation'). */
  aiSuggestedTimelineEvents?: { description: string; contextKind?: TimelineContextKind; controlId?: string; fwFactor?: FwFactor }[];
}

export interface Investigation extends InvestigationAssistFields {
  id: string;
  status: InvestigationStatus;
  title: string;
  summary: string;
  siteNames: string[];
  incidentCount: number;
  energyTypes: EnergyType[];
  /** Copied across from the source Incident at `openInvestigationFromIncident`
   * time, same as the aiSuggested* fields above — the investigator should
   * see the same key-hazard synthesis and practice tags the reviewer saw on
   * SevereIncidentReview.tsx, not lose them the moment the record becomes an
   * Investigation. See AiClassification's own doc comment, types/observation.ts. */
  keyHazard?: KeyHazard;
  safetyPracticeIds?: string[];
  updated: string;
  updatedAt: string;
  severityClass: SeverityClass;
  /** Does the fact-finding — builds the timeline, findings, immediate/root
   * cause. Distinct from `managerName` below (2026-09-14 redesign, see
   * [[project_investigation_timeline]]) — two roles, two signoffs. */
  investigatorName?: string;
  /** Approves the investigation's findings (the second of the two signoffs
   * gating 'timeline' -> 'actions') and is expected to own the Action phase
   * once it starts — not necessarily the same person who investigated. */
  managerName?: string;
  /** The investigator's own signoff — "I've finished building the case."
   * Required before the manager can approve; see `approveInvestigation`
   * (data/investigations.ts). */
  submittedAt?: string;
  submittedBy?: string;
  /** The manager's signoff — advances status to 'actions' when set. */
  approvedAt?: string;
  approvedBy?: string;

  // Framework fields — specs/features/INVESTIGATION.md Stage 1.
  // immediateCause/rootCause are free-text authored syntheses, still
  // correct as-is (see [[project_investigation_timeline]]'s RCA-hierarchy
  // discussion — these are singular and authored, not derivable from
  // Findings). `contributingFactors` (the old free-text list) was removed
  // outright 2026-09-15 once every instance of it was confirmed fully
  // duplicated by a real Finding (a TimelineContext with a recommendation)
  // — nothing reads or writes this any more, and the two previously-closed
  // seeds that used to carry it (INV-3098, INV-3095) now say the same thing
  // through their own Findings instead. `correctiveActions` is kept (unlike
  // contributingFactors) because the two closed seeds' entries carry real
  // owner/dueDate/done history that predates Work Streams and would
  // otherwise be lost — but it's rendered read-only always now (see
  // InvestigationDetail.tsx), since disseminating a corrective action is
  // the Actions-phase Work Streams section's job going forward, not this
  // field's.
  immediateCause?: string;
  rootCause?: string;
  correctiveActions?: CorrectiveAction[];
  clearedForSharing?: boolean;
  sharingScope?: SharingScope;

  /** ICAM-style Risk assessment, 2026-09-18 — see ControlAssessment's own
   * doc comment. Empty/unset until the investigator adds at least one. */
  controlAssessments?: ControlAssessment[];

  /** Witness accounts, 2026-09-18 — see WitnessStatement's own doc comment.
   * Empty/unset until the investigator adds at least one. */
  witnessStatements?: WitnessStatement[];

  /** Hard block on narrative/FW-classify/systemic-cause while true — specs/features/INVESTIGATION.md "Legal Hold Rules". */
  legalHold?: boolean;

  // Populated only for closed + classified investigations, same shape/rendering as Insight.fwClassifications.
  fwClassifications?: FwClassification[];

  /** Set once "Flag as systemic cause" fires — id of the Insight this investigation's
   * findings were bridged into (specs/features/INVESTIGATION.md Stage 3). */
  systemicCauseInsightId?: string;
}
