import { useState } from 'react';
import { colors } from '@/tokens';
import { IconBtn, Btn, Badge, Toggle } from '@/components';
import { updateTimelineEvent, removeTimelineEvent } from '@/data/timeline';
import type { TimelineEvent } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, marginBottom: 5 };
const textareaStyle = { width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, resize: 'vertical' as const, outline: 'none' };
const inputStyle = { padding: '7px 9px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, outline: 'none', width: '100%' };

/** Add/edit surface for one TimelineEvent's own facts — time and
 * description only. See [[project_investigation_timeline]]'s 2026-09-15
 * redesign: context tags (and the findings/recommendations that live on
 * them) moved out of this drawer entirely, into their own ContextDrawer.tsx
 * opened directly from the event's card on the timeline
 * (InvestigationTimeline.tsx) — "the context... should be added in the
 * timeline to the card and have their own drawer," the user's own words.
 * Always operates on a real, already-created record (InvestigationTimeline
 * .tsx creates it immediately on "+ Add event", same as createWorkStream
 * does), so there's no separate unsaved-draft state to manage here —
 * `at`/`description` autosave on change, same convention as
 * WorkStreamsSection's narrative textarea. `canEdit` false (investigation
 * closed) renders everything read-only with no delete affordance. */
export function TimelineEventDrawer({ event, canEdit, onClose, onChanged }: { event: TimelineEvent; canEdit: boolean; onClose: () => void; onChanged: () => void }) {
  const [at, setAt] = useState(event.at);
  const [description, setDescription] = useState(event.description);

  // datetime-local wants "YYYY-MM-DDTHH:mm" with no seconds/zone — this
  // app's timestamps are already naive local strings (no 'Z'), so round-trip
  // by slicing/padding rather than going through Date/toISOString, which
  // would silently shift the value by the browser's UTC offset.
  const patchAt = (v: string) => {
    const iso = v ? `${v}:00` : event.at;
    setAt(iso);
    updateTimelineEvent(event.id, { at: iso });
    onChanged();
  };
  const patchDescription = (v: string) => {
    setDescription(v);
    updateTimelineEvent(event.id, { description: v });
    onChanged();
  };
  const patchTimeUnknown = (checked: boolean) => {
    updateTimelineEvent(event.id, { timeUnknown: checked });
    onChanged();
  };
  const handleDelete = () => {
    removeTimelineEvent(event.id);
    onClose();
    onChanged();
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <Badge tone="primary" outline icon="timeline">Timeline event</Badge>
        {event.populatedByHiviz && <Badge tone="primary" outline icon="auto_awesome">Hiviz-populated</Badge>}
        <span style={{ flex: 1 }} />
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <label style={fieldLabel}>When</label>
        {canEdit ? (
          <>
            <input type="datetime-local" className="a-input" value={at.slice(0, 16)} onChange={(e) => patchAt(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600 }}>Time is approximate or unknown</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkMuted, marginTop: 2, maxWidth: 300 }}>For a systemic factor or decision that predates the incident sequence — a real date is still needed to place it on the timeline.</div>
              </div>
              <Toggle checked={!!event.timeUnknown} onChange={patchTimeUnknown} />
            </div>
          </>
        ) : (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, marginBottom: 14 }}>
            {event.timeUnknown && <span style={{ color: colors.inkMuted, fontStyle: 'italic', marginRight: 6 }}>Approx.</span>}
            {new Date(event.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </div>
        )}

        <label style={fieldLabel}>What happened</label>
        {canEdit ? (
          <textarea className="a-input" autoFocus value={description} onChange={(e) => patchDescription(e.target.value)} rows={3} style={{ ...textareaStyle, marginBottom: 14 }} placeholder="What happened at this point…" />
        ) : (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>{event.description || '—'}</div>
        )}

        {canEdit && (
          <div style={{ marginTop: 6, paddingTop: 14, borderTop: `1px solid ${colors.ruleSoft}` }}>
            <Btn variant="ghost" size="sm" icon="delete" onClick={handleDelete}>Delete event</Btn>
          </div>
        )}
      </div>
    </>
  );
}
