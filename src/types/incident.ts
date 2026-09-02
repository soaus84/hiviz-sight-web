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
