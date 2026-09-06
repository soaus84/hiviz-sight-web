import type { EnergyType } from './observation';
import type { SeverityClass } from './incident';

// Field names/values follow the canonical taxonomy in the Hiviz roadmap spec
// (specs/features/RISK-CONTROLS.md) — terminology reference only, this
// project has no dependency on that repo's code or backend. See
// data/risk.ts and data/barrierFailures.ts for what's deliberately
// simplified relative to that spec.

export type ControlType = 'prevention' | 'mitigation';

export type VerificationFrequency = 'shift_start' | 'daily' | 'before_ignition' | 'event_triggered' | 'weekly';

/** Deliberately 3 bands, not 5 — a rolling count of real-world events (see
 * data/risk.ts's computeLikelihood) doesn't support finer granularity
 * without inventing false precision. Combined with a Hazard's severityClass
 * via combineRiskRating to produce a work type's Risk rating. */
export type Likelihood = 'rare' | 'possible' | 'likely';

/** The bowtie centre — an unwanted energy event for a work type. workTypeId
 * points at the existing HIGH_RISK_WORK admin taxonomy (data/admin/taxonomies.ts),
 * reused as the work-type registry rather than duplicated — see the
 * top-of-file note in data/risk.ts. severityClass drives whether a
 * BarrierFailure under this hazard needs manager approval to resolve. */
export interface Hazard {
  id: string;
  workTypeId: string;
  name: string;
  energyType: EnergyType;
  severityClass: SeverityClass;
  description?: string;
}

/** The global register entry — authored once, pushed to many sites. */
export interface CriticalControl {
  id: string;
  hazardId: string;
  controlType: ControlType;
  name: string;
  verificationPrompt: string;
  failureConsequence: string;
  verificationFrequency: VerificationFrequency;
  rectificationSlaHours: number;
}

/**
 * pending_review   — pushed but not yet reviewed by the site
 * implementing     — accepted, rollout in progress
 * active           — full verification schedule running
 * active_defeating — active but a defeating factor is approaching expiry (not modeled — see data/risk.ts)
 * active_degraded  — defeating factor past expiry (not modeled — see data/risk.ts)
 * not_required     — site judged this control not applicable
 * superseded       — global control replaced, this instance retired
 */
export type WorksiteControlStatus = 'pending_review' | 'implementing' | 'active' | 'active_defeating' | 'active_degraded' | 'not_required' | 'superseded';

/** The local, per-site instance of a CriticalControl — created on push. */
export interface WorksiteControl {
  id: string;
  criticalControlId: string;
  siteId: string;
  status: WorksiteControlStatus;
  isLocallyModified?: boolean;
  /** Only ever a stricter-than-global standard — see specs/features/RISK-CONTROLS.md §4.2. */
  localOverrideText?: string;
  /** Set when status = 'not_required'. */
  rejectionReason?: string;
  assignedVerifierName?: string;
  lastVerifiedAt?: string;
  /** Display string, matches the app's `when` convention (e.g. "Today", "2d ago"). */
  lastVerified?: string;
}

/**
 * open             — flagged not-in-place, awaiting action
 * pending_approval — fixed and submitted for manager sign-off (serious/critical hazards only)
 * resolved         — closed, either self-resolved (minor/moderate) or manager-approved
 */
/**
 * open     — site's job, not yet submitted. No manager action exists here.
 * review   — submitted (first time, or after a return), awaiting the
 *            manager's decision: approve or return. Only status
 *            `requiresApproval` failures ever reach this — see
 *            data/barrierFailures.ts's requiresApproval.
 * returned — the manager sent it back with a specific direction; the
 *            site's turn again, not the manager's. Deliberately distinct
 *            from `open` — a rejected resubmission needing to look
 *            different from one nobody's touched yet was the whole point
 *            of adding this status (see data/myWorkspace.ts's stocktake
 *            note on why it isn't just `open` again).
 * resolved — approved. Terminal.
 */
export type BarrierFailureStatus = 'open' | 'review' | 'returned' | 'resolved';

/** One submission-or-decision in a BarrierFailure's approval history —
 * see BarrierFailure.rounds. The loop (submit -> review -> returned ->
 * resubmit -> review -> ...) isn't capped; what changes each round isn't
 * how many are allowed, but how much each one costs: a first submission
 * (`kind: 'submitted'`, `open` -> `review`) needs a real account of what
 * was done, while a resubmission after a return is a lighter confirmation
 * against the manager's own stated direction, not a fresh essay — see
 * views/risk/BarrierFailureDetail.tsx. */
export interface BarrierFailureRound {
  kind: 'submitted' | 'approved' | 'returned';
  by: string;
  at: string;
  /** The site's account of what was done (kind: submitted), or the
   * manager's specific direction for the next round (kind: returned).
   * Unset for kind: approved — nothing more to say once it's closed. */
  note?: string;
}

/** A control verification that came back not-in-place. Carries its own full
 * story at creation (unlike Investigation, there's no separate story-bearing
 * entity one step upstream) — see views/risk/BarrierFailureDetail.tsx. */
export interface BarrierFailure {
  id: string;
  worksiteControlId: string;
  siteId: string;
  siteName: string;
  controlName: string;
  controlType: ControlType;
  hazardName: string;
  /** Copied from the hazard at flag time. */
  severityClass: SeverityClass;
  energyType: EnergyType;
  /** Derived: severityClass is 'serious' | 'critical'. Structural, not a per-control flag. */
  requiresApproval: boolean;
  flaggedBy: string;
  when: string;
  flaggedAt: string;
  /** What the verifier saw. */
  notes?: string;
  status: BarrierFailureStatus;
  /** Append-only approval history — every submission, return, and the
   * final approval, in order. The one place "is this the first review or
   * the third" is actually answered, rather than left for the status alone
   * (which can't tell you, since it's the same value each time round). */
  rounds: BarrierFailureRound[];
  /** Convenience mirror of the latest round's note/author — kept in sync
   * by data/barrierFailures.ts's mutators alongside `rounds`, so existing
   * "what's the current resolution text" call sites don't need to reach
   * into the array themselves. `rounds` is the source of truth for history;
   * these two are a read shortcut for "right now", nothing more. */
  resolutionNote?: string;
  resolvedBy?: string;

  // Stop-work fields, mirroring Incident's exact fields (types/incident.ts)
  // field-for-field — a critical control failure is the same live-hazard
  // question as an Incident's near-miss, just caught pre-event by a
  // scheduled check instead of post-event by something almost happening.
  // Same decision, same shape, deliberately not re-derived. See
  // data/stopWork.ts's top-of-file note.
  stopWorkWarranted?: boolean;
  stopWorkWarrantedRationale?: string;
  stopWorkCalled?: boolean;
  stopWorkEventId?: string;
  stopWorkDismissedBy?: string;
  stopWorkDismissedAt?: string;
  stopWorkDismissedNote?: string;
}
