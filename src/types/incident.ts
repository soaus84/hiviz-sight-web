import type { EnergyType, SharingScope } from './observation';
import type { FwClassification } from './insight';

// Field names/values follow the canonical taxonomy in the Hiviz roadmap specs
// (specs/features/INCIDENT-CAPTURE.md, CRITICAL-INCIDENT.md, INVESTIGATION.md)
// — terminology reference only, this project has no dependency on that
// repo's code or backend. See data/incidents.ts and data/investigations.ts
// for what's deliberately simplified relative to those specs.

export type IncidentType = 'near-miss' | 'injury' | 'property-damage' | 'environmental';

export type InjuryClassification = 'none' | 'first_aid' | 'medical_treatment' | 'restricted_work' | 'lost_time' | 'fatality';

export type SeverityClass = 'minor' | 'moderate' | 'serious' | 'critical';

export type BarrierAssessment = 'barrier_absent' | 'barrier_failed' | 'barrier_degraded' | 'barrier_held' | 'none';

/**
 * reported     — captured, doesn't meet severe criteria (mirrors Observation 'enriched')
 * severe       — meets escalation criteria, pending safety-manager review (mirrors Insight 'review')
 * acknowledged — reviewed, closed without opening an investigation (terminal)
 * linked       — progressed to investigation, linkedInvestigationId set (mirrors Observation 'linked')
 */
export type IncidentStatus = 'reported' | 'severe' | 'acknowledged' | 'linked';

export interface Incident {
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
   * manager's call, never settable from a site-side capture. Editable for
   * the life of the stop (not fixed at creation) via data/stopWork.ts's
   * setSiteWide — a situation can turn out broader than first assessed. */
  siteWide?: boolean;
  /** Set at creation via a manager's Request stop work action — who
   * requested it, not who executed it. Unset when the site already called
   * it at capture (nothing to request, it already happened). */
  requestedBy?: string;
  requestedAt?: string;
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
 * open   — investigator actively completing the framework fields (editable).
 *          This is Investigation's 'action' equivalent — the review/triage
 *          decision already happened one step earlier, on the Incident
 *          (status 'severe'), which is what actually mirrors Insight's
 *          'review' status: a story to read plus an Acknowledge/Progress
 *          fork. An Investigation only exists once that fork has already
 *          resolved to "progress" — there's nothing left to review before
 *          the work starts, so there's no separate review status here.
 * closed — the close gate (immediate cause, root cause, >=1 corrective
 *          action, specs/features/INVESTIGATION.md) gates this directly, no
 *          extra approval step — same as Insight's action -> closed.
 */
export type InvestigationStatus = 'open' | 'closed';

export interface ContributingFactor {
  factor: string;
  rationale: string;
}

export interface CorrectiveAction {
  action: string;
  rationale: string;
  owner?: string;
  dueDate?: string;
  done?: boolean;
}

export interface Investigation {
  id: string;
  status: InvestigationStatus;
  title: string;
  summary: string;
  siteNames: string[];
  incidentCount: number;
  energyTypes: EnergyType[];
  updated: string;
  updatedAt: string;
  severityClass: SeverityClass;
  investigatorName?: string;

  // Close-gate framework fields — specs/features/INVESTIGATION.md Stage 1
  immediateCause?: string;
  contributingFactors?: ContributingFactor[];
  rootCause?: string;
  correctiveActions?: CorrectiveAction[];
  clearedForSharing?: boolean;
  sharingScope?: SharingScope;

  /** Hard block on narrative/FW-classify/systemic-cause while true — specs/features/INVESTIGATION.md "Legal Hold Rules". */
  legalHold?: boolean;

  // Populated only for closed + classified investigations, same shape/rendering as Insight.fwClassifications.
  fwClassifications?: FwClassification[];

  /** Set once "Flag as systemic cause" fires — id of the Insight this investigation's
   * findings were bridged into (specs/features/INVESTIGATION.md Stage 3). */
  systemicCauseInsightId?: string;
}
