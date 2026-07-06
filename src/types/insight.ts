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
  updated: string;
  updatedAt: string;
  cause?: string;
  /** Human-approval flag — true once routed for crew-facing action, never auto-set. */
  cleared_for_toolbox: boolean;
  step?: string;
  owner?: string;
  outcome?: string;

  // rich detail — only populated for the one enriched reference example
  suggested?: string;
  suggestedBasis?: string;
  causeBasis?: string;
  fwClassifications?: FwClassification[];
  endorsements?: Endorsement[];
}
