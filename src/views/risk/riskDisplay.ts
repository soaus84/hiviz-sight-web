import type { Tone } from '@/tokens';
import type { BarrierFailureStatus, ControlType, Likelihood, SeverityClass, VerificationFrequency, WorksiteControlStatus } from '@/types';

// Tones deliberately match the Insight/Incident workspaces' pipeline colours
// 1:1: warning=needs a decision, info=in progress, success=done. See
// data/barrierFailures.ts's top-of-file note — Barrier Failures is the one
// place in Risk that's genuinely pipeline-shaped, so it earns the same
// convention. The Register (Hazard/CriticalControl) is authored content,
// not a pipeline, and doesn't use this scheme.
export const BARRIER_FAILURE_STATUS_DISPLAY: Record<BarrierFailureStatus, { label: string; tone: Tone }> = {
  open: { label: 'Open', tone: 'warning' },
  review: { label: 'In review', tone: 'info' },
  // Distinct tone from `open` on purpose — a returned item needing renewed
  // site attention shouldn't read the same as one nobody's touched yet.
  returned: { label: 'Returned', tone: 'error' },
  resolved: { label: 'Resolved', tone: 'success' },
};

export const SEVERITY_DISPLAY: Record<SeverityClass, { label: string; tone: Tone }> = {
  minor: { label: 'Minor', tone: 'info' },
  moderate: { label: 'Moderate', tone: 'warning' },
  serious: { label: 'Serious', tone: 'warning' },
  critical: { label: 'Critical', tone: 'error' },
};

export const LIKELIHOOD_DISPLAY: Record<Likelihood, { label: string; tone: Tone }> = {
  rare: { label: 'Rare', tone: 'info' },
  possible: { label: 'Possible', tone: 'warning' },
  likely: { label: 'Likely', tone: 'error' },
};

// Reuses Likelihood's own 3 bands (data/risk.ts's computeControlEffectiveness)
// under different words — "how often does this happen" reads naturally as
// Rare/Possible/Likely for a hazard, but as Reliable/Inconsistent/Failing
// for a specific control's track record.
export const CONTROL_EFFECTIVENESS_DISPLAY: Record<Likelihood, { label: string; tone: Tone }> = {
  rare: { label: 'Reliable', tone: 'success' },
  possible: { label: 'Inconsistent', tone: 'warning' },
  likely: { label: 'Failing', tone: 'error' },
};

export const CONTROL_TYPE_LABEL: Record<ControlType, string> = {
  prevention: 'Prevention',
  mitigation: 'Mitigation',
};

export const FREQUENCY_LABEL: Record<VerificationFrequency, string> = {
  shift_start: 'Shift start', daily: 'Daily', before_ignition: 'Before ignition', event_triggered: 'Event triggered', weekly: 'Weekly',
};

export const WORKSITE_CONTROL_STATUS_DISPLAY: Record<WorksiteControlStatus, { label: string; tone: Tone }> = {
  pending_review: { label: 'Pending review', tone: 'warning' },
  implementing: { label: 'Implementing', tone: 'info' },
  active: { label: 'Active', tone: 'success' },
  active_defeating: { label: 'Active · defeating', tone: 'warning' },
  active_degraded: { label: 'Active · degraded', tone: 'error' },
  not_required: { label: 'Not required', tone: 'primary' },
  superseded: { label: 'Superseded', tone: 'primary' },
};
