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

/** Moved here from types/incident.ts (2026-09-15) — a general "how did the
 * control behave" classification that both Observation and Incident share,
 * same reasoning EnergyType/SignalType already live here rather than on
 * whichever entity happened to need them first. */
export type BarrierAssessment = 'barrier_absent' | 'barrier_failed' | 'barrier_degraded' | 'barrier_held' | 'none';

/** One AI-derived classification: the value itself, how confident the
 * enrichment job is, and a plain-English rationale explaining why —
 * mirrors the real Hiviz product's own Classification card (each of
 * Signal type/Energy/Barrier shown with a confidence % and a rationale
 * paragraph, not just a bare badge). 2026-09-15, see
 * [[project_investigation_timeline]]'s upstream-enrichment discussion.
 * Layered on *top* of the existing bare `signal_type`/`energy_type`/
 * `barrierAssessment` fields as an optional enhancement, not a replacement
 * — most observations/incidents (a missing restock tag, a nicked hand)
 * never got a meaningfully reasoned classification in the first place, and
 * padding them out with invented confidence/rationale would be worse than
 * just leaving them thin. Only populated where the mocked enrichment job
 * would genuinely have had something to say. */
export interface AiClassification<T> {
  value: T;
  confidence: number;
  rationale: string;
}

/** A single, event-specific hazard synthesis — "what's actually at risk
 * here," in plain language, distinct from picking a hazard off the static
 * Risk register (data/risk.ts's Hazard). Optional, same reasoning as
 * AiClassification above. */
export interface KeyHazard {
  title: string;
  rationale: string;
}

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
  visitId?: string;

  // Richer classification, 2026-09-15 — see AiClassification's own doc
  // comment for why these are optional additions alongside the bare
  // signal_type/energy_type above, not replacements for them.
  signalClassification?: AiClassification<SignalType>;
  energyClassification?: AiClassification<EnergyType>;
  barrierClassification?: AiClassification<BarrierAssessment>;
  keyHazard?: KeyHazard;
  /** -> SAFETY_PRACTICES ids (data/admin/taxonomies.ts) — same taxonomy
   * shape/admin-editable pattern as HIGH_RISK_WORK/Incident.workTypeId,
   * just multi-valued: a single event can implicate several practice
   * areas at once (e.g. contractor management *and* auditing). */
  safetyPracticeIds?: string[];
}
