import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Card, Badge, Btn, AINote, Avatar, Toggle } from '@/components';
import { energyLabel } from '@/data/observations';
import { acknowledgeIncident, progressToInvestigation, INCIDENTS_BY_ID } from '@/data/incidents';
import { useActiveUser } from '@/state/ActiveUser';
import { STOP_WORK_EVENTS_BY_ID, callStopWork, dismissStopWorkWarning } from '@/data/stopWork';
import { INCIDENT_STATUS_DISPLAY, INCIDENT_TYPE_LABEL, SEVERITY_DISPLAY, STOP_WORK_STATUS_DISPLAY } from './incidentDisplay';
import type { Incident } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, marginBottom: 5 };
const textareaStyle = { width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, resize: 'vertical' as const, outline: 'none' };

/** The review-stage twin of InvestigationDetail — same Card shell, badge
 * row, title, and action-bar rhythm, so switching between the "Needs
 * review", "Investigating" and "Closed" tabs in Investigations.tsx feels
 * like one page, not a drawer bolted on. This is the "story" a reviewer
 * reads before deciding Acknowledge vs Progress to investigation — the
 * severe Incident's own description and detail, since no Investigation
 * record exists yet to read a story from. Only ever renders a 'severe'
 * incident (Investigations.tsx only routes severe incidents here) — the
 * acknowledged/linked follow-up states are covered by the drawer variant,
 * IncidentDetail, used everywhere else an incident of any status is opened. */
export function SevereIncidentReview({ i, onChanged }: { i: Incident; onChanged?: () => void }) {
  const navigate = useNavigate();
  const { user } = useActiveUser();
  const status = INCIDENT_STATUS_DISPLAY.severe;
  const severity = SEVERITY_DISPLAY[i.severityClass];
  const [ackOpen, setAckOpen] = useState(false);
  const [ackComment, setAckComment] = useState('');
  const [swNote, setSwNote] = useState('');
  const [siteWide, setSiteWide] = useState(false);
  // Neither a stop-work decision (recorded on the Incident itself, but via
  // a replace-in-place that swaps the object, not the prop we were passed)
  // nor a StopWorkEvent's own status change touches i.status, so the
  // parent's onChanged (which only reacts to that) won't re-render this
  // component with fresh data — read live from the BY_ID maps and force a
  // local re-render instead.
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
    callStopWork('incident', i.id, user.name, siteWide);
    forceRender((v) => v + 1);
    onChanged?.();
  };
  const handleDismissStopWork = () => {
    if (!swNote.trim()) return;
    dismissStopWorkWarning('incident', i.id, user.name, swNote.trim());
    forceRender((v) => v + 1);
    onChanged?.();
  };

  return (
    <Card pad={24}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <Badge tone={status.tone}>Needs review</Badge>
        <Badge tone="primary" outline>{INCIDENT_TYPE_LABEL[i.incidentType]}</Badge>
        <Badge tone={severity.tone} outline>{severity.label}</Badge>
        {i.notifiableFlag && <Badge tone="error" outline icon="campaign">Notifiable</Badge>}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: colors.inkSoft, marginLeft: 'auto' }}>{i.id}</span>
      </div>
      <h2 style={{ fontFamily: 'var(--font-sans)', margin: 0, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>{i.description}</h2>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
        <Badge tone="primary" outline icon="place">{i.siteName}</Badge>
      </div>

      {needsStopWorkDecision && (
        <Card pad={16} style={{ marginTop: 14, border: `1px solid ${colors.red}`, boxShadow: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Badge tone="error" icon="front_hand">Stop work review</Badge>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft }}>AI flagged this as warranting a stop — nobody called one.</span>
          </div>
          {live.stopWorkWarrantedRationale && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{live.stopWorkWarrantedRationale}</div>}
          <label style={fieldLabel}>Note</label>
          <textarea className="a-input" value={swNote} onChange={(e) => setSwNote(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 12 }} placeholder="Only needed to dismiss — why this doesn't warrant a stop…" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600 }}>Site-wide stop</span>
            <Toggle checked={siteWide} onChange={setSiteWide} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" size="sm" disabled={!swNote.trim()} onClick={handleDismissStopWork}>Dismiss</Btn>
            <Btn variant="danger" size="sm" icon="front_hand" onClick={handleCallStopWork}>Request stop work</Btn>
          </div>
        </Card>
      )}
      {live.stopWorkDismissedBy && !stopWorkEvent && (
        <Card pad={16} style={{ marginTop: 14, boxShadow: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Badge tone="primary" outline icon="front_hand">Stop work dismissed</Badge>
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5 }}>{live.stopWorkDismissedNote}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 8 }}>— {live.stopWorkDismissedBy}</div>
        </Card>
      )}
      {stopWorkEvent && (
        <div
          className="a-card-int"
          onClick={() => navigate('/incidents/stop-work')}
          style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <Badge tone={STOP_WORK_STATUS_DISPLAY[stopWorkEvent.status].tone} outline icon="front_hand">{STOP_WORK_STATUS_DISPLAY[stopWorkEvent.status].label}</Badge>
          {stopWorkEvent.siteWide && <Badge tone="error" outline>Site-wide</Badge>}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, textDecoration: 'underline' }}>View in Stop Work</span>
        </div>
      )}

      <div style={{ marginTop: 14, background: colors.fill, borderRadius: 'var(--radius-lg)', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar name={i.reporterName} size={26} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 500 }}>Reported by {i.reporterName} · {i.when}</span>
        </div>
        {!ackOpen && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" size="sm" onClick={() => setAckOpen(true)}>Acknowledge</Btn>
            <Btn variant="primary" size="sm" icon="arrow_forward" onClick={handleProgress}>Progress to investigation</Btn>
          </div>
        )}
      </div>

      {ackOpen && (
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

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>The story</div>
      <AINote title="What was reported">{i.description}</AINote>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>Detail</div>
      <Card pad={16} style={{ boxShadow: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.6 }}>
          <div><strong>Work type:</strong> {i.workType}</div>
          <div><strong>People involved:</strong> {i.peopleInvolvedCount}</div>
          <div><strong>Scene secured:</strong> {i.sceneSecured === null ? 'Unknown' : i.sceneSecured ? 'Yes' : 'No'}</div>
        </div>
      </Card>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>Energy classification</div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        <Badge tone={i.energyType === 'none' ? 'warning' : 'error'} outline>{energyLabel(i.energyType)}</Badge>
      </div>
    </Card>
  );
}
