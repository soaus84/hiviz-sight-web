import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { IconBtn, Badge, AINote, Card, Btn, Fact } from '@/components';
import { energyLabel } from '@/data/observations';
import { acknowledgeIncident, progressToInvestigation } from '@/data/incidents';
import { INCIDENT_STATUS_DISPLAY, INCIDENT_TYPE_LABEL, SEVERITY_DISPLAY } from './incidentDisplay';
import type { Incident } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: colors.inkMuted, marginBottom: 5 };
const textareaStyle = { width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, resize: 'vertical' as const, outline: 'none' };

export function IncidentDetail({ i, onClose, onChanged }: { i: Incident; onClose: () => void; onChanged?: () => void }) {
  const navigate = useNavigate();
  const status = INCIDENT_STATUS_DISPLAY[i.status];
  const severity = SEVERITY_DISPLAY[i.severityClass];
  const [ackOpen, setAckOpen] = useState(false);
  const [ackComment, setAckComment] = useState('');

  const handleAcknowledge = () => {
    if (!ackComment.trim()) return;
    acknowledgeIncident(i.id, ackComment.trim());
    onChanged?.();
  };
  const handleProgress = () => {
    progressToInvestigation(i.id);
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

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 8px' }}>Detail</div>
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

        {i.status === 'linked' && i.linkedInvestigationId && (
          <div style={{ marginTop: 16 }}>
            <Btn variant="ghost" full onClick={() => { onClose(); navigate(`/investigations/${i.linkedInvestigationId}`); }}>
              View the linked investigation
            </Btn>
          </div>
        )}
      </div>
    </>
  );
}
