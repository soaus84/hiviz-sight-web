import type { Tone } from '@/tokens';
import type { IncidentStatus, IncidentType, SeverityClass, StopWorkStatus } from '@/types';

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

export const STOP_WORK_STATUS_DISPLAY: Record<StopWorkStatus, { label: string; tone: Tone }> = {
  pending_stop: { label: 'Stop requested', tone: 'error' },
  stopped: { label: 'Work stopped', tone: 'error' },
  resumed: { label: 'Resumed', tone: 'success' },
};
