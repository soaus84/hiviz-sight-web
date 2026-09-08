import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { IconBtn, Badge, AINote, Card, Btn, Fact, Toggle } from '@/components';
import { AttnRow } from '@/views/shared/AttnRow';
import { energyLabel } from '@/data/observations';
import { acknowledgeIncident, progressToInvestigation, INCIDENTS_BY_ID } from '@/data/incidents';
import { INVESTIGATIONS_BY_ID } from '@/data/investigations';
import { useActiveUser } from '@/state/ActiveUser';
import { STOP_WORK_EVENTS_BY_ID, callStopWork, dismissStopWorkWarning } from '@/data/stopWork';
import { INCIDENT_STATUS_DISPLAY, INCIDENT_TYPE_LABEL, SEVERITY_DISPLAY, STOP_WORK_STATUS_DISPLAY } from './incidentDisplay';
import type { Incident } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, marginBottom: 5 };
const textareaStyle = { width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, resize: 'vertical' as const, outline: 'none' };
const sectionLabel = { fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, color: colors.inkSoft, margin: '22px 0 8px' };

/** A leaf in this app's linked-entity graph (see [[project_linked_entity_pattern]])
 * — its own inline stop-work fork below is native content, not a link, but
 * its Stop Work/Investigation *reference cards* always jump to the full
 * page rather than nesting a drawer over this one. Only a hub (Investigation,
 * Insight, StopWork) ever nests a leaf's reference in place — never the
 * reverse, which is what kept this loop-safe without conditional wiring. */
export function IncidentDetail({ i, onClose, onChanged }: { i: Incident; onClose: () => void; onChanged?: () => void }) {
  const navigate = useNavigate();
  const { user } = useActiveUser();
  const status = INCIDENT_STATUS_DISPLAY[i.status];
  const severity = SEVERITY_DISPLAY[i.severityClass];
  const [ackOpen, setAckOpen] = useState(false);
  const [ackComment, setAckComment] = useState('');
  const [stopWorkIntent, setStopWorkIntent] = useState<'dismiss' | 'call' | null>(null);
  const [confirmSiteWide, setConfirmSiteWide] = useState(false);
  const [swNote, setSwNote] = useState('');
  const [siteWide, setSiteWide] = useState(false);
  // Same reasoning as SevereIncidentReview.tsx: a stop-work decision
  // replaces the Incident object in place without touching i.status, so
  // onChanged alone won't refresh this component's stale prop — read live.
  const [, forceRender] = useState(0);
  const live = INCIDENTS_BY_ID[i.id] ?? i;

  const handleAcknowledge = () => {
    if (!ackComment.trim()) return;
    acknowledgeIncident(i.id, ackComment.trim());
    onChanged?.();
  };
  const handleProgress = () => {
    progressToInvestigation(i.id);
    onChanged?.();
  };

  const stopWorkEvent = live.stopWorkEventId ? STOP_WORK_EVENTS_BY_ID[live.stopWorkEventId] : undefined;
  const needsStopWorkDecision = live.stopWorkWarranted && !live.stopWorkCalled && !live.stopWorkDismissedBy;
  const handleCallStopWork = () => {
    callStopWork('incident', i.id, user.name, siteWide, swNote.trim() || undefined);
    setStopWorkIntent(null); setSwNote(''); setSiteWide(false); setConfirmSiteWide(false);
    forceRender((v) => v + 1);
    onChanged?.();
  };
  const handleDismissStopWork = () => {
    if (!swNote.trim()) return;
    dismissStopWorkWarning('incident', i.id, user.name, swNote.trim());
    setStopWorkIntent(null); setSwNote('');
    forceRender((v) => v + 1);
    onChanged?.();
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <Badge tone={status.tone}>{status.label}</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: colors.inkSoft, flex: 1 }}>{i.id}</span>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
          <Badge tone="primary" outline>{INCIDENT_TYPE_LABEL[i.incidentType]}</Badge>
          <Badge tone={severity.tone} outline>{severity.label}</Badge>
          {i.notifiableFlag && <Badge tone="error" outline icon="campaign">Notifiable</Badge>}
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.3 }}>{i.description}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, marginTop: 8, fontWeight: 500 }}>{i.siteName} · {i.when}</div>

        <div style={sectionLabel}>Detail</div>
        <Card pad={16}>
          <Fact k="Reported by" v={i.reporterName} />
          <Fact k="Site" v={i.siteName} />
          <Fact k="When" v={i.when} />
          <Fact k="Work type" v={i.workType} />
          <Fact k="Energy" v={energyLabel(i.energyType)} />
          <Fact k="Scene secured" v={i.sceneSecured === null ? 'Unknown' : i.sceneSecured ? 'Yes' : 'No'} />
          <Fact k="People involved" v={i.peopleInvolvedCount} last={i.status !== 'acknowledged'} />
          {i.status === 'acknowledged' && <Fact k="Status" v={status.label} last />}
        </Card>

        {needsStopWorkDecision && (
          <Card pad={16} style={{ marginTop: 16, border: `1px solid ${colors.red}`, boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Badge tone="error" icon="front_hand">Stop work review</Badge>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft }}>AI flagged this as warranting a stop — nobody called one.</span>
            </div>
            {live.stopWorkWarrantedRationale && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{live.stopWorkWarrantedRationale}</div>}
            {stopWorkIntent === null && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="ghost" size="sm" onClick={() => setStopWorkIntent('dismiss')}>Dismiss</Btn>
                <Btn variant="danger" size="sm" icon="front_hand" onClick={() => setStopWorkIntent('call')}>Request stop work</Btn>
              </div>
            )}
            {stopWorkIntent === 'dismiss' && (
              <>
                <label style={fieldLabel}>Why doesn't this warrant a stop?</label>
                <textarea className="a-input" autoFocus value={swNote} onChange={(e) => setSwNote(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 12 }} placeholder="Isolated fault, already contained…" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="ghost" size="sm" onClick={() => { setStopWorkIntent(null); setSwNote(''); }}>Cancel</Btn>
                  <Btn variant="primary" size="sm" disabled={!swNote.trim()} onClick={handleDismissStopWork}>Dismiss</Btn>
                </div>
              </>
            )}
            {stopWorkIntent === 'call' && !confirmSiteWide && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600 }}>Site-wide stop</span>
                  <Toggle checked={siteWide} onChange={setSiteWide} />
                </div>
                <label style={fieldLabel}>Instruction (optional)</label>
                <textarea className="a-input" autoFocus value={swNote} onChange={(e) => setSwNote(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 12 }} placeholder="Anything site needs to know before stopping…" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="ghost" size="sm" onClick={() => { setStopWorkIntent(null); setSwNote(''); setSiteWide(false); }}>Cancel</Btn>
                  <Btn variant="danger" size="sm" icon="front_hand" onClick={() => (siteWide ? setConfirmSiteWide(true) : handleCallStopWork())}>
                    {siteWide ? 'Request stop work — site-wide' : 'Request stop work'}
                  </Btn>
                </div>
              </>
            )}
            {stopWorkIntent === 'call' && confirmSiteWide && (
              <>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
                  This stops all work at {i.siteName} — not just {i.workType}. Confirm that's intended before it goes out.
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="ghost" size="sm" onClick={() => setConfirmSiteWide(false)}>Back</Btn>
                  <Btn variant="danger" size="sm" icon="front_hand" onClick={handleCallStopWork}>Confirm site-wide stop</Btn>
                </div>
              </>
            )}
          </Card>
        )}
        {live.stopWorkDismissedBy && !stopWorkEvent && (
          <Card pad={16} style={{ marginTop: 16, boxShadow: 'none' }}>
            <Badge tone="primary" outline icon="front_hand">Stop work dismissed</Badge>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginTop: 8 }}>{live.stopWorkDismissedNote}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 8 }}>— {live.stopWorkDismissedBy}</div>
          </Card>
        )}
        {i.status === 'severe' && !ackOpen && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Btn variant="ghost" full onClick={() => setAckOpen(true)}>Acknowledge</Btn>
            <Btn variant="primary" full icon="arrow_forward" onClick={handleProgress}>Progress to investigation</Btn>
          </div>
        )}
        {i.status === 'severe' && ackOpen && (
          <Card pad={16} style={{ marginTop: 16 }}>
            <label style={fieldLabel}>Acknowledgement reason</label>
            <textarea
              className="a-input" autoFocus value={ackComment} onChange={(e) => setAckComment(e.target.value)}
              placeholder="Why no investigation is needed — isolated fault, already contained…" rows={3}
              style={{ ...textareaStyle, marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" size="sm" onClick={() => { setAckOpen(false); setAckComment(''); }}>Cancel</Btn>
              <Btn variant="primary" size="sm" icon="check" disabled={!ackComment.trim()} onClick={handleAcknowledge}>Acknowledge</Btn>
            </div>
          </Card>
        )}
        {i.status === 'acknowledged' && i.acknowledgeComment && (
          <div style={{ marginTop: 16 }}>
            <AINote title="Reviewer's acknowledgement">{i.acknowledgeComment}</AINote>
          </div>
        )}

        {stopWorkEvent && (
          <>
            <div style={sectionLabel}>Stop work</div>
            <Card pad={4} style={{ boxShadow: 'none' }}>
              <AttnRow
                label={STOP_WORK_STATUS_DISPLAY[stopWorkEvent.status].label}
                icon="front_hand"
                tone={STOP_WORK_STATUS_DISPLAY[stopWorkEvent.status].tone}
                title={stopWorkEvent.workType}
                meta={`${stopWorkEvent.siteName}${stopWorkEvent.siteWide ? ' · Site-wide' : ''}`}
                last external
                onClick={() => navigate(`/incidents/stop-work?id=${stopWorkEvent.id}`)}
              />
            </Card>
          </>
        )}

        {i.status === 'linked' && i.linkedInvestigationId && (() => {
          const investigation = INVESTIGATIONS_BY_ID[i.linkedInvestigationId];
          if (!investigation) return null;
          return (
            <>
              <div style={sectionLabel}>Investigation</div>
              <Card pad={4} style={{ boxShadow: 'none' }}>
                <AttnRow
                  label={investigation.status === 'closed' ? 'Closed' : 'Investigating'}
                  icon="search"
                  tone={SEVERITY_DISPLAY[investigation.severityClass].tone}
                  title={investigation.title}
                  meta={investigation.siteNames.join(', ')}
                  last external
                  onClick={() => navigate(`/investigations/${investigation.id}`)}
                />
              </Card>
            </>
          );
        })()}
      </div>
    </>
  );
}
