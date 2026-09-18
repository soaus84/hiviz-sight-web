import type { Tone } from '@/tokens';
import type { ControlType, TimelineContextKind } from '@/types';

/** Mirrors WORK_STREAM_KIND_DISPLAY's shape, extended 2026-09-15 with `hint`
 * (a short one-line description shown next to each kind on ContextDrawer's
 * picker step — "making the decision on which to select more helpful," the
 * user's own framing) and `definition` (a fuller sentence shown once a kind
 * is picked, so the reasoning doesn't disappear the moment you commit to
 * one). See [[project_investigation_timeline]]. */
export const TIMELINE_CONTEXT_DISPLAY: Record<TimelineContextKind, { label: string; icon: string; tone: Tone; hint: string; definition: string }> = {
  normal_work: {
    label: 'Normal work', icon: 'check_circle', tone: 'success',
    hint: 'Proceeding as expected, no departure from procedure.',
    definition: 'Work was proceeding as expected at this point — no departure from procedure or normal practice.',
  },
  deviation: {
    label: 'Deviation', icon: 'warning', tone: 'warning',
    hint: 'Unexpected behaviour, a slip or lapse, procedural drift.',
    definition: 'Unexpected behaviour, a slip or lapse, or procedural drift — something departed from what should have happened.',
  },
  recovery: {
    label: 'Recovery', icon: 'shield', tone: 'info',
    hint: 'A mitigation control caught or limited it, after the fact.',
    definition: 'A mitigation control caught, limited, or responded to the deviation after it had already occurred — recovery only ever happens once the top event is already in motion.',
  },
  failure: {
    label: 'Control failure', icon: 'gpp_bad', tone: 'error',
    hint: 'A control that should have acted here didn’t.',
    definition: 'A specific control — prevention or mitigation — that should have acted at this point, but didn’t.',
  },
  systemic: {
    label: 'Systemic contributor', icon: 'hub', tone: 'warning',
    hint: 'An organisational factor — process, resourcing, leadership — that helped this happen.',
    definition: 'An organisational-level factor — not a specific control, not one moment’s behaviour — that contributed to this happening, classified against a Forge Works Map® factor.',
  },
};

/** 'recovery'/'failure' are the two kinds a context tag can attach a real
 * CriticalControl to — the other two are never about a specific control. */
export function contextKindUsesControl(kind: TimelineContextKind): boolean {
  return kind === 'recovery' || kind === 'failure';
}

/** Bowtie-consistent scoping for which `CriticalControl.controlType`s make
 * sense for a given context kind, per the 2026-09-15 clarification (see
 * [[project_investigation_timeline]]): 'recovery' can only ever be a
 * mitigation control — recovery presupposes the top event already
 * happened, and only mitigation controls act post-event; a prevention
 * control "working" just means the top event never happened at all, which
 * isn't a recovery. 'failure' has no such restriction — a failed control
 * can be either a prevention control that should have stopped the top event
 * or a mitigation control that should have limited its consequences.
 * Returns `undefined` to mean "no restriction, show both types." */
export function allowedControlTypesFor(kind: TimelineContextKind): ControlType[] | undefined {
  return kind === 'recovery' ? ['mitigation'] : undefined;
}
