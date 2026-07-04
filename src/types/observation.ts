// Field names/values follow the canonical taxonomy in the Hiviz roadmap specs
// (specs/globals/signal-type-taxonomy.md, energy-type-taxonomy.md) — terminology
// reference only, this project has no dependency on that repo's code or backend.

export type ObservationType = 'safe' | 'at-risk' | 'near-miss';

export type SignalType =
  | 'positive_performance'
  | 'weak_signal'
  | 'at_risk_condition'
  | 'unwanted_energy_event'
  | 'barrier_failure';

export type EnergyType =
  | 'kinetic'
  | 'gravitational'
  | 'electrical'
  | 'thermal'
  | 'chemical'
  | 'pressure'
  | 'noise_vibration'
  | 'none';

export type SharingScope = 'site' | 'region' | 'division' | 'organisation';

export type ObservationStatus = 'enriched' | 'classified' | 'linked';

export interface Observation {
  id: string;
  when: string;
  occurredAt: string;
  siteId: string;
  siteName: string;
  observerName: string;
  summary: string;
  signal_type: SignalType;
  energy_type: EnergyType;
  status: ObservationStatus;
  cleared_for_sharing: boolean;
  sharing_scope: SharingScope;
  linkedInsightId?: string;
}
