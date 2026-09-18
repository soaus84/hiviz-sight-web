import type { Tone } from '@/tokens';

/** A finding's kind — 'control' when its context tag names a real
 * CriticalControl, 'systemic' otherwise. Derived, not stored — see
 * views/incidents/findingsView.ts and TimelineContext's own doc comment
 * (types/timeline.ts) for the 2026-09-15 redesign that removed the
 * standalone Finding entity this used to belong to. */
export type FindingKind = 'control' | 'systemic';

/** Mirrors WORK_STREAM_KIND_DISPLAY/TIMELINE_CONTEXT_DISPLAY's shape. */
export const FINDING_KIND_DISPLAY: Record<FindingKind, { label: string; icon: string; tone: Tone }> = {
  control: { label: 'Control finding', icon: 'gpp_bad', tone: 'error' },
  systemic: { label: 'Systemic finding', icon: 'hub', tone: 'warning' },
};
