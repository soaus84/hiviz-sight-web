import type { Incident, Insight, Investigation } from '@/types';
import { SITES_BY_ID, SITE_ID_BY_NAME } from './sites';
import { inPurview, type PurviewFilter } from './purview';
import { pushExternalInsight } from './insights';

// Reconciliation with Hiviz roadmap v1/specs — see data/incidents.ts for the
// incident-side notes. On the investigation side:
// - `investigation.assist` (AI-suggested framework fields) isn't modeled —
//   immediateCause/contributingFactors/rootCause/correctiveActions below are
//   entered directly by the investigator, no ai_suggested_* shadow fields.
// - flagSystemicCause below IS a real implementation of the systemic cause
//   bridge in specs/features/INVESTIGATION.md Stage 3 — the one sanctioned
//   path from the incident pipeline back into the insight pipeline. It
//   pushes a genuine entry into data/insights.ts's shared INSIGHTS array.
// - There is deliberately no 'review' status on Investigation itself. The
//   human review/triage gate — mirroring Insight's review status exactly,
//   story plus an Acknowledge/Progress fork — happens one step earlier, on
//   the Incident (status 'severe', see data/incidents.ts). An Investigation
//   record is only created once that fork resolves to "progress," so by the
//   time one exists there's nothing left to review before work starts.
//   The Incident/Investigations workspace UI (views/incidents/Investigations.tsx)
//   presents severe incidents as the first ("Needs review") stage of the same
//   pipeline even though they're a different underlying entity.

const MOCK_NOW = new Date('2025-05-07T10:00:00');

export const INVESTIGATIONS: Investigation[] = [
  {
    id: 'INV-3101', status: 'open',
    title: 'Manual handling injury freeing a stuck tailgate pin',
    summary: 'Crew member strained a shoulder freeing a seized tailgate pin by hand — investigating whether a tool or procedure gap is driving repeat manual interventions on this equipment.',
    siteNames: ['Brookman Pit 2'], incidentCount: 1, energyTypes: ['none'],
    updated: '1w ago', updatedAt: '2025-04-30T09:30:00', severityClass: 'serious', investigatorName: 'R. Bridges',
    immediateCause: 'Tailgate pin was seized and required manual force to free.',
    contributingFactors: [
      { factor: 'No pin-release tool issued to haul crews', rationale: 'Crew reported freeing seized pins by hand is routine, not a one-off.' },
    ],
    clearedForSharing: false,
  },
  {
    id: 'INV-3098', status: 'closed',
    title: 'Fatality at Jewell Crusher exclusion boundary',
    summary: 'Contractor struck by a reversing haul truck at the crusher exclusion boundary. Closed under legal hold — findings not yet cleared for sharing.',
    siteNames: ['Jewell Crusher'], incidentCount: 1, energyTypes: ['kinetic'],
    updated: '2w ago', updatedAt: '2025-04-23T14:00:00', severityClass: 'critical', investigatorName: 'Marcus Okafor',
    immediateCause: 'Contractor was standing inside the marked exclusion zone when the haul truck began reversing.',
    contributingFactors: [
      { factor: 'Exclusion boundary not physically barricaded, relied on signage and radio call only', rationale: 'A prior site walk had already flagged the boundary as signage-only.' },
      { factor: 'Spotter position not re-confirmed after shift handover', rationale: 'Handover log shows no re-confirmation step for spotter position.' },
    ],
    rootCause: 'Exclusion control at this crusher relies entirely on procedural compliance — signage and a radio call — with no physical or engineered barrier.',
    correctiveActions: [
      { action: 'Install a physical barrier at the crusher exclusion boundary', rationale: 'Removes reliance on procedural compliance alone.', owner: 'Marcus Okafor', dueDate: '2025-05-20' },
    ],
    clearedForSharing: false,
    legalHold: true,
    fwClassifications: [
      { factor: 'management_systems', domain: 'enable', maturitySignal: 'compliant', confidence: 0.88, rationale: 'The exclusion procedure exists but specifies no engineered control, only administrative ones.' },
    ],
  },
  {
    id: 'INV-3095', status: 'closed',
    title: 'Fall from an unguarded gantry walkway section',
    summary: 'Crew member fell from an unguarded section of gantry walkway during maintenance work, sustaining a fractured ankle. Closed with a confirmed root cause pointing to a shared handrail work-order gap.',
    siteNames: ['Coolinga Plant'], incidentCount: 1, energyTypes: ['gravitational'],
    updated: '5w ago', updatedAt: '2025-04-04T11:00:00', severityClass: 'critical', investigatorName: 'Jess Liang',
    immediateCause: 'A section of gantry handrail had been removed for maintenance access and not reinstated before the walkway was reopened.',
    contributingFactors: [
      { factor: 'No sign-off step confirming guarding is reinstated after maintenance access', rationale: 'The maintenance work order closed without a guarding-reinstated checklist item.' },
    ],
    rootCause: 'The gantry maintenance work order template has no mandatory step confirming guarding is reinstated before a walkway returns to service — likely present wherever the same template is used, not just this walkway.',
    correctiveActions: [
      { action: 'Add a mandatory guarding-reinstated checklist item to the gantry maintenance work order template', rationale: 'Closes the gap that let this walkway reopen unguarded.', owner: 'Jess Liang', dueDate: '2025-05-14', done: true },
    ],
    clearedForSharing: true,
    sharingScope: 'organisation',
    legalHold: false,
    fwClassifications: [
      { factor: 'management_systems', domain: 'enable', maturitySignal: 'compliant', confidence: 0.81, rationale: 'The work order template is a management-system gap, not an individual lapse — it applies wherever the same template is used.' },
    ],
  },
];

export const INVESTIGATIONS_BY_ID: Record<string, Investigation> = Object.fromEntries(INVESTIGATIONS.map((v) => [v.id, v]));

function replaceInvestigation(id: string, patch: Partial<Investigation>): Investigation | null {
  const idx = INVESTIGATIONS.findIndex((v) => v.id === id);
  if (idx === -1) return null;
  const updated: Investigation = { ...INVESTIGATIONS[idx], ...patch, updated: 'Just now', updatedAt: MOCK_NOW.toISOString() };
  INVESTIGATIONS[idx] = updated;
  INVESTIGATIONS_BY_ID[id] = updated;
  return updated;
}

let nextInvestigationSeq = 3200;

/** Opens a new investigation from a progressed incident — the code-level
 * equivalent of a CriticalIncident approval creating an investigation record
 * (specs/features/CRITICAL-INCIDENT.md Stage 2). Called from
 * data/incidents.ts's progressToInvestigation. */
export function openInvestigationFromIncident(incident: Incident): Investigation {
  const id = `INV-${nextInvestigationSeq++}`;
  const investigation: Investigation = {
    id, status: 'open',
    title: `Investigation — ${incident.description.length > 72 ? `${incident.description.slice(0, 72)}…` : incident.description}`,
    summary: incident.description,
    siteNames: [incident.siteName],
    incidentCount: 1,
    energyTypes: [incident.energyType],
    updated: 'Just now',
    updatedAt: MOCK_NOW.toISOString(),
    severityClass: incident.severityClass,
    clearedForSharing: false,
  };
  INVESTIGATIONS.push(investigation);
  INVESTIGATIONS_BY_ID[id] = investigation;
  return investigation;
}

export function assignInvestigator(id: string, name: string): Investigation | null {
  return replaceInvestigation(id, { investigatorName: name });
}

/** Patches the in-progress framework fields without changing status —
 * autosaves as the investigator works through the workbench, same pattern
 * as updateActionFields in data/insights.ts. */
export function updateFrameworkFields(id: string, fields: Partial<Investigation>): Investigation | null {
  return replaceInvestigation(id, fields);
}

/** open -> closed. Mirrors specs/features/INVESTIGATION.md's server-side
 * close gate rules: immediate_cause and root_cause non-empty, at least one
 * corrective_action confirmed. Returns an error string instead of silently
 * no-op'ing so the UI can explain why the close action is disabled — no
 * separate approval step beyond this gate, same as Insight has none between
 * 'action' and 'closed'. */
export function closeInvestigation(id: string): { investigation: Investigation | null; error?: string } {
  const current = INVESTIGATIONS_BY_ID[id];
  if (!current) return { investigation: null, error: 'Investigation not found.' };
  if (!current.immediateCause?.trim()) return { investigation: current, error: 'Immediate cause is required before closing.' };
  if (!current.rootCause?.trim()) return { investigation: current, error: 'Root cause is required before closing.' };
  if (!current.correctiveActions || current.correctiveActions.length === 0) {
    return { investigation: current, error: 'At least one corrective action is required before closing.' };
  }
  return { investigation: replaceInvestigation(id, { status: 'closed' }) };
}

/** The systemic cause phase — specs/features/INVESTIGATION.md Stage 3. Human-
 * initiated, closed investigations only, blocked entirely while legalHold is
 * true. Pushes a real Insight into the shared INSIGHTS pool with
 * cleared_for_toolbox auto-approved (per spec: Stage 1 AI generation is
 * skipped for this trigger source, the safety manager's authored content is
 * authoritative) and records the link back on the investigation. */
export function flagSystemicCause(id: string, patternSummary: string): { investigation: Investigation | null; insight?: Insight; error?: string } {
  const current = INVESTIGATIONS_BY_ID[id];
  if (!current) return { investigation: null, error: 'Investigation not found.' };
  if (current.status !== 'closed') return { investigation: current, error: 'Only closed investigations can be flagged for systemic cause.' };
  if (current.legalHold) return { investigation: current, error: 'Blocked while legal hold is active.' };
  if (current.systemicCauseInsightId) return { investigation: current, error: 'Already flagged as a systemic cause.' };
  if (!patternSummary.trim()) return { investigation: current, error: 'A pattern summary is required.' };

  const insightId = `INS-EXT-${current.id}`;
  const insight: Insight = {
    id: insightId,
    status: 'review',
    kind: 'cross_site_pattern',
    theme: 'Systemic cause',
    title: `Systemic finding from ${current.id}`,
    summary: patternSummary.trim(),
    siteNames: current.siteNames,
    observationCount: current.incidentCount,
    supporterInitials: [],
    energyTypes: current.energyTypes,
    updated: 'Just now',
    updatedAt: MOCK_NOW.toISOString(),
    cleared_for_toolbox: true,
    cause: current.rootCause,
  };
  pushExternalInsight(insight);
  const updated = replaceInvestigation(id, { systemicCauseInsightId: insightId });
  return { investigation: updated, insight };
}

export function investigationInRegion(investigation: Investigation, purview: PurviewFilter): boolean {
  return investigation.siteNames.some((name) => {
    const site = SITES_BY_ID[SITE_ID_BY_NAME[name]];
    return !!site && inPurview(site, purview);
  });
}

export function daysSince(updatedAt: string): number {
  return Math.floor((MOCK_NOW.getTime() - new Date(updatedAt).getTime()) / 86_400_000);
}

export const RESOLVED_WINDOW_DAYS = 45;
