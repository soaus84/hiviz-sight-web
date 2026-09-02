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
export type BarrierFailureStatus = 'open' | 'pending_approval' | 'resolved';

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
  resolutionNote?: string;
  resolvedBy?: string;
  /** Set once escalated into the Insight pipeline — data/barrierFailures.ts's escalateToInsightPipeline. */
  linkedObservationId?: string;
}
