import type { FwDomain, FwFactor } from '@/types';

/** The 15 Forge Works Map® factors, for a human picker — 2026-09-15,
 * see [[project_investigation_timeline]]. Descriptions are the exact text
 * of `globals/fw-map-blueprint.md`'s own "SUMMARY-REFERENCE — fw-map-blueprint"
 * block in the Hiviz roadmap spec, which that file explicitly documents as
 * "a lightweight selection aid only" — one sentence per factor, no maturity
 * tiers, no diagnostic questions, no classification rules. That's the right
 * altitude for a person picking a factor while tagging a systemic finding;
 * the fuller per-factor content in that same spec file (compliant/leading/
 * resilient definitions, boundary cases) is reserved for the much heavier
 * `fw_classify` AI job, not modeled here. Do not paraphrase these — if the
 * spec's wording changes, update this to match rather than drifting. */
export const FW_FACTOR_DISPLAY: Record<FwFactor, { label: string; domain: FwDomain; description: string }> = {
  senior_leadership: { label: 'Senior leadership', domain: 'guide', description: 'How senior leaders talk about and embody safety, and what their decisions signal about what actually matters.' },
  strategy: { label: 'Strategy', domain: 'guide', description: 'What triggers safety improvements and what the documented direction prioritises.' },
  risk_management: { label: 'Risk management', domain: 'guide', description: 'The quality of risk information and whether it flows into operational decisions.' },
  safety_organisation: { label: 'Safety organisation', domain: 'guide', description: 'The capability and focus of the safety function — compliance monitor vs system improver.' },
  work_understanding: { label: 'Work understanding', domain: 'guide', description: 'The model of accident causation that drives decisions — human error vs system property.' },

  operational_management: { label: 'Operational management', domain: 'enable', description: 'The role of middle and frontline managers in translating plans into controlled work.' },
  resource_allocation: { label: 'Resource allocation', domain: 'enable', description: 'How safety resources — time, people, equipment, budget — are identified and allocated.' },
  management_systems: { label: 'Management systems', domain: 'enable', description: 'The documented frameworks, procedures, and standards governing how work is planned and controlled.' },
  goal_conflict_tradeoffs: { label: 'Goal conflict & trade-offs', domain: 'enable', description: 'How safety goals are balanced against production, cost, and schedule pressure.' },
  learning_development: { label: 'Learning & development', domain: 'enable', description: 'How the organisation builds capability and retains learning from experience.' },

  frontline_workers: { label: 'Frontline workers', domain: 'execute', description: 'The knowledge, capability, and engagement of workers performing the work (never frames as blame).' },
  communications_coordination: { label: 'Communications & coordination', domain: 'execute', description: 'How information flows between roles, teams, and shifts; how handovers and briefings work.' },
  decision_making: { label: 'Decision making', domain: 'execute', description: 'How operational decisions are made in the moment — rule-following vs informed real-time judgment.' },
  contractor_management: { label: 'Contractor management', domain: 'execute', description: 'How contractors are engaged, integrated, and managed alongside direct workforce.' },
  monitoring_metrics: { label: 'Monitoring & metrics', domain: 'execute', description: 'What is tracked to monitor safety performance and what triggers a response.' },
};

export const FW_DOMAIN_LABEL: Record<FwDomain, string> = {
  guide: 'Guide — direction & context',
  enable: 'Enable — resources & systems',
  execute: 'Execute — frontline & operations',
};
