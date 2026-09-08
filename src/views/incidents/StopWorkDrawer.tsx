import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Drawer, IconBtn, Badge, Btn, Card } from '@/components';
import { AttnRow } from '@/views/shared/AttnRow';
import { useActiveUser } from '@/state/ActiveUser';
import { confirmStopped, resume, formatWhen } from '@/data/stopWork';
import { INCIDENTS_BY_ID } from '@/data/incidents';
import { BARRIER_FAILURES_BY_ID } from '@/data/barrierFailures';
import { STOP_WORK_STATUS_DISPLAY, SEVERITY_DISPLAY } from './incidentDisplay';
import type { StopWorkEvent } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, marginBottom: 5 };
const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13.5, outline: 'none', resize: 'vertical' as const };
const sectionLabel = { fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, color: colors.inkSoft, margin: '22px 0 10px' };

interface TimelineEntry { label: string; by: string; at?: string; note?: string }

/** A short, real summary of the source — not just its id — so the card
 * reads like InvestigationDetail's "Source incidents" rows, not a bare
 * badge. Falls back to the fields already copied onto the StopWorkEvent
 * itself if the source record can't be found, so this never renders empty. */
function describeSource(e: StopWorkEvent): { label: string; icon: string; title: string; meta: string } {
  if (e.sourceKind === 'incident') {
    const i = INCIDENTS_BY_ID[e.sourceId];
    return i ? { label: 'Incident', icon: 'report', title: i.description, meta: `${i.siteName} · ${i.when}` } : { label: 'Incident', icon: 'report', title: e.workType, meta: e.siteName };
  }
  const b = BARRIER_FAILURES_BY_ID[e.sourceId];
  return b ? { label: 'Barrier Failure', icon: 'gpp_bad', title: b.controlName, meta: `${b.siteName} · ${b.hazardName}` } : { label: 'Barrier Failure', icon: 'gpp_bad', title: e.workType, meta: e.siteName };
}

/** The cumulative story — every action recorded so far, who and when
 * (where is already carried by the site/incident badges above). Built
 * fresh from whichever fields are actually set, so it only ever shows what
 * really happened rather than every possible stage. */
function buildTimeline(e: StopWorkEvent): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  if (e.requestedBy) entries.push({ label: 'Stop requested', by: e.requestedBy, at: e.requestedAt, note: e.requestNote });
  if (e.confirmedBy) entries.push({ label: e.requestedBy ? 'Confirmed stopped' : 'Stopped at the time', by: e.confirmedBy, at: e.confirmedAt });
  if (e.resumedBy) entries.push({ label: 'Resumed', by: e.resumedBy, at: e.resumedAt, note: e.resumeNote });
  return entries;
}

/** The action surface for one StopWorkEvent, opened from the StopWork
 * board — only ever exists once a stop is actually happening (see
 * data/stopWork.ts's top-of-file note; the "should we stop" decision lives
 * on the source Incident/BarrierFailure itself, not here). Every action is
 * attributed to the active preview persona (useActiveUser), not a
 * free-text name — same convention InsightDetail's addSupport already
 * uses — so "who" is never something someone has to type in about
 * themselves. */
/** `onOpenSource` opens the source Incident/BarrierFailure as a nested
 * drawer over this one instead of navigating away — omitted (not just
 * false) by whichever page renders this drawer already-nested inside
 * someone else's, so nesting never goes past one level deep. See
 * IncidentDetail.tsx's/SevereIncidentReview.tsx's/BarrierFailureDetail.tsx's
 * own onOpenStopWork for the same rule in the other direction. */
export function StopWorkDrawer({ e, onClose, onChanged, onOpenSource }: { e: StopWorkEvent; onClose: () => void; onChanged?: () => void; onOpenSource?: (sourceKind: 'incident' | 'barrierFailure', sourceId: string) => void }) {
  const navigate = useNavigate();
  const { user } = useActiveUser();
  const status = STOP_WORK_STATUS_DISPLAY[e.status];
  const severity = SEVERITY_DISPLAY[e.severityClass];
  const [note, setNote] = useState('');

  const act = (fn: () => void) => { fn(); setNote(''); onChanged?.(); };
  const sourcePath = e.sourceKind === 'incident' ? `/incidents?id=${e.sourceId}` : `/risk/barrier-failures/${e.sourceId}`;
  const source = describeSource(e);

  return (
    <Drawer open onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>{e.workType}</div>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <Badge tone={status.tone}>{status.label}</Badge>
          {e.siteWide && <Badge tone="error" outline>Site-wide</Badge>}
          <Badge tone={severity.tone} outline>{severity.label}</Badge>
          <Badge tone="primary" outline icon="place">{e.siteName}</Badge>
        </div>

        {e.warrantedRationale && (
          <Card pad={16} style={{ marginBottom: 16, boxShadow: 'none' }}>
            <div style={fieldLabel}>Why a stop was warranted</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5 }}>{e.warrantedRationale}</div>
          </Card>
        )}

        {e.status === 'pending_stop' && (
          <>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, lineHeight: 1.5, marginBottom: 14 }}>Awaiting confirmation from site that work has actually stopped.</div>
            <Btn variant="danger" icon="check" onClick={() => act(() => confirmStopped(e.id, user.name))}>
              {e.siteWide ? 'Confirm work has stopped — site-wide' : 'Confirm work has stopped'}
            </Btn>
          </>
        )}

        {e.status === 'stopped' && (
          <>
            <label style={fieldLabel}>Resolution note</label>
            <textarea className="a-input" value={note} onChange={(ev) => setNote(ev.target.value)} rows={3} style={{ ...inputStyle, marginBottom: 10 }} placeholder="What's changed, what was fixed…" />
            {e.requiresApproval && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, marginBottom: 10 }}>Serious/critical — signing off as {user.name} ({user.role}).</div>}
            <Btn variant="primary" icon="check" disabled={!note.trim()} onClick={() => act(() => resume(e.id, user.name, note.trim()))}>
              {e.requiresApproval ? 'Approve and resume' : 'Resume work'}
            </Btn>
          </>
        )}

        {buildTimeline(e).length > 0 && (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>Story</div>
            <Card pad={4} style={{ boxShadow: 'none' }}>
              {buildTimeline(e).map((t, i) => (
                <div key={i} style={{ padding: '10px 12px', borderTop: i === 0 ? undefined : `1px solid ${colors.ruleSoft}` }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700 }}>{t.label} · {t.by}</span>
                    {t.at && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, whiteSpace: 'nowrap' }}>{formatWhen(t.at)}</span>}
                  </div>
                  {t.note && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, lineHeight: 1.5, marginTop: 4 }}>{t.note}</div>}
                </div>
              ))}
            </Card>
          </>
        )}

        <div style={sectionLabel}>Source</div>
        <Card pad={4} style={{ boxShadow: 'none' }}>
          <AttnRow
            label={source.label}
            icon={source.icon}
            tone={severity.tone}
            title={source.title}
            meta={source.meta}
            last
            onClick={() => (onOpenSource ? onOpenSource(e.sourceKind, e.sourceId) : navigate(sourcePath))}
          />
        </Card>
      </div>
    </Drawer>
  );
}
