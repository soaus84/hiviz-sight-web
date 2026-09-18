import { useState } from 'react';
import { colors } from '@/tokens';
import { Badge, Btn, Icon, IconBtn, Drawer } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';
import { timelineForInvestigation, addTimelineEvent, populateEventFromAssist, TIMELINE_EVENTS_BY_ID } from '@/data/timeline';
import { STOP_WORK_EVENTS_BY_ID } from '@/data/stopWork';
import { STOP_WORK_STATUS_DISPLAY } from './incidentDisplay';
import { ContextNarrative } from './ContextNarrative';
import { TimelineEventDrawer } from './TimelineEventDrawer';
import { ContextDrawer } from './ContextDrawer';
import { StopWorkDrawer } from './StopWorkDrawer';
import { Section } from '@/views/shared/SectionHeading';
import type { TimelineEvent, TimelineContext, TimelineContextKind, FwFactor } from '@/types';

/** This app's timestamps are naive local strings (no 'Z' — see e.g.
 * data/incidents.ts's occurredAt values), so a new event's default "now"
 * has to be built from local getters rather than toISOString(), which would
 * convert to UTC and silently shift the value by the browser's offset. */
function nowLocalIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

/** Stop Work, surfaced with its real, *live* status — not a snapshot taken
 * at add-time — since the underlying StopWorkEvent can keep changing status
 * (pending_stop -> stopped -> resumed) well after this investigation's
 * timeline was built. Deliberately not a stored TimelineEvent for that
 * reason: a stored fact would go stale the moment the real event's status
 * moved on. Barrier failures would get the same treatment, but there's no
 * existing Incident<->BarrierFailure link in this app to source it from
 * (see [[project_deferred_risk_incident_ideas]]) — flagged as blocked, not
 * built on a guessed link. Opens `StopWorkDrawer` in place (`onOpen`,
 * 2026-09-15) rather than navigating to the full Stop Work record —
 * consistent with this app's usual "stay on the page you're reading, open a
 * nested drawer" pattern (see [[project_linked_entity_pattern]]) rather than
 * losing the investigation you were reading to jump to a different section. */
function StopWorkBanner({ stopWorkEventId, onOpen }: { stopWorkEventId: string; onOpen: () => void }) {
  const e = STOP_WORK_EVENTS_BY_ID[stopWorkEventId];
  if (!e) return null;
  const status = STOP_WORK_STATUS_DISPLAY[e.status];
  return (
    <div
      className="a-card-int" onClick={onOpen}
      style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}
    >
      <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name="front_hand" size={17} color={colors.inkSoft} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600 }}>Stop work — {e.workType}{e.siteWide ? ' · Site-wide' : ''}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 }}>Live status</div>
      </div>
      <Badge tone={status.tone}>{status.label}</Badge>
      <Icon name="chevron_right" size={18} color={colors.inkMuted} style={{ flexShrink: 0 }} />
    </div>
  );
}

/** One entry in the long-form timeline document — no card border/shadow, no
 * click-anywhere-to-reveal chevron: everything an event and its context tags
 * carry is already rendered in full below (ContextNarrative), so there's
 * nothing left to "open" to read. Editing is still available, just via
 * explicit small pencil icons rather than an implied "click for more" —
 * see [[project_investigation_timeline]]'s "long form it now" note: this is
 * the one Timeline rendering, used at every investigation phase, not a
 * separate closed-only report view. `isFirst` skips the top divider. */
function EventRow({ e, canEdit, isFirst, onEditEvent, onEditContext, onAddContext }: {
  e: TimelineEvent;
  canEdit: boolean;
  isFirst: boolean;
  onEditEvent: () => void;
  onEditContext: (c: TimelineContext) => void;
  onAddContext: () => void;
}) {
  const when = new Date(e.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return (
    <div style={{ padding: '16px 4px', borderTop: isFirst ? undefined : `1px solid ${colors.ruleSoft}`, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name="schedule" size={17} color={colors.inkSoft} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{e.timeUnknown ? `Approx. · ${when}` : when}</span>
          {e.populatedByHiviz && <Badge tone="primary" outline icon="auto_awesome">Hiviz-populated</Badge>}
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, lineHeight: 1.45, marginTop: 4 }}>{e.description || <span style={{ color: colors.inkMuted, fontWeight: 500 }}>No description yet</span>}</div>
        {e.context.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {e.context.map((c) => <ContextNarrative key={c.id} c={c} canEdit={canEdit} onEdit={() => onEditContext(c)} />)}
          </div>
        )}
        {canEdit && (
          <div style={{ marginTop: 8 }}>
            <Btn variant="ghost" size="sm" icon="add" onClick={onAddContext}>Add context</Btn>
          </div>
        )}
      </div>
      {canEdit && <IconBtn name="edit" size={15} onClick={onEditEvent} />}
    </div>
  );
}

/** The Investigation's timeline — see [[project_investigation_timeline]].
 * Deliberately Investigation-only, not shared with Insight (which has no
 * root-cause reconstruction step) — a noted exception to this app's usual
 * Insight/Investigation symmetry convention, not an oversight. `canEdit`
 * should be `v.status === 'timeline'` (InvestigationDetail.tsx's
 * `canEditTimeline`). `stopWorkEventIds` is whatever the investigation's own
 * source incidents happen to carry (usually 0 or 1) — see StopWorkBanner.
 * `onOpenIncident` opens the Stop Work drawer's own source Incident as a
 * second nested drawer over it (the same callback InvestigationDetail
 * already threads to its own "Source incidents" section) — omitted by
 * whichever page renders this already-nested, so it never goes past one
 * level. Every `stopWorkEventIds` entry is sourced from an Incident (never a
 * BarrierFailure — see StopWorkBanner's own doc comment), so that's the only
 * source kind this ever needs to handle. */
export function InvestigationTimeline({ investigationId, canEdit, onChanged, relevantWorkTypeIds, aiSuggestedTimelineEvents, stopWorkEventIds, onOpenIncident }: {
  investigationId: string;
  canEdit: boolean;
  onChanged?: () => void;
  relevantWorkTypeIds: string[];
  aiSuggestedTimelineEvents?: { description: string; contextKind?: TimelineContextKind; controlId?: string; fwFactor?: FwFactor }[];
  stopWorkEventIds: string[];
  onOpenIncident?: (id: string) => void;
}) {
  const { user } = useActiveUser();
  const [, forceRender] = useState(0);
  const refresh = () => { forceRender((v) => v + 1); onChanged?.(); };
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  // null eventId = no context drawer open; context: null means "creating a
  // new tag on this event" (ContextDrawer's own create/edit distinction).
  const [contextTarget, setContextTarget] = useState<{ eventId: string; context: TimelineContext | null } | null>(null);
  const [stopWorkTargetId, setStopWorkTargetId] = useState<string | null>(null);

  const events = timelineForInvestigation(investigationId);
  const openEvent = openEventId ? TIMELINE_EVENTS_BY_ID[openEventId] ?? null : null;
  const stopWorkTarget = stopWorkTargetId ? STOP_WORK_EVENTS_BY_ID[stopWorkTargetId] ?? null : null;
  // Once used, stays hidden even if every populated event is later deleted —
  // same "used once" convention as WorkStreamsSection's own Populate button,
  // so it can't be clicked repeatedly to keep re-adding the same suggestions.
  const canPopulate = canEdit && !!aiSuggestedTimelineEvents?.length && !events.some((e) => e.populatedByHiviz);

  if (events.length === 0 && !canEdit && stopWorkEventIds.length === 0) return null;

  const handleAdd = () => {
    const e = addTimelineEvent({ investigationId, at: nowLocalIso(), description: '', createdBy: user.name });
    refresh();
    setOpenEventId(e.id);
  };
  const handlePopulate = () => {
    aiSuggestedTimelineEvents?.forEach((s) => {
      populateEventFromAssist({ investigationId, at: nowLocalIso(), description: s.description, contextKind: s.contextKind, controlId: s.controlId, fwFactor: s.fwFactor, createdBy: user.name });
    });
    refresh();
  };

  return (
    <>
      <Section
        title="Timeline"
        subtitle="The sequence of what happened, event by event — each one can carry a control, deviation, or systemic-factor tag."
        pad={events.length === 0 ? 28 : 4}
        footer={canEdit ? (
          <>
            <Btn variant="ghost" size="sm" icon="add" onClick={handleAdd}>Add event</Btn>
            {canPopulate && <Btn variant="ghost" size="sm" icon="auto_awesome" onClick={handlePopulate}>Populate with Hiviz suggestions</Btn>}
          </>
        ) : undefined}
      >
        {stopWorkEventIds.map((id) => <StopWorkBanner key={id} stopWorkEventId={id} onOpen={() => setStopWorkTargetId(id)} />)}
        {events.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <Icon name="schedule" size={26} color={colors.inkMuted} />
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 700, marginTop: 10 }}>No timeline events yet</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, lineHeight: 1.5, maxWidth: 380, margin: '6px auto 0' }}>
              Build the sequence of what happened — each event can be classified as normal work, a deviation, a control that helped recover, a control that failed, or a systemic contributing factor.
            </div>
          </div>
        ) : (
          events.map((e, i) => (
            <EventRow
              key={e.id} e={e} canEdit={canEdit} isFirst={i === 0}
              onEditEvent={() => setOpenEventId(e.id)}
              onEditContext={(c) => setContextTarget({ eventId: e.id, context: c })}
              onAddContext={() => setContextTarget({ eventId: e.id, context: null })}
            />
          ))
        )}
      </Section>

      <Drawer open={!!openEvent} onClose={() => setOpenEventId(null)}>
        {openEvent && <TimelineEventDrawer key={openEvent.id} event={openEvent} canEdit={canEdit} onClose={() => setOpenEventId(null)} onChanged={refresh} />}
      </Drawer>
      <Drawer open={!!contextTarget} onClose={() => setContextTarget(null)}>
        {contextTarget && (
          <ContextDrawer
            key={contextTarget.context?.id ?? `new-${contextTarget.eventId}`}
            eventId={contextTarget.eventId} context={contextTarget.context} relevantWorkTypeIds={relevantWorkTypeIds}
            canEdit={canEdit} onClose={() => setContextTarget(null)} onChanged={refresh}
          />
        )}
      </Drawer>
      {stopWorkTarget && (
        <StopWorkDrawer
          e={stopWorkTarget} onClose={() => setStopWorkTargetId(null)}
          onOpenSource={onOpenIncident ? (kind, id) => { if (kind === 'incident') onOpenIncident(id); } : undefined}
        />
      )}
    </>
  );
}
