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
// - `investigation.assist` (AI-suggested framework fields) isn't modeled —
//   see data/investigations.ts for what an opened investigation looks like.

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
    energyType: 'kinetic', barrierAssessment: 'barrier_degraded', severityClass: computeSeverityClass('near-miss', 'none'), status: 'reported' },
  { id: 'INC-4398', when: 'Yest 13:10', occurredAt: '2025-05-06T13:10:00', ...site('Northgate Open Cut'), reporterName: 'A. Patel',
    description: 'Crew member nicked a hand on a burred edge while racking tools — cleaned and dressed on site.',
    workType: 'Workshop', incidentType: 'injury', injuryClassification: 'first_aid', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'none', barrierAssessment: 'barrier_held', severityClass: computeSeverityClass('injury', 'first_aid'), status: 'reported' },
  { id: 'INC-4392', when: '2d ago', occurredAt: '2025-05-05T10:00:00', ...site('Northgate Open Cut'), reporterName: 'Kim Lee',
    description: 'Crew member twisted a knee stepping off haul truck cabin steps — sent for medical assessment, expected back on modified duties.',
    workType: 'Haulage', incidentType: 'injury', injuryClassification: 'medical_treatment', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'gravitational', barrierAssessment: 'barrier_degraded', severityClass: computeSeverityClass('injury', 'medical_treatment'), status: 'severe' },

  { id: 'INC-4380', when: '3d ago', occurredAt: '2025-05-04T09:00:00', ...site('Ridgeback Processing'), reporterName: 'A. Pereira',
    description: 'Conveyor guard found unlatched during pre-start — isolated and re-secured before the line started.',
    workType: 'Processing', workTypeId: 'hrw14', incidentType: 'near-miss', injuryClassification: 'none', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'kinetic', barrierAssessment: 'barrier_failed', severityClass: computeSeverityClass('near-miss', 'none'), status: 'reported' },
  { id: 'INC-4375', when: '2d ago', occurredAt: '2025-05-05T13:00:00', ...site('Ridgeback Processing'), reporterName: 'A. Pereira',
    description: 'Reversing forklift clipped a stacked pallet, no injuries — pallet and light fittings damaged.',
    workType: 'Logistics', workTypeId: 'hrw24', incidentType: 'property-damage', injuryClassification: 'none', peopleInvolvedCount: 0, sceneSecured: true, notifiableFlag: false,
    energyType: 'kinetic', barrierAssessment: 'barrier_degraded', severityClass: computeSeverityClass('property-damage', 'none'), status: 'severe' },

  { id: 'INC-4370', when: '4d ago', occurredAt: '2025-05-03T09:00:00', ...site('Marlow Stockyard'), reporterName: 'D. Cole',
    description: 'Yard crew nearly walked into the swing radius of a loader turning without a horn sounded — no contact.',
    workType: 'Yard operations', workTypeId: 'hrw24', incidentType: 'near-miss', injuryClassification: 'none', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'kinetic', barrierAssessment: 'barrier_degraded', severityClass: computeSeverityClass('near-miss', 'none'), status: 'reported' },

  { id: 'INC-4360', when: 'Yest 15:40', occurredAt: '2025-05-06T15:40:00', ...site('Coolinga Plant'), reporterName: 'Jess Liang',
    description: 'Crew member fell from a conveyor walkway platform during a hot afternoon shift — fractured wrist, off work pending recovery.',
    workType: 'Processing', workTypeId: 'hrw32', incidentType: 'injury', injuryClassification: 'lost_time', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: true,
    energyType: 'gravitational', barrierAssessment: 'barrier_failed', severityClass: computeSeverityClass('injury', 'lost_time'), status: 'severe' },
  { id: 'INC-4355', when: '6d ago', occurredAt: '2025-05-01T09:00:00', ...site('Coolinga Plant'), reporterName: 'Jess Liang',
    description: 'Minor hydraulic oil spill at the crusher line, contained with absorbent and reported to environmental register.',
    workType: 'Processing', incidentType: 'environmental', injuryClassification: 'none', peopleInvolvedCount: 0, sceneSecured: true, notifiableFlag: false,
    energyType: 'chemical', barrierAssessment: 'barrier_degraded', severityClass: computeSeverityClass('environmental', 'none'), status: 'reported' },

  { id: 'INC-4340', when: '1w ago', occurredAt: '2025-04-30T09:00:00', ...site('Brookman Pit 2'), reporterName: 'R. Bridges',
    description: 'Crew member strained a shoulder manually shifting a stuck tailgate pin — on restricted duties while it heals.',
    workType: 'Haulage', incidentType: 'injury', injuryClassification: 'restricted_work', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'none', barrierAssessment: 'barrier_degraded', severityClass: computeSeverityClass('injury', 'restricted_work'), status: 'linked', linkedInvestigationId: 'INV-3101' },

  { id: 'INC-4320', when: '3w ago', occurredAt: '2025-04-16T09:00:00', ...site('Jewell Crusher'), reporterName: 'Marcus Okafor',
    description: 'Contractor struck by a reversing haul truck at the crusher exclusion boundary — fatality. Site shut down, investigation opened immediately.',
    workType: 'Crushing', workTypeId: 'hrw24', incidentType: 'injury', injuryClassification: 'fatality', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: true,
    energyType: 'kinetic', barrierAssessment: 'barrier_absent', severityClass: computeSeverityClass('injury', 'fatality'), status: 'linked', linkedInvestigationId: 'INV-3098' },
  { id: 'INC-4300', when: '2d ago', occurredAt: '2025-05-05T09:00:00', ...site('Jewell Crusher'), reporterName: 'Marcus Okafor',
    description: 'Spotter stepped back inside the exclusion line unprompted after noticing a truck approaching — no contact.',
    workType: 'Crushing', workTypeId: 'hrw24', incidentType: 'near-miss', injuryClassification: 'none', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'kinetic', barrierAssessment: 'barrier_held', severityClass: computeSeverityClass('near-miss', 'none'), status: 'reported' },

  { id: 'INC-4270', when: '5w ago', occurredAt: '2025-04-02T09:00:00', ...site('Coolinga Plant'), reporterName: 'Jess Liang',
    description: 'Crew member fell from an unguarded section of gantry walkway during maintenance — fractured ankle, extended time off.',
    workType: 'Maintenance', workTypeId: 'hrw32', incidentType: 'injury', injuryClassification: 'lost_time', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: true,
    energyType: 'gravitational', barrierAssessment: 'barrier_absent', severityClass: computeSeverityClass('injury', 'lost_time'), status: 'linked', linkedInvestigationId: 'INV-3095' },

  { id: 'INC-4290', when: '2w ago', occurredAt: '2025-04-23T09:00:00', ...site('Sylvania Underground'), reporterName: 'Kim Lee',
    description: 'Crew member treated for smoke inhalation after a small equipment fire in the underground workshop, extinguished immediately.',
    workType: 'Underground maintenance', incidentType: 'injury', injuryClassification: 'medical_treatment', peopleInvolvedCount: 1, sceneSecured: true, notifiableFlag: false,
    energyType: 'thermal', barrierAssessment: 'barrier_failed', severityClass: computeSeverityClass('injury', 'medical_treatment'), status: 'acknowledged',
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
 * — mirrors CriticalIncident approval, which creates the investigation record. */
export function progressToInvestigation(id: string): Incident | null {
  const current = INCIDENTS_BY_ID[id];
  if (!current) return null;
  const investigation = openInvestigationFromIncident(current);
  return replaceIncident(id, { status: 'linked', linkedInvestigationId: investigation.id });
}

export function incidentInRegion(incident: Incident, purview: PurviewFilter): boolean {
  const site = SITES_BY_ID[incident.siteId];
  return !!site && inPurview(site, purview);
}

export function daysSince(occurredAt: string): number {
  return Math.floor((MOCK_NOW.getTime() - new Date(occurredAt).getTime()) / 86_400_000);
}
