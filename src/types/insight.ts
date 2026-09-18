import type { EnergyType } from './observation';

export type InsightStatus = 'review' | 'action' | 'closed';

// Mirrors the trigger_source → card label mapping in
// specs/features/CRITICAL-INSIGHT.md: a site-level algorithm trigger reads
// as "Worksite Trend", region/division/organisation-level (or an
// atrophy_pattern trigger) reads as "Cross-site Pattern", and a single
// high-confidence critical_observation trigger bypasses the trend threshold
// entirely and reads as "Critical Observation".
export type InsightKind = 'worksite_trend' | 'cross_site_pattern' | 'critical_observation';

export type FwFactor =
  // guide
  | 'senior_leadership'
  | 'strategy'
  | 'risk_management'
  | 'safety_organisation'
  | 'work_understanding'
  // enable
  | 'operational_management'
  | 'resource_allocation'
  | 'management_systems'
  | 'goal_conflict_tradeoffs'
  | 'learning_development'
  // execute
  | 'frontline_workers'
  | 'communications_coordination'
  | 'contractor_management'
  | 'decision_making'
  | 'monitoring_metrics';

export type FwDomain = 'guide' | 'enable' | 'execute';
export type FwMaturitySignal = 'compliant' | 'leading' | 'resilient';

export interface FwClassification {
  factor: FwFactor;
  domain: FwDomain;
  maturitySignal: FwMaturitySignal;
  confidence: number;
  rationale: string;
}

export interface Endorsement {
  name: string;
  note: string;
}

/** Retired 2026-09-11 in favour of Work Streams (data/workStreams.ts) — a
 * manager now pushes real site-tracked Toolbox talk/Learn/Improve streams
 * instead of filling in free text here, including for the immediate-
 * containment case ActionFields' own "Control" pillar used to cover (an
 * Improve stream created immediately, targeting just the relevant site,
 * covers that need). Kept only so already-closed insights that used the
 * old mechanism still render their historical outcome (ResolvedPillar in
 * InsightDetail.tsx) — never written to by anything new. */
export interface ActionFields {
  controlNeed?: string;
  controlDone?: string;
  learnNeed?: string;
  learnDone?: string;
  improveNeed?: string;
  improveDone?: string;
}

export type ResolutionType = 'acknowledged' | 'actioned';

export interface Insight {
  id: string;
  status: InsightStatus;
  kind: InsightKind;
  theme: string;
  title: string;
  summary: string;
  siteNames: string[];
  observationCount: number;
  supporterInitials: string[];
  energyTypes: EnergyType[];
  /** -> SAFETY_PRACTICES ids (data/admin/taxonomies.ts) — same rollup
   * convention as energyTypes above: hand-authored at seed time from the
   * source observations' own safetyPracticeIds, not derived in code. See
   * AiClassification's own doc comment, types/observation.ts (2026-09-15). */
  safetyPracticeIds?: string[];
  updated: string;
  updatedAt: string;
  cause?: string;
  /** Human-approval flag — true once routed for crew-facing action. Auto-set
   * only for insights entering via the Incident workspace's systemic cause
   * bridge (data/investigations.ts's flagSystemicCause) — per
   * specs/features/INVESTIGATION.md Stage 3, that trigger source skips the
   * AI-draft/review gate entirely since a safety manager already authored
   * and confirmed the content. Every other insight requires a real review
   * action before this flips true. */
  cleared_for_toolbox: boolean;
  owner?: string;

  // rich detail — only populated for the one enriched reference example
  suggested?: string;
  suggestedBasis?: string;
  causeBasis?: string;
  fwClassifications?: FwClassification[];
  endorsements?: Endorsement[];

  /** CriticalInsight Stage 1's own recommended_actions/recommended_questions/
   * toolbox_narrative (specs/features/CRITICAL-INSIGHT.md) — read-only AI
   * context, same "AI has suggested" convention as suggested/suggestedBasis
   * above and Investigation.aiSuggestedRootCause. Reused as the prefill
   * source when a manager creates a Work Stream (see data/workStreams.ts) —
   * never written automatically. Shape confirmed against a real generated
   * payload 2026-09-11 (see [[project_corrective_actions_enquiry_spec]]):
   * unlike Investigation's investigation.assist output, none of these carry
   * a per-item rationale — recommended_actions is ordered {step, action}
   * pairs with one overall rationale, recommended_questions is plain
   * strings, and toolbox_narrative is a single ready-to-read block, not a
   * step list. */
  aiSuggestedCorrectiveActions?: { step: number; action: string }[];
  aiSuggestedCorrectiveActionsRationale?: string;
  aiSuggestedInterviewQuestions?: string[];
  aiToolboxNarrative?: string;

  // resolution — populated once the insight leaves `review`. `action` is
  // legacy-only (see ActionFields' own comment) — new insights use Work
  // Streams instead.
  action?: ActionFields;
  /** How a `closed` insight got there — distinguishes a straight acknowledgement
   * (comment only) from one that went through the action fields above. */
  resolutionType?: ResolutionType;
  /** Manager's own words — set when resolutionType is 'acknowledged'. */
  resolutionComment?: string;
  /** Hiviz-authored recap of the action outcome — set when resolutionType is 'actioned'. */
  resolutionSummary?: string;
}
