import type { Tone } from '@/tokens';
import type { BarrierAssessment, IncidentStatus, IncidentType, InvestigationStatus, SeverityClass, StopWorkStatus } from '@/types';

// Tones deliberately match the Insight workspace's status colours 1:1 so the
// same "orange = needs a decision, blue = in progress, green = done" reading
// transfers between workspaces: severe (review-equivalent) = warning,
// linked (an investigation is now doing the work, action-equivalent) = info,
// acknowledged/closed = success.
export const INCIDENT_STATUS_DISPLAY: Record<IncidentStatus, { label: string; tone: Tone }> = {
  reported: { label: 'Reported', tone: 'primary' },
  severe: { label: 'Severe · needs review', tone: 'warning' },
  acknowledged: { label: 'Acknowledged', tone: 'success' },
  linked: { label: 'Linked to investigation', tone: 'info' },
};

export const INCIDENT_TYPE_LABEL: Record<IncidentType, string> = {
  'near-miss': 'Near miss',
  injury: 'Injury',
  'property-damage': 'Property damage',
  environmental: 'Environmental',
};

export const SEVERITY_DISPLAY: Record<SeverityClass, { label: string; tone: Tone }> = {
  minor: { label: 'Minor', tone: 'info' },
  moderate: { label: 'Moderate', tone: 'warning' },
  serious: { label: 'Serious', tone: 'warning' },
  critical: { label: 'Critical', tone: 'error' },
};

// Unifies what used to be two separate, independently-maintained
// Record<InvestigationStatus, [string, Tone]> maps (InvestigationDetail.tsx
// and InvestigationCard.tsx) into one shared definition, same reasoning as
// every other *_DISPLAY lookup in this app — see
// [[project_investigation_timeline]] for the 2026-09-14 status redesign
// this reflects (timeline/actions/closed, replacing open/closed).
export const INVESTIGATION_STATUS_DISPLAY: Record<InvestigationStatus, { label: string; tone: Tone }> = {
  timeline: { label: 'Timeline', tone: 'info' },
  actions: { label: 'Actions', tone: 'warning' },
  closed: { label: 'Closed', tone: 'success' },
};

/** No display lookup for this existed anywhere before 2026-09-15 — the
 * field was being stored (Incident.barrierAssessment) but never actually
 * rendered in any view. Added alongside the richer AiClassification
 * enhancement (types/observation.ts) — see [[project_investigation_timeline]]'s
 * upstream-enrichment discussion. */
export const BARRIER_ASSESSMENT_DISPLAY: Record<BarrierAssessment, { label: string; tone: Tone }> = {
  barrier_held: { label: 'Barrier held', tone: 'success' },
  barrier_degraded: { label: 'Barrier degraded', tone: 'warning' },
  barrier_failed: { label: 'Barrier failed', tone: 'error' },
  barrier_absent: { label: 'Barrier absent', tone: 'error' },
  none: { label: 'Not applicable', tone: 'primary' },
};

export const STOP_WORK_STATUS_DISPLAY: Record<StopWorkStatus, { label: string; tone: Tone }> = {
  pending_stop: { label: 'Stop requested', tone: 'error' },
  stopped: { label: 'Work stopped', tone: 'error' },
  resumed: { label: 'Resumed', tone: 'success' },
};
