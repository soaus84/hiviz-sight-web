import type { Incident, IncidentType, InjuryClassification, SeverityClass } from '@/types';
import { SITES_BY_ID, SITE_ID_BY_NAME } from './sites';
import { inPurview, type PurviewFilter } from './purview';
import { openInvestigationFromIncident } from './investigations';

// Reconciliation with Hiviz roadmap v1/specs — deliberate simplifications for
// this frontend-only mock (no backend, no AI calls):
//
// - CriticalIncident (a separately drafted/reviewed entity in
//   specs/features/CRITICAL-INCIDENT.md) is collapsed onto
//   Incident.status = 'severe' — there's no AI-draft record here, just a
//   status the incident itself carries pending review.
// - Only the direct critical-severity escalation path is modeled
//   (computeSeverityClass below). The incident pool/trend threshold path
//   (`trigger_source: algorithm`) is spec-only even in the real product spec
//   (specs/workspaces/INCIDENT.md's feature inventory) — not implemented
//   here, same as the app implements no other trend-detection algorithm.
// - `investigation.assist` (AI-suggested framework fields, InvestigationAssistFields
//   in types/incident.ts) IS modeled, and per spec queues at intake — before
//   any human review — so it's seeded directly on 'severe' incidents here,
//   not only on an opened investigation (see data/investigations.ts). This
//   is what SevereIncidentReview.tsx's review-stage narrative reads from;
//   progressToInvestigation below carries it across onto the new
//   Investigation record rather than regenerating it.

const MOCK_NOW = new Date('2025-05-07T10:00:00');

function site(name: string) {
  return { siteId: SITE_ID_BY_NAME[name], siteName: name };
}

// Mirrors the triage pseudocode in specs/features/INCIDENT-CAPTURE.md Stage 2.
export function computeSeverityClass(incidentType: IncidentType, injuryClassification: InjuryClassification): SeverityClass {
  if (injuryClassification === 'lost_time' || injuryClassification === 'fatality') return 'critical';
  if (injuryClassification === 'restricted_work' || injuryClassification === 'medical_treatment') return 'serious';
  if (injuryClassification === 'first_aid' || incidentType === 'near-miss') return 'moderate';
  return 'minor';
}

export const INCIDENTS: Incident[] = [
  { id: 'INC-4401', when: 'Today 06:20', occurredAt: '2025-05-07T06:20:00', ...site('Northgate Open Cut'), reporterName: 'James Morrow',
    description: 'Loader reversed toward the fuel bay without a spotter called — crew flagged it and the operator stopped before any contact.',
    workType: 'Loading', workTypeId: 'hrw24', incidentType: 'near-miss', injuryClassification: 'none', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'kinetic', barrierAssessment: 'barrier_degraded', severityClass: computeSeverityClass('near-miss', 'none'), status: 'reported',
    energyClassification: { value: 'kinetic', confidence: 0.83, rationale: 'A loader in motion toward an occupied area is a struck-by risk — the harm mechanism if contact had occurred is kinetic energy from moving mobile plant.' },
    barrierClassification: { value: 'barrier_degraded', confidence: 0.7, rationale: 'The spotter-call step exists but wasn’t used before reversing — the crew’s own intervention caught the gap, not the control operating as designed.' },
    keyHazard: { title: 'Loader reversing toward an occupied fuel bay with no spotter called', rationale: 'Without a spotter, the operator had no confirmation the reversing path was clear before moving.' },
    safetyPracticeIds: ['sp25', 'sp26'] },
  { id: 'INC-4398', when: 'Yest 13:10', occurredAt: '2025-05-06T13:10:00', ...site('Northgate Open Cut'), reporterName: 'A. Patel',
    description: 'Crew member nicked a hand on a burred edge while racking tools — cleaned and dressed on site.',
    workType: 'Workshop', incidentType: 'injury', injuryClassification: 'first_aid', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'none', barrierAssessment: 'barrier_held', severityClass: computeSeverityClass('injury', 'first_aid'), status: 'reported',
    energyClassification: { value: 'none', confidence: 0.88, rationale: 'A cut from a burred edge during routine tool racking is a contact injury from a static sharp edge, not a stored-energy release.' },
    barrierClassification: { value: 'barrier_held', confidence: 0.6, rationale: 'PPE and standard tool-handling practice limited this to a first-aid outcome — the controls in place worked as intended for the severity of contact.' },
    safetyPracticeIds: ['sp5'] },
  { id: 'INC-4392', when: '2d ago', occurredAt: '2025-05-05T10:00:00', ...site('Northgate Open Cut'), reporterName: 'Kim Lee',
    description: 'Crew member twisted a knee stepping off haul truck cabin steps — sent for medical assessment, expected back on modified duties.',
    workType: 'Haulage', incidentType: 'injury', injuryClassification: 'medical_treatment', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'gravitational', barrierAssessment: 'barrier_degraded', severityClass: computeSeverityClass('injury', 'medical_treatment'), status: 'severe',
    energyClassification: { value: 'gravitational', confidence: 0.85, rationale: 'A twisted knee on dismount from a haul truck cabin is consistent with a fall/slip mechanism at height, not an impact or contact injury — gravitational energy from the dismount itself.' },
    barrierClassification: { value: 'barrier_degraded', confidence: 0.77, rationale: 'The step and handrail are the control for a safe dismount — a worn or unstable step means that control was present but no longer functioning as designed, not absent entirely.' },
    keyHazard: { title: 'Degrading cabin step condition — uncontrolled dismount from height', rationale: 'A worn step surface on this haul truck model isn’t caught by any routine check, so the condition degrades until someone is hurt using it.' },
    safetyPracticeIds: ['sp1', 'sp5'],
    stopWorkWarranted: true, stopWorkWarrantedRationale: 'Degraded barrier plus a medical-treatment injury sits close to the threshold — flagged for review out of caution.', stopWorkCalled: false,
    stopWorkDismissedBy: 'R. Bridges', stopWorkDismissedAt: '2025-05-05T11:30:00',
    stopWorkDismissedNote: 'Reviewed with the crew — the degraded control was unrelated to the injury mechanism, a pre-existing strain aggravated by the task rather than an energy release. No ongoing exposure.',
    aiSuggestedRootCause: 'Cabin step and handrail condition for this haul truck model isn’t part of any routine check, so a degrading step only gets caught once someone is hurt on it.',
    aiSuggestedRootCauseRationale: 'The barrier assessment already records this step as degraded, and a twisted knee on dismount is consistent with an unstable step surface rather than a one-off misstep.',
    aiSuggestedContributingFactors: [
      { factor: 'Cabin step and handrail condition not included in pre-start checks', rationale: 'Nothing requires a degrading step to be caught before a shift starts.' },
      { factor: 'No reinforced three-point-contact reminder at cabin egress', rationale: 'A twisted knee on dismount is a common outcome when three-point contact lapses.' },
    ],
    aiSuggestedCorrectiveActions: [
      { action: 'Bring cabin step and handrail wear into the truck’s scheduled mechanical maintenance program, not a driver’s visual pre-start glance', rationale: 'A degrading step is a mechanical condition — it needs a mechanic checking it on a schedule, not a reminder to look before climbing down.' },
      { action: 'Review whether this cabin’s step and handrail geometry actually supports reliable three-point contact', rationale: 'A reminder sign can’t fix a geometry that makes three-point contact easy to skip under fatigue or time pressure.' },
    ],
    aiSuggestedInterviewQuestions: [
      { question: 'Had the cabin steps felt unstable or worn before this shift?', rationale: 'Establishes whether this was a sudden failure or a known, tolerated condition.' },
      { question: 'Is step or handrail condition currently checked as part of any routine inspection?', rationale: 'Confirms whether a check exists at all before recommending adding one.' },
    ],
    aiFactorHint: { factor: 'management_systems', confidence: 0.68, rationale: 'A missing inspection step for known wear-prone equipment points to a systems gap rather than an individual lapse.' } },

  { id: 'INC-4380', when: '3d ago', occurredAt: '2025-05-04T09:00:00', ...site('Ridgeback Processing'), reporterName: 'A. Pereira',
    description: 'Conveyor guard found unlatched during pre-start — isolated and re-secured before the line started.',
    workType: 'Processing', workTypeId: 'hrw14', incidentType: 'near-miss', injuryClassification: 'none', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'kinetic', barrierAssessment: 'barrier_failed', severityClass: computeSeverityClass('near-miss', 'none'), status: 'reported',
    energyClassification: { value: 'kinetic', confidence: 0.86, rationale: 'Had the conveyor started with the guard unlatched, moving belt and rollers would have been exposed at the entanglement point — the harm mechanism is kinetic energy from moving plant.' },
    barrierClassification: { value: 'barrier_failed', confidence: 0.83, rationale: 'The guard itself was found unlatched — the physical barrier had failed independent of the pre-start check that happened to catch it. A working barrier does not rely on being caught.' },
    keyHazard: { title: 'Unlatched conveyor guard found before line start — entanglement risk', rationale: 'Had this not been caught at pre-start, moving parts would have been exposed at the guard opening once the line started.' },
    safetyPracticeIds: ['sp1', 'sp27'] },
  { id: 'INC-4375', when: '2d ago', occurredAt: '2025-05-05T13:00:00', ...site('Ridgeback Processing'), reporterName: 'A. Pereira',
    description: 'Reversing forklift clipped a stacked pallet, no injuries — pallet and light fittings damaged.',
    workType: 'Logistics', workTypeId: 'hrw24', incidentType: 'property-damage', injuryClassification: 'none', peopleInvolvedCount: 0, sceneSecured: true, notifiableFlag: false,
    energyType: 'kinetic', barrierAssessment: 'barrier_degraded', severityClass: computeSeverityClass('property-damage', 'none'), status: 'severe',
    energyClassification: { value: 'kinetic', confidence: 0.84, rationale: 'A forklift in motion striking stacked pallets is a struck-by/property-damage mechanism — kinetic energy from moving loaded plant.' },
    barrierClassification: { value: 'barrier_degraded', confidence: 0.74, rationale: 'Reversing paths and stacking zones overlap with no separation control — a defined storage layout exists but doesn’t prevent this kind of contact.' },
    keyHazard: { title: 'Forklift reversing path overlapping pallet storage — struck-by/property-damage risk', rationale: 'No marked separation between where forklifts reverse and where pallets are stacked means a clipped load is a matter of when, not if.' },
    safetyPracticeIds: ['sp17', 'sp9'],
    stopWorkCalled: true, stopWorkEventId: 'SW-3',
    aiSuggestedRootCause: 'Forklift reversing paths in this storage area cross a pallet-stacking zone with no dedicated separation, so a clipped load is a visibility problem waiting to repeat.',
    aiSuggestedRootCauseRationale: 'The degraded barrier assessment and a reversing-direction impact both point to inadequate rear visibility in a zone shared with stacked stock, not an isolated operator error.',
    aiSuggestedContributingFactors: [
      { factor: 'No marked separation between forklift reversing paths and pallet storage', rationale: 'Stacked pallets sitting inside a reversing path make a clipped-load incident close to inevitable over time.' },
      { factor: 'No spotter or reversing aid required in this zone', rationale: 'Rear visibility on a loaded forklift is limited without one of these controls.' },
    ],
    aiSuggestedCorrectiveActions: [
      { action: 'Mark and enforce a minimum clearance zone between forklift reversing paths and pallet storage', rationale: 'Removes the physical overlap that made this clip possible.' },
      { action: 'Fit reversing alarms or cameras to forklifts operating in this storage area', rationale: 'Compensates for limited rear visibility where clearance alone can’t be guaranteed.' },
    ],
    aiSuggestedInterviewQuestions: [
      { question: 'Has a load been clipped or nearly clipped in this storage area before?', rationale: 'Establishes whether this is a first occurrence or a tolerated near-miss pattern.' },
      { question: 'Is there a marked or enforced reversing path for this zone?', rationale: 'Confirms whether any separation control exists today.' },
    ],
    aiFactorHint: { factor: 'operational_management', confidence: 0.6, rationale: 'A shared reversing/storage zone with no separation control reflects a site layout and operational decision, not an individual action.' } },

  { id: 'INC-4370', when: '4d ago', occurredAt: '2025-05-03T09:00:00', ...site('Marlow Stockyard'), reporterName: 'D. Cole',
    description: 'Yard crew nearly walked into the swing radius of a loader turning without a horn sounded — no contact.',
    workType: 'Yard operations', workTypeId: 'hrw24', incidentType: 'near-miss', injuryClassification: 'none', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'kinetic', barrierAssessment: 'barrier_degraded', severityClass: computeSeverityClass('near-miss', 'none'), status: 'reported',
    energyClassification: { value: 'kinetic', confidence: 0.81, rationale: 'A loader’s swing radius intersecting a walking route is a struck-by risk from moving mobile plant — kinetic energy is the harm mechanism if contact had occurred.' },
    barrierClassification: { value: 'barrier_degraded', confidence: 0.68, rationale: 'The horn is the warning control for this exact scenario — sounding it before turning is the control, and it didn’t happen here even though nothing else about the task was unusual.' },
    keyHazard: { title: 'Loader swing radius crossing a pedestrian route with no horn sounded', rationale: 'Pedestrians in the yard have no other warning that a loader is about to turn into their path.' },
    safetyPracticeIds: ['sp26', 'sp9'] },

  { id: 'INC-4360', when: 'Yest 15:40', occurredAt: '2025-05-06T15:40:00', ...site('Coolinga Plant'), reporterName: 'Jess Liang',
    description: 'Crew member fell from a conveyor walkway platform during a hot afternoon shift — fractured wrist, off work pending recovery.',
    workType: 'Processing', workTypeId: 'hrw32', incidentType: 'injury', injuryClassification: 'lost_time', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: true,
    energyType: 'gravitational', barrierAssessment: 'barrier_failed', severityClass: computeSeverityClass('injury', 'lost_time'), status: 'severe',
    energyClassification: { value: 'gravitational', confidence: 0.9, rationale: 'A fall from a walkway platform is a fall-from-height mechanism — gravitational energy is the primary harm pathway.' },
    barrierClassification: { value: 'barrier_failed', confidence: 0.82, rationale: 'Edge protection on this platform section had degraded to the point of failing under normal use — a control that existed but no longer performed its function.' },
    keyHazard: { title: 'Degraded conveyor walkway edge protection — fall from height', rationale: 'Platform edge protection isn’t included in the routine inspection cycle, so a failing guard isn’t caught until someone falls through the gap it leaves.' },
    safetyPracticeIds: ['sp1', 'sp23'],
    stopWorkWarranted: true, stopWorkWarrantedRationale: 'Fall from height with a failed control and a lost-time injury — this crosses the threshold for an immediate stop regardless of whether the task felt routine.', stopWorkCalled: false,
    aiSuggestedRootCause: 'Edge protection on this section of conveyor walkway platform has degraded to the point of failing under normal use, and nothing in the routine inspection cycle is catching platform-edge condition before it fails.',
    aiSuggestedRootCauseRationale: 'A barrier_failed assessment paired with a fall from the platform itself, not a slip on the walkway surface, points to a guarding failure rather than a footing or fatigue issue alone.',
    aiSuggestedContributingFactors: [
      { factor: 'Conveyor walkway platform edge protection not included in the routine inspection cycle', rationale: 'A failed barrier only gets found this way, after someone falls, if nothing checks it beforehand.' },
      { factor: 'Elevated temperature during the shift', rationale: 'Heat-related fatigue can reduce attentiveness to footing near an already-compromised edge, compounding rather than causing the fall.' },
    ],
    aiSuggestedCorrectiveActions: [
      { action: 'Inspect and repair conveyor walkway platform edge protection at this location immediately', rationale: 'Removes the immediate fall exposure at the failed section.' },
      { action: 'Bring platform edge-protection integrity into the conveyor’s scheduled structural inspection, with a defined condition standard to check against', rationale: 'A measured check for guard integrity catches degrading protection before it fails — a visual walk-by wouldn’t have caught this one either.' },
    ],
    aiSuggestedInterviewQuestions: [
      { question: 'Had the platform edge protection at this location shown any signs of wear before the shift?', rationale: 'Establishes whether this was a sudden failure or a known, un-actioned condition.' },
      { question: 'Is there a scheduled inspection for conveyor walkway guarding on this line?', rationale: 'Confirms whether a check exists today before recommending one.' },
    ],
    aiFactorHint: { factor: 'management_systems', confidence: 0.71, rationale: 'A guarding failure with no inspection step to catch it reflects a maintenance-system gap, not an individual lapse.' } },
  { id: 'INC-4355', when: '6d ago', occurredAt: '2025-05-01T09:00:00', ...site('Coolinga Plant'), reporterName: 'Jess Liang',
    description: 'Minor hydraulic oil spill at the crusher line, contained with absorbent and reported to environmental register.',
    workType: 'Processing', incidentType: 'environmental', injuryClassification: 'none', peopleInvolvedCount: 0, sceneSecured: true, notifiableFlag: false,
    energyType: 'chemical', barrierAssessment: 'barrier_degraded', severityClass: computeSeverityClass('environmental', 'none'), status: 'reported',
    energyClassification: { value: 'chemical', confidence: 0.79, rationale: 'A hydraulic oil release is a chemical/environmental exposure mechanism, not a mechanical or energy-transfer hazard to people directly.' },
    barrierClassification: { value: 'barrier_degraded', confidence: 0.66, rationale: 'Containment worked once triggered, but the hydraulic line itself let go — the primary containment control degraded rather than the response control failing.' },
    keyHazard: { title: 'Hydraulic line release at the crusher — environmental containment risk', rationale: 'A larger or unnoticed release from the same line could reach ground or waterways before containment is triggered.' },
    safetyPracticeIds: ['sp1', 'sp11'] },

  { id: 'INC-4340', when: '1w ago', occurredAt: '2025-04-30T09:00:00', ...site('Brookman Pit 2'), reporterName: 'R. Bridges',
    description: 'Crew member strained a shoulder manually shifting a stuck tailgate pin — on restricted duties while it heals.',
    workType: 'Haulage', incidentType: 'injury', injuryClassification: 'restricted_work', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'none', barrierAssessment: 'barrier_degraded', severityClass: computeSeverityClass('injury', 'restricted_work'), status: 'linked', linkedInvestigationId: 'INV-3101',
    energyClassification: { value: 'none', confidence: 0.87, rationale: 'A shoulder strain from manual force on a seized pin is a manual-handling/musculoskeletal mechanism, not a stored or released energy event.' },
    barrierClassification: { value: 'barrier_degraded', confidence: 0.72, rationale: 'No scheduled lubrication exists for this pin, so the tool-free-release control degrades over time until manual force becomes the fallback — a gradual failure, not a single point one.' },
    keyHazard: { title: 'Seized tailgate pin requiring manual force to release — musculoskeletal risk', rationale: 'Without a pin-release tool or a maintenance schedule, crews resort to manual force whenever the pin seizes, and that’s the injury mechanism here.' },
    safetyPracticeIds: ['sp23', 'sp1'] },

  { id: 'INC-4320', when: '3w ago', occurredAt: '2025-04-16T09:00:00', ...site('Jewell Crusher'), reporterName: 'Marcus Okafor',
    description: 'Contractor struck by a reversing haul truck at the crusher exclusion boundary — fatality. Site shut down, investigation opened immediately.',
    workType: 'Crushing', workTypeId: 'hrw24', incidentType: 'injury', injuryClassification: 'fatality', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: true,
    energyType: 'kinetic', barrierAssessment: 'barrier_absent', severityClass: computeSeverityClass('injury', 'fatality'), status: 'linked', linkedInvestigationId: 'INV-3098',
    energyClassification: { value: 'kinetic', confidence: 0.96, rationale: 'A haul truck strike is an unambiguous kinetic energy event — a large moving mass contacting a person.' },
    barrierClassification: { value: 'barrier_absent', confidence: 0.91, rationale: 'The exclusion boundary relied on signage and a radio call only — no physical barrier was ever installed at this boundary, a deliberately deferred gap rather than a control that failed in the moment.' },
    keyHazard: { title: 'Unbarricaded crusher exclusion boundary — struck-by risk from reversing haul trucks', rationale: 'With no physical barrier and a spotter check that also didn’t hold, there was nothing left to stop a person from being in the truck’s path when it reversed.' },
    safetyPracticeIds: ['sp27', 'sp25'],
    stopWorkWarranted: true, stopWorkCalled: true, stopWorkEventId: 'SW-1' },
  { id: 'INC-4300', when: '2d ago', occurredAt: '2025-05-05T09:00:00', ...site('Jewell Crusher'), reporterName: 'Marcus Okafor',
    description: 'Spotter stepped back inside the exclusion line unprompted after noticing a truck approaching — no contact.',
    workType: 'Crushing', workTypeId: 'hrw24', incidentType: 'near-miss', injuryClassification: 'none', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'kinetic', barrierAssessment: 'barrier_held', severityClass: computeSeverityClass('near-miss', 'none'), status: 'reported',
    energyClassification: { value: 'kinetic', confidence: 0.8, rationale: 'A haul truck approaching an exclusion line is a struck-by risk — kinetic energy from moving mobile plant is the harm mechanism if the spotter hadn’t repositioned.' },
    barrierClassification: { value: 'barrier_held', confidence: 0.71, rationale: 'The spotter’s own situational awareness caught the drift and self-corrected before the truck reached the boundary — the last line of defence held, even though position was briefly compromised.' },
    keyHazard: { title: 'Spotter briefly inside the truck exclusion line — struck-by risk if not self-corrected', rationale: 'The same exclusion boundary that failed catastrophically at INC-4320 relies on the spotter’s own position discipline — this time it held, but the margin was the spotter noticing in time, not a physical barrier.' },
    safetyPracticeIds: ['sp26'] },

  { id: 'INC-4270', when: '5w ago', occurredAt: '2025-04-02T09:00:00', ...site('Coolinga Plant'), reporterName: 'Jess Liang',
    description: 'Crew member fell from an unguarded section of gantry walkway during maintenance — fractured ankle, extended time off.',
    workType: 'Maintenance', workTypeId: 'hrw32', incidentType: 'injury', injuryClassification: 'lost_time', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: true,
    energyType: 'gravitational', barrierAssessment: 'barrier_absent', severityClass: computeSeverityClass('injury', 'lost_time'), status: 'linked', linkedInvestigationId: 'INV-3095',
    energyClassification: { value: 'gravitational', confidence: 0.92, rationale: 'A fall from an unguarded walkway section is a fall-from-height mechanism — gravitational energy is the primary harm pathway.' },
    barrierClassification: { value: 'barrier_absent', confidence: 0.88, rationale: 'The handrail section removed for maintenance access was never reinstated before the walkway reopened — not a control that failed in the moment, one that was simply not there when the walkway returned to service.' },
    keyHazard: { title: 'Unguarded gantry walkway section — fall from height', rationale: 'A section of handrail removed for maintenance access was not reinstated before the walkway reopened, leaving an unguarded edge on an active access route.' },
    safetyPracticeIds: ['sp23', 'sp1'] },

  { id: 'INC-4290', when: '2w ago', occurredAt: '2025-04-23T09:00:00', ...site('Sylvania Underground'), reporterName: 'Kim Lee',
    description: 'Crew member treated for smoke inhalation after a small equipment fire in the underground workshop, extinguished immediately.',
    workType: 'Underground maintenance', incidentType: 'injury', injuryClassification: 'medical_treatment', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'thermal', barrierAssessment: 'barrier_failed', severityClass: computeSeverityClass('injury', 'medical_treatment'), status: 'acknowledged',
    energyClassification: { value: 'thermal', confidence: 0.85, rationale: 'A workshop equipment fire is a thermal energy event — the fire itself and resulting smoke are the harm mechanisms.' },
    barrierClassification: { value: 'barrier_failed', confidence: 0.7, rationale: 'The equipment fault that ignited was itself the failed control — extinguished immediately by the fire response in place, but the equipment-level fault wasn’t prevented.' },
    keyHazard: { title: 'Equipment fault ignition in an underground workshop — smoke inhalation risk', rationale: 'An underground space concentrates smoke faster than an open one, so even a quickly-extinguished fire carries a real inhalation risk for anyone nearby.' },
    safetyPracticeIds: ['sp11', 'sp1'],
    acknowledgeComment: 'Isolated equipment fault on a single unit, already pulled from service — no systemic factor identified, closing without a formal investigation.' },
];

export const INCIDENTS_BY_ID: Record<string, Incident> = Object.fromEntries(INCIDENTS.map((i) => [i.id, i]));

function replaceIncident(id: string, patch: Partial<Incident>): Incident | null {
  const idx = INCIDENTS.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const updated: Incident = { ...INCIDENTS[idx], ...patch };
  INCIDENTS[idx] = updated;
  INCIDENTS_BY_ID[id] = updated;
  return updated;
}

/** reported -> severe. Manual escalation for incidents that don't already
 * meet the auto-severe (critical severity) criterion but a reviewer judges
 * warrant formal review anyway. */
export function escalateToSevere(id: string): Incident | null {
  return replaceIncident(id, { status: 'severe' });
}

/** severe -> acknowledged. Reviewed, closed without opening an investigation
 * — mirrors CriticalIncident rejection in specs/features/CRITICAL-INCIDENT.md. */
export function acknowledgeIncident(id: string, comment: string): Incident | null {
  return replaceIncident(id, { status: 'acknowledged', acknowledgeComment: comment });
}

/** severe -> linked. Opens a new Investigation and links this incident to it
 * — mirrors CriticalIncident approval, which creates the investigation
 * record. Requires `investigatorName` up front, 2026-09-15 — same principle
 * as the manager-assignment gate on leaving Timeline (see
 * [[project_investigation_timeline]]): an investigation shouldn't be able to
 * start with nobody responsible for it, any more than it should be able to
 * reach Actions with nobody approving it. Error-after-click, not a
 * preemptively disabled button, matching the existing submit/approve/close
 * gates' own convention. */
export function progressToInvestigation(id: string, investigatorName: string): { incident: Incident | null; error?: string } {
  const current = INCIDENTS_BY_ID[id];
  if (!current) return { incident: null, error: 'Incident not found.' };
  if (!investigatorName?.trim()) return { incident: current, error: 'An investigator must be assigned before progressing to investigation.' };
  const investigation = openInvestigationFromIncident(current, investigatorName);
  return { incident: replaceIncident(id, { status: 'linked', linkedInvestigationId: investigation.id }) };
}

/** Stamps the fields a new StopWorkEvent is created alongside — called only
 * from data/stopWork.ts's callStopWork, which owns creating the event
 * itself; this just records the link back on the source. */
export function markIncidentStopWorkCalled(id: string, stopWorkEventId: string): Incident | null {
  return replaceIncident(id, { stopWorkCalled: true, stopWorkEventId });
}

/** The warranted-but-not-called divergence, judged not to need a stop — no
 * StopWorkEvent is ever created for this exit, so it's recorded here directly. */
export function dismissIncidentStopWork(id: string, dismissedBy: string, note: string): Incident | null {
  return replaceIncident(id, { stopWorkDismissedBy: dismissedBy, stopWorkDismissedAt: new Date().toISOString(), stopWorkDismissedNote: note });
}

export function incidentInRegion(incident: Incident, purview: PurviewFilter): boolean {
  const site = SITES_BY_ID[incident.siteId];
  return !!site && inPurview(site, purview);
}

export function daysSince(occurredAt: string): number {
  return Math.floor((MOCK_NOW.getTime() - new Date(occurredAt).getTime()) / 86_400_000);
}
