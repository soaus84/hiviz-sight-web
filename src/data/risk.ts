import type { BarrierFailure, CriticalControl, Hazard, Likelihood, SeverityClass, Site, WorksiteControl, WorksiteControlStatus } from '@/types';
import { SITES } from './sites';
import { BARRIER_FAILURES } from './barrierFailures';
import { INCIDENTS } from './incidents';

// Reconciliation with Hiviz roadmap v1/specs/features/RISK-CONTROLS.md —
// deliberate simplifications for this frontend-only mock (no backend, no AI
// calls), on top of the office-side-only scope decision (no supervisor
// tap-to-verify checklist — verification outcomes are pre-seeded data, the
// way Incidents already are):
//
// - ControlVerification as a full event log isn't modeled — only failures
//   (see data/barrierFailures.ts) are represented as records. A passing
//   verification just isn't logged individually here.
// - Defeating factors (§2.3 — time-limited conditions eroding a control's
//   effectiveness) aren't modeled. The spec itself treats the clockwork
//   execution as V2; the 'active_defeating'/'active_degraded' statuses exist
//   on WorksiteControlStatus for type fidelity but nothing in this mock ever
//   sets them.
// - "Work type" is not a Risk-workspace entity — it's the existing
//   HIGH_RISK_WORK admin taxonomy (data/admin/taxonomies.ts), reused
//   directly. A Hazard's workTypeId and a Site's workTypeIds both point at
//   HIGH_RISK_WORK ids — that shared vocabulary is what "push to sites doing
//   that work" targets against.

export const HAZARDS: Hazard[] = [
  { id: 'hz1', workTypeId: 'hrw20', name: 'Uncontrolled fire — hot work ignition', energyType: 'thermal', severityClass: 'critical',
    description: 'Welding, cutting or grinding ignites nearby flammable material or vapour.' },
  { id: 'hz2', workTypeId: 'hrw24', name: 'Struck-by — uncontrolled mobile plant movement', energyType: 'kinetic', severityClass: 'critical',
    description: 'A person is struck by mobile plant reversing or turning without adequate warning or exclusion.' },
  { id: 'hz3', workTypeId: 'hrw3', name: 'Atmosphere hazard — confined space entry', energyType: 'chemical', severityClass: 'serious',
    description: 'Oxygen-deficient or toxic atmosphere inside a confined space not identified before entry.' },
  { id: 'hz4', workTypeId: 'hrw9', name: 'Contact with energised equipment', energyType: 'electrical', severityClass: 'critical',
    description: 'Work proceeds on plant or circuits that were not correctly isolated.' },
  { id: 'hz5', workTypeId: 'hrw32', name: 'Fall from height', energyType: 'gravitational', severityClass: 'serious',
    description: 'A worker falls while working above 1.8m without an effective fall arrest system.' },
  { id: 'hz6', workTypeId: 'hrw24', name: 'Equipment left out of storage — damage or trip hazard', energyType: 'none', severityClass: 'minor',
    description: 'Tools or equipment left out after use, creating a trip hazard or damage risk.' },
];

export const HAZARDS_BY_ID: Record<string, Hazard> = Object.fromEntries(HAZARDS.map((h) => [h.id, h]));

let nextHazardSeq = 7;

export function addHazard(input: Omit<Hazard, 'id'>): Hazard {
  const hazard: Hazard = { ...input, id: `hz${nextHazardSeq++}` };
  HAZARDS.push(hazard);
  HAZARDS_BY_ID[hazard.id] = hazard;
  return hazard;
}

export function updateHazard(id: string, patch: Partial<Omit<Hazard, 'id'>>): Hazard | null {
  const idx = HAZARDS.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  const updated: Hazard = { ...HAZARDS[idx], ...patch };
  HAZARDS[idx] = updated;
  HAZARDS_BY_ID[id] = updated;
  return updated;
}

/** Cascades to the hazard's own CriticalControls, but only when none of them
 * have been pushed to a site yet — a control already live at a worksite
 * can't just vanish from under it. */
export function deleteHazard(id: string): { error?: string } {
  const controls = CRITICAL_CONTROLS.filter((c) => c.hazardId === id);
  if (controls.some((c) => WORKSITE_CONTROLS.some((wc) => wc.criticalControlId === c.id))) {
    return { error: 'This hazard has controls already pushed to sites — remove those first.' };
  }
  for (const c of controls) deleteControl(c.id);
  const idx = HAZARDS.findIndex((h) => h.id === id);
  if (idx !== -1) HAZARDS.splice(idx, 1);
  delete HAZARDS_BY_ID[id];
  return {};
}

export const CRITICAL_CONTROLS: CriticalControl[] = [
  // Hot work ignition
  { id: 'cc1', hazardId: 'hz1', controlType: 'prevention', name: 'Fire watch confirmed in position', verificationPrompt: 'Is the fire watch confirmed in position at the work location?', failureConsequence: 'An ignition source runs unmonitored — a spot fire can establish and spread before anyone notices.', verificationFrequency: 'before_ignition', rectificationSlaHours: 1 },
  { id: 'cc2', hazardId: 'hz1', controlType: 'prevention', name: 'PTW signed and present at work location', verificationPrompt: 'Is the signed permit to work present at the work location?', failureConsequence: 'Hot work proceeds without the conditions and checks the permit was meant to enforce.', verificationFrequency: 'before_ignition', rectificationSlaHours: 1 },
  { id: 'cc3', hazardId: 'hz1', controlType: 'prevention', name: 'Area clear of flammables within 5m', verificationPrompt: 'Is the area within 5m of the work clear of flammable material?', failureConsequence: 'Sparks or heat reach nearby flammable material, providing fuel for ignition.', verificationFrequency: 'before_ignition', rectificationSlaHours: 1 },
  { id: 'cc4', hazardId: 'hz1', controlType: 'mitigation', name: 'Fire extinguisher accessible within 5m', verificationPrompt: 'Is a rated fire extinguisher accessible within 5m of the work?', failureConsequence: 'A small fire cannot be knocked down immediately and has time to establish.', verificationFrequency: 'shift_start', rectificationSlaHours: 4 },
  { id: 'cc5', hazardId: 'hz1', controlType: 'mitigation', name: 'Fire blanket rated for welding temperature', verificationPrompt: 'Is a fire blanket rated for welding temperature present and undamaged?', failureConsequence: 'The mitigation layer for a small ignition on the person or nearby material is missing.', verificationFrequency: 'shift_start', rectificationSlaHours: 4 },

  // Struck-by — mobile plant
  { id: 'cc6', hazardId: 'hz2', controlType: 'prevention', name: 'Spotter confirmed in position for reversing', verificationPrompt: 'Is a spotter confirmed in position before the vehicle reverses?', failureConsequence: 'The operator reverses with a blind spot uncovered — a person in that zone will not be seen.', verificationFrequency: 'shift_start', rectificationSlaHours: 1 },
  { id: 'cc7', hazardId: 'hz2', controlType: 'prevention', name: 'Exclusion zone barricaded', verificationPrompt: 'Is the exclusion zone around active mobile plant barricaded?', failureConsequence: 'Pedestrians can walk into the plant\'s working radius without a physical barrier stopping them.', verificationFrequency: 'daily', rectificationSlaHours: 4 },
  { id: 'cc8', hazardId: 'hz2', controlType: 'mitigation', name: 'Reversing alarm functional', verificationPrompt: 'Is the reversing alarm audible and functioning?', failureConsequence: 'Nobody nearby is warned the vehicle is about to move, removing the last line of defence.', verificationFrequency: 'shift_start', rectificationSlaHours: 4 },

  // Confined space atmosphere
  { id: 'cc9', hazardId: 'hz3', controlType: 'prevention', name: 'Atmospheric testing completed before entry', verificationPrompt: 'Has atmospheric testing been completed and logged before entry?', failureConsequence: 'Entry proceeds into a space with an unknown or unsafe atmosphere.', verificationFrequency: 'before_ignition', rectificationSlaHours: 1 },
  { id: 'cc10', hazardId: 'hz3', controlType: 'prevention', name: 'Permit to work signed', verificationPrompt: 'Is the confined space entry permit signed and present?', failureConsequence: 'Entry proceeds without the checks and conditions the permit is meant to enforce.', verificationFrequency: 'before_ignition', rectificationSlaHours: 1 },
  { id: 'cc11', hazardId: 'hz3', controlType: 'mitigation', name: 'Standby person in attendance', verificationPrompt: 'Is a standby person in continuous attendance at the entry point?', failureConsequence: 'Nobody outside the space can raise the alarm or initiate rescue if something goes wrong inside.', verificationFrequency: 'shift_start', rectificationSlaHours: 1 },

  // Energised equipment
  { id: 'cc12', hazardId: 'hz4', controlType: 'prevention', name: 'Isolation confirmed and locked out', verificationPrompt: 'Is the equipment isolated and locked out with a tag applied?', failureConsequence: 'Work proceeds on plant that can still be energised, live or otherwise.', verificationFrequency: 'before_ignition', rectificationSlaHours: 1 },
  { id: 'cc13', hazardId: 'hz4', controlType: 'mitigation', name: 'Insulated PPE available and inspected', verificationPrompt: 'Is insulated PPE available and free of visible damage?', failureConsequence: 'If contact does occur, there is no insulating layer between the worker and the energy source.', verificationFrequency: 'shift_start', rectificationSlaHours: 4 },

  // Fall from height
  { id: 'cc14', hazardId: 'hz5', controlType: 'prevention', name: 'Fall arrest anchor point inspected', verificationPrompt: 'Has the anchor point been inspected and tagged current?', failureConsequence: 'A fall arrest system is connected to an anchor point that may not hold.', verificationFrequency: 'daily', rectificationSlaHours: 4 },
  { id: 'cc15', hazardId: 'hz5', controlType: 'mitigation', name: 'Harness and lanyard inspected before use', verificationPrompt: 'Has the harness and lanyard been inspected before this use?', failureConsequence: 'A fall is not effectively arrested if the harness or lanyard has an undetected defect.', verificationFrequency: 'shift_start', rectificationSlaHours: 4 },

  // Equipment storage
  { id: 'cc16', hazardId: 'hz6', controlType: 'prevention', name: 'Equipment returned to designated storage after use', verificationPrompt: 'Has equipment been returned to its designated storage location after use?', failureConsequence: 'Loose equipment left in walkways or work areas creates a trip hazard and is exposed to damage.', verificationFrequency: 'daily', rectificationSlaHours: 24 },
];

export const CRITICAL_CONTROLS_BY_ID: Record<string, CriticalControl> = Object.fromEntries(CRITICAL_CONTROLS.map((c) => [c.id, c]));

let nextCriticalControlSeq = 20;

export function addControl(input: Omit<CriticalControl, 'id'>): CriticalControl {
  const control: CriticalControl = { ...input, id: `cc${nextCriticalControlSeq++}` };
  CRITICAL_CONTROLS.push(control);
  CRITICAL_CONTROLS_BY_ID[control.id] = control;
  return control;
}

export function updateControl(id: string, patch: Partial<Omit<CriticalControl, 'id' | 'hazardId'>>): CriticalControl | null {
  const idx = CRITICAL_CONTROLS.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const updated: CriticalControl = { ...CRITICAL_CONTROLS[idx], ...patch };
  CRITICAL_CONTROLS[idx] = updated;
  CRITICAL_CONTROLS_BY_ID[id] = updated;
  return updated;
}

/** Blocked once the control has been pushed to any site — see deleteHazard's
 * note above, same reasoning at the individual control level. */
export function deleteControl(id: string): { error?: string } {
  if (WORKSITE_CONTROLS.some((wc) => wc.criticalControlId === id)) {
    return { error: 'This control has already been pushed to sites — remove those instances first.' };
  }
  const idx = CRITICAL_CONTROLS.findIndex((c) => c.id === id);
  if (idx !== -1) CRITICAL_CONTROLS.splice(idx, 1);
  delete CRITICAL_CONTROLS_BY_ID[id];
  return {};
}

function site(name: string) {
  return SITES.find((s) => s.name === name)!;
}

export const WORKSITE_CONTROLS: WorksiteControl[] = [
  // Northgate Open Cut — hot work + mobile plant
  { id: 'wc1', criticalControlId: 'cc1', siteId: site('Northgate Open Cut').id, status: 'active', assignedVerifierName: 'Kim Lee', lastVerifiedAt: '2025-05-07T06:30:00', lastVerified: 'Today' },
  { id: 'wc2', criticalControlId: 'cc2', siteId: site('Northgate Open Cut').id, status: 'active', assignedVerifierName: 'Kim Lee', lastVerifiedAt: '2025-05-07T06:30:00', lastVerified: 'Today' },
  { id: 'wc3', criticalControlId: 'cc4', siteId: site('Northgate Open Cut').id, status: 'pending_review' },
  { id: 'wc4', criticalControlId: 'cc6', siteId: site('Northgate Open Cut').id, status: 'active', assignedVerifierName: 'James Morrow', lastVerifiedAt: '2025-05-07T06:15:00', lastVerified: 'Today' },
  { id: 'wc5', criticalControlId: 'cc8', siteId: site('Northgate Open Cut').id, status: 'active', assignedVerifierName: 'James Morrow', lastVerifiedAt: '2025-05-07T06:15:00', lastVerified: 'Today' },

  // Ridgeback Processing — hot work + confined spaces + energised systems
  { id: 'wc6', criticalControlId: 'cc1', siteId: site('Ridgeback Processing').id, status: 'implementing' },
  { id: 'wc7', criticalControlId: 'cc9', siteId: site('Ridgeback Processing').id, status: 'active', assignedVerifierName: 'A. Pereira', lastVerifiedAt: '2025-05-05T09:00:00', lastVerified: '2d ago' },
  { id: 'wc8', criticalControlId: 'cc12', siteId: site('Ridgeback Processing').id, status: 'pending_review' },

  // Coolinga Plant — hot work + confined spaces + work at heights
  { id: 'wc9', criticalControlId: 'cc1', siteId: site('Coolinga Plant').id, status: 'active', assignedVerifierName: 'Jess Liang', lastVerifiedAt: '2025-05-06T15:00:00', lastVerified: 'Yesterday' },
  { id: 'wc10', criticalControlId: 'cc14', siteId: site('Coolinga Plant').id, status: 'active', assignedVerifierName: 'Jess Liang', lastVerifiedAt: '2025-04-20T09:00:00', lastVerified: '3w ago' },
  { id: 'wc11', criticalControlId: 'cc9', siteId: site('Coolinga Plant').id, status: 'not_required', rejectionReason: 'No confined space work currently active at this site — will re-review if scheduled.' },

  // Jewell Crusher — mobile plant + hot work
  { id: 'wc12', criticalControlId: 'cc6', siteId: site('Jewell Crusher').id, status: 'active', assignedVerifierName: 'Marcus Okafor', lastVerifiedAt: '2025-05-05T09:00:00', lastVerified: '2d ago' },
  { id: 'wc13', criticalControlId: 'cc1', siteId: site('Jewell Crusher').id, status: 'pending_review' },

  // Sylvania Underground — underground mining + confined spaces + hot work
  { id: 'wc14', criticalControlId: 'cc9', siteId: site('Sylvania Underground').id, status: 'active', assignedVerifierName: 'Kim Lee', lastVerifiedAt: '2025-04-23T09:00:00', lastVerified: '2w ago' },
  { id: 'wc15', criticalControlId: 'cc1', siteId: site('Sylvania Underground').id, status: 'active', assignedVerifierName: 'Kim Lee', lastVerifiedAt: '2025-04-23T09:00:00', lastVerified: '2w ago' },

  // Equipment storage — pushed wherever mobile plant runs
  { id: 'wc16', criticalControlId: 'cc16', siteId: site('Northgate Open Cut').id, status: 'active', assignedVerifierName: 'James Morrow', lastVerifiedAt: '2025-05-07T06:00:00', lastVerified: 'Today' },
  { id: 'wc17', criticalControlId: 'cc16', siteId: site('Marlow Stockyard').id, status: 'active', assignedVerifierName: 'D. Cole', lastVerifiedAt: '2025-05-02T08:00:00', lastVerified: '5d ago' },
  { id: 'wc18', criticalControlId: 'cc16', siteId: site('Brookman Pit 2').id, status: 'active', assignedVerifierName: 'R. Bridges', lastVerifiedAt: '2025-05-07T07:30:00', lastVerified: 'Today' },
];

export const WORKSITE_CONTROLS_BY_ID: Record<string, WorksiteControl> = Object.fromEntries(WORKSITE_CONTROLS.map((c) => [c.id, c]));

function replaceWorksiteControl(id: string, patch: Partial<WorksiteControl>): WorksiteControl | null {
  const idx = WORKSITE_CONTROLS.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const updated: WorksiteControl = { ...WORKSITE_CONTROLS[idx], ...patch };
  WORKSITE_CONTROLS[idx] = updated;
  WORKSITE_CONTROLS_BY_ID[id] = updated;
  return updated;
}

let nextWorksiteControlSeq = 20;

/** Push/accept model, specs/features/RISK-CONTROLS.md §4.1 — creates a
 * pending_review WorksiteControl at every site whose workTypeIds include the
 * control's hazard's workTypeId, skipping sites that already have one. */
export function pushControlToSites(criticalControlId: string): WorksiteControl[] {
  const control = CRITICAL_CONTROLS_BY_ID[criticalControlId];
  if (!control) return [];
  const hazard = HAZARDS_BY_ID[control.hazardId];
  if (!hazard) return [];
  const alreadyPushed = new Set(WORKSITE_CONTROLS.filter((c) => c.criticalControlId === criticalControlId).map((c) => c.siteId));
  const targets = SITES.filter((s) => s.workTypeIds.includes(hazard.workTypeId) && !alreadyPushed.has(s.id));
  return targets.map((s) => {
    const wc: WorksiteControl = { id: `wc${nextWorksiteControlSeq++}`, criticalControlId, siteId: s.id, status: 'pending_review' };
    WORKSITE_CONTROLS.push(wc);
    WORKSITE_CONTROLS_BY_ID[wc.id] = wc;
    return wc;
  });
}

/** pending_review -> implementing. */
export function acceptControl(id: string): WorksiteControl | null {
  return replaceWorksiteControl(id, { status: 'implementing', isLocallyModified: false });
}

/** pending_review -> implementing, with a stricter-only local standard —
 * specs/features/RISK-CONTROLS.md §4.2. */
export function modifyControl(id: string, overrideText: string): WorksiteControl | null {
  return replaceWorksiteControl(id, { status: 'implementing', isLocallyModified: true, localOverrideText: overrideText });
}

/** pending_review -> not_required. */
export function markNotRequired(id: string, reason: string): WorksiteControl | null {
  return replaceWorksiteControl(id, { status: 'not_required', rejectionReason: reason });
}

/** implementing -> active, once a verifier is assigned. */
export function activateControl(id: string, verifierName: string): WorksiteControl | null {
  return replaceWorksiteControl(id, { status: 'active', assignedVerifierName: verifierName });
}

/** Resolves a BarrierFailure back to the work type its failing control's
 * hazard belongs to, via real ids (worksiteControlId -> criticalControlId ->
 * hazardId -> workTypeId) rather than BarrierFailure's own denormalized
 * name strings, which aren't reliable join keys. Used to roll barrier
 * failures up to the work-type level in views/risk/WorkTypes.tsx and
 * WorkTypeDetail.tsx. */
export function workTypeIdForBarrierFailure(b: BarrierFailure): string | undefined {
  const wc = WORKSITE_CONTROLS_BY_ID[b.worksiteControlId];
  const control = wc ? CRITICAL_CONTROLS_BY_ID[wc.criticalControlId] : undefined;
  const hazard = control ? HAZARDS_BY_ID[control.hazardId] : undefined;
  return hazard?.workTypeId;
}

export function statusLabel(status: WorksiteControlStatus): string {
  switch (status) {
    case 'pending_review': return 'Pending review';
    case 'implementing': return 'Implementing';
    case 'active': return 'Active';
    case 'active_defeating': return 'Active · defeating';
    case 'active_degraded': return 'Active · degraded';
    case 'not_required': return 'Not required';
    case 'superseded': return 'Superseded';
  }
}

// --- Risk rating: likelihood x severity, at the work-type level ---
//
// Consequence (Hazard.severityClass) is authored by hand. Likelihood is the
// other half of a real risk rating and is deliberately NOT authored — it's
// derived from actual history (barrier failures + incidents) so the rating
// reflects what's really happening, not just what's on paper. Computed at
// the work-type level, not per-hazard: that's the one grain both Incidents
// (via workTypeId) and BarrierFailures (via workTypeIdForBarrierFailure
// above) can genuinely join on — attributing a specific incident to one
// hazard within a work type would be a guess this mock has no basis for.
//
// 3 likelihood bands, not 5 — a rolling count of a handful of real events
// doesn't support finer granularity without inventing false precision, and
// it keeps the combination matrix small enough to be fully explainable (12
// cells) rather than an opaque black-box score.

// Same fixed narrative "now" the rest of the mock data uses.
const MOCK_NOW_RISK = new Date('2025-05-07T10:00:00');
const LIKELIHOOD_WINDOW_DAYS = 90;

/** 0 events -> rare, 1-2 -> possible, 3+ -> likely. Named thresholds so the
 * rule is legible in the source, not buried as inline magic numbers. */
const LIKELY_THRESHOLD = 3;
const POSSIBLE_THRESHOLD = 1;

export function computeLikelihood(eventCount: number): Likelihood {
  if (eventCount >= LIKELY_THRESHOLD) return 'likely';
  if (eventCount >= POSSIBLE_THRESHOLD) return 'possible';
  return 'rare';
}

// The 12-cell table. One sentence explains it: likely bumps the rating up a
// band, rare drops it down a band, possible leaves it as authored — capped
// at the ends. Reuses SeverityClass as the output vocabulary too, on
// purpose: one shared 4-band language for consequence, likelihood's effect,
// and the combined rating, rather than a 4th naming scheme to learn.
export const RISK_RATING_MATRIX: Record<SeverityClass, Record<Likelihood, SeverityClass>> = {
  minor: { rare: 'minor', possible: 'minor', likely: 'moderate' },
  moderate: { rare: 'minor', possible: 'moderate', likely: 'serious' },
  serious: { rare: 'moderate', possible: 'serious', likely: 'critical' },
  critical: { rare: 'serious', possible: 'critical', likely: 'critical' },
};

export function combineRiskRating(severity: SeverityClass, likelihood: Likelihood): SeverityClass {
  return RISK_RATING_MATRIX[severity][likelihood];
}

/** Shared ordering for every "worst of" comparison in this file and its
 * views (site rollup here, and RiskDashboard's "highest risk work types"
 * sort) — one rank table so the band order can't drift between them. */
export const RATING_RANK: Record<SeverityClass, number> = { minor: 0, moderate: 1, serious: 2, critical: 3 };

export interface WorkTypeRisk {
  /** Worst hazard severity defined for this work type. Null when no hazard
   * has been defined yet — there's nothing to rate. */
  severity: SeverityClass | null;
  likelihood: Likelihood;
  /** Barrier failures + incidents for this work type, at the given sites, in
   * the trailing LIKELIHOOD_WINDOW_DAYS window — regardless of current
   * status, since "did it happen" is what likelihood measures, not whether
   * it's still open. */
  eventCount: number;
  rating: SeverityClass | null;
}

/** The one function every Risk view calls for the work-type risk lens
 * (WorkTypes.tsx, WorkTypeDetail.tsx, RiskDashboard.tsx) — keeps the
 * severity/likelihood/rating computation in exactly one place. `sites`
 * defaults to every site (no purview scoping); pass a purview-filtered list
 * to scope the event count the same way the rest of a view is scoped. */
export function computeWorkTypeRisk(workTypeId: string, sites = SITES): WorkTypeRisk {
  const hazards = HAZARDS.filter((h) => h.workTypeId === workTypeId);
  const severity = hazards.reduce<SeverityClass | null>((worst, h) => {
    return !worst || RATING_RANK[h.severityClass] > RATING_RANK[worst] ? h.severityClass : worst;
  }, null);

  const siteIds = new Set(sites.map((s) => s.id));
  const cutoff = new Date(MOCK_NOW_RISK.getTime() - LIKELIHOOD_WINDOW_DAYS * 86_400_000);

  const failureCount = BARRIER_FAILURES.filter(
    (b) => siteIds.has(b.siteId) && workTypeIdForBarrierFailure(b) === workTypeId && new Date(b.flaggedAt) >= cutoff,
  ).length;
  const incidentCount = INCIDENTS.filter(
    (i) => siteIds.has(i.siteId) && i.workTypeId === workTypeId && new Date(i.occurredAt) >= cutoff,
  ).length;

  const eventCount = failureCount + incidentCount;
  const likelihood = computeLikelihood(eventCount);
  const rating = severity ? combineRiskRating(severity, likelihood) : null;

  return { severity, likelihood, eventCount, rating };
}

export interface SiteRisk {
  rating: SeverityClass | null;
  /** Which of the site's work types produced the rating — the one line
   * "why is this site Critical" resolves to. */
  worstWorkTypeId: string | null;
}

/** A site's risk score is the worst of its work types' ratings, not an
 * average — a site is only as safe as its least-controlled work type, and
 * an average would quietly bury that. Work types with no hazard defined yet
 * don't contribute a rating (nothing to roll up) — that's a distinct
 * problem from "rated but risky", surfaced instead on the Work Types list. */
export function computeSiteRisk(site: Site): SiteRisk {
  let best: SiteRisk = { rating: null, worstWorkTypeId: null };
  for (const workTypeId of site.workTypeIds) {
    const { rating } = computeWorkTypeRisk(workTypeId, [site]);
    if (rating && (!best.rating || RATING_RANK[rating] > RATING_RANK[best.rating])) {
      best = { rating, worstWorkTypeId: workTypeId };
    }
  }
  return best;
}

/** WorksiteControls at a site that the site has already accepted
 * (status = 'implementing') but hasn't finished rolling out to a full
 * verification schedule (status = 'active') yet — see activateControl.
 * Deliberately the only "coverage gap" surfaced at the site level: once a
 * site has accepted a control, finishing the rollout is squarely theirs to
 * own. A control that was simply never pushed here isn't counted — that
 * gap may have a perfectly good reason and belongs upstream instead (Work
 * Types list for "no hazard defined at all", HazardDetail's per-control
 * "Push to N more sites" for "defined but not yet pushed here"). */
export function implementingControlsCount(site: Site): number {
  return WORKSITE_CONTROLS.filter((wc) => wc.siteId === site.id && wc.status === 'implementing').length;
}

// --- Control effectiveness: a control's own reliability track record ---
//
// Distinct from a hazard's risk rating (severity x likelihood, above): that
// answers "how dangerous is this hazard right now", this answers "how often
// does THIS specific control actually hold up when verified" — a control
// can be reliable under a critical hazard, or unreliable under a minor one.
// Same constraint as everywhere else in this file (top-of-file note): only
// failures are logged, a passing verification isn't recorded as an event,
// so effectiveness can only be read from failure frequency, not a true pass
// rate. Reuses computeLikelihood's thresholds and 90-day window rather than
// inventing a 4th "how often does this happen" scale.

/** A control is only ever actually verified once it's active at a site
 * (see WorksiteControlStatus's doc comment — "active: full verification
 * schedule running"); pending_review/implementing/not_required instances
 * have never been checked, so their failure count is structurally always
 * 0. Without this, computeControlEffectiveness would read that 0 as a
 * clean record ("Reliable") instead of what it actually is — no data yet. */
const VERIFIED_STATUSES: WorksiteControlStatus[] = ['active', 'active_defeating', 'active_degraded'];

export interface ControlEffectiveness {
  failureCount: number;
  /** Null when no relevant instance has ever reached an actively-verified
   * status — nothing to score yet, not a clean record. */
  likelihood: Likelihood | null;
}

/** The BarrierFailures behind a control's effectiveness score, most recent
 * first — `siteId` narrows to one worksite's own instance (same control,
 * same computation, just a smaller failure set) for the embedded view on a
 * site's Controls page; omitted, it reads every site the control has been
 * pushed to. */
export function recentControlFailures(criticalControlId: string, siteId?: string): BarrierFailure[] {
  const instanceIds = new Set(
    WORKSITE_CONTROLS.filter((wc) => wc.criticalControlId === criticalControlId && (!siteId || wc.siteId === siteId)).map((wc) => wc.id),
  );
  const cutoff = new Date(MOCK_NOW_RISK.getTime() - LIKELIHOOD_WINDOW_DAYS * 86_400_000);
  return BARRIER_FAILURES
    .filter((b) => instanceIds.has(b.worksiteControlId) && new Date(b.flaggedAt) >= cutoff)
    .sort((a, b) => new Date(b.flaggedAt).getTime() - new Date(a.flaggedAt).getTime());
}

export function computeControlEffectiveness(criticalControlId: string, siteId?: string): ControlEffectiveness {
  const relevant = WORKSITE_CONTROLS.filter((wc) => wc.criticalControlId === criticalControlId && (!siteId || wc.siteId === siteId));
  if (!relevant.some((wc) => VERIFIED_STATUSES.includes(wc.status))) return { failureCount: 0, likelihood: null };

  const failureCount = recentControlFailures(criticalControlId, siteId).length;
  return { failureCount, likelihood: computeLikelihood(failureCount) };
}
