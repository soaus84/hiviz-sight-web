import type { FindingKind } from '@/views/shared/findingDisplay';
import type { TimelineContext, TimelineEvent } from '@/types';

/** A "finding" is derived, never stored — see TimelineContext's own doc
 * comment (types/timeline.ts) for the 2026-09-15 redesign this replaced
 * (a standalone Finding entity with its own manually-picked event links,
 * which could drift from the timeline itself: "3 findings in the timeline
 * but only 1 in the findings area doesn't make sense"). Any context tag
 * that carries a `recommendation` counts, scanned across every event on the
 * investigation's timeline — the link to "which event" was never anything
 * other than "this context sits on this event," so there's nothing left to
 * pick or to drift. */
export interface FindingView {
  event: TimelineEvent;
  context: TimelineContext;
}

export function deriveFindings(events: TimelineEvent[]): FindingView[] {
  const out: FindingView[] = [];
  for (const event of events) {
    for (const context of event.context) {
      if (context.recommendation?.trim()) out.push({ event, context });
    }
  }
  return out;
}

/** By `context.kind`, not `controlId` presence — since 2026-09-18's
 * 'new_control' recommendation (TimelineContext.controlRecommendationType's
 * own doc comment) a control finding can legitimately have no `controlId`
 * at all (recommending a control that doesn't exist in the register yet),
 * so `controlId` alone can no longer tell 'control' and 'systemic' apart. */
export function findingKindOf(context: TimelineContext): FindingKind {
  return context.kind === 'failure' ? 'control' : 'systemic';
}
