import { useState } from 'react';
import { colors } from '@/tokens';
import { Card, Badge, Btn, AINote, Fact, Icon } from '@/components';
import { CRITICAL_CONTROLS_BY_ID, WORKSITE_CONTROLS_BY_ID } from '@/data/risk';
import { resolveDirectly, submitForApproval, approveResolution, sendBack, escalateToInsightPipeline } from '@/data/barrierFailures';
import { BARRIER_FAILURE_STATUS_DISPLAY, CONTROL_TYPE_LABEL, SEVERITY_DISPLAY } from './riskDisplay';
import type { BarrierFailure } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: colors.inkMuted, marginBottom: 5 };
const textareaStyle = { width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, resize: 'vertical' as const, outline: 'none' };

// Same fixed narrative "now" the rest of the mock data uses.
const MOCK_NOW = new Date('2025-05-07T10:00:00');

function hoursSince(iso: string): number {
  return (MOCK_NOW.getTime() - new Date(iso).getTime()) / 3_600_000;
}

export function BarrierFailureDetail({ b, onChanged }: { b: BarrierFailure; onChanged?: () => void }) {
  const status = BARRIER_FAILURE_STATUS_DISPLAY[b.status];
  const severity = SEVERITY_DISPLAY[b.severityClass];

  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveNote, setResolveNote] = useState('');
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [sendBackReason, setSendBackReason] = useState('');
  const [escalateError, setEscalateError] = useState<string | null>(null);

  const worksiteControl = WORKSITE_CONTROLS_BY_ID[b.worksiteControlId];
  const slaHours = worksiteControl ? CRITICAL_CONTROLS_BY_ID[worksiteControl.criticalControlId]?.rectificationSlaHours : undefined;
  const pastSla = b.status === 'open' && slaHours !== undefined && hoursSince(b.flaggedAt) > slaHours;

  const handleResolve = () => {
    const result = b.requiresApproval
      ? submitForApproval(b.id, resolveNote, b.flaggedBy)
      : resolveDirectly(b.id, resolveNote, b.flaggedBy);
    setResolveError(result.error ?? null);
    if (!result.error) { setResolveOpen(false); setResolveNote(''); onChanged?.(); }
  };
  const handleApprove = () => { approveResolution(b.id); onChanged?.(); };
  const handleSendBack = () => {
    if (!sendBackReason.trim()) return;
    sendBack(b.id, sendBackReason.trim());
    setSendBackOpen(false); setSendBackReason('');
    onChanged?.();
  };
  const handleEscalate = () => {
    const result = escalateToInsightPipeline(b.id);
    setEscalateError(result.error ?? null);
    if (!result.error) onChanged?.();
  };

  return (
    <Card pad={24}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <Badge tone={status.tone}>{status.label}</Badge>
        <Badge tone={severity.tone} outline>{severity.label}</Badge>
        <Badge tone="primary" outline>{CONTROL_TYPE_LABEL[b.controlType]}</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: colors.inkSoft, marginLeft: 'auto' }}>{b.id}</span>
      </div>
      <h2 style={{ fontFamily: 'var(--font-sans)', margin: 0, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>{b.controlName}</h2>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkSoft, marginTop: 10 }}>{b.hazardName}</div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
        <Badge tone="primary" outline icon="place">{b.siteName}</Badge>
        {pastSla && <Badge tone="error" outline icon="schedule">Past SLA</Badge>}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>What was flagged</div>
      <AINote title={`Reported by ${b.flaggedBy} · ${b.when}`}>{b.notes}</AINote>

      {b.status === 'open' && (
        <div style={{ marginTop: 16 }}>
          {!resolveOpen ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn variant="primary" icon="check" onClick={() => setResolveOpen(true)}>{b.requiresApproval ? 'Submit for approval' : 'Resolve directly'}</Btn>
              {pastSla && (
                <Btn variant="ghost" icon="hub" onClick={handleEscalate}>Escalate to Insight pipeline</Btn>
              )}
            </div>
          ) : (
            <Card pad={16}>
              <label style={fieldLabel}>{b.requiresApproval ? 'What was done, pending sign-off' : 'Resolution note'}</label>
              <textarea
                className="a-input" autoFocus value={resolveNote} onChange={(e) => setResolveNote(e.target.value)}
                placeholder="What was fixed and how…" rows={3}
                style={{ ...textareaStyle, marginBottom: 10 }}
              />
              {resolveError && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.red, fontWeight: 600, marginBottom: 10 }}>{resolveError}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Btn variant="ghost" size="sm" onClick={() => { setResolveOpen(false); setResolveError(null); }}>Cancel</Btn>
                <Btn variant="primary" size="sm" icon="check" disabled={!resolveNote.trim()} onClick={handleResolve}>{b.requiresApproval ? 'Submit for approval' : 'Resolve directly'}</Btn>
              </div>
            </Card>
          )}
          {escalateError && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.red, fontWeight: 600, marginTop: 8 }}>{escalateError}</div>}
        </div>
      )}

      {b.status === 'pending_approval' && (
        <>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>Submitted for approval</div>
          <Card pad={16} style={{ boxShadow: 'none' }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.55 }}>{b.resolutionNote}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 8 }}>— {b.resolvedBy}</div>
          </Card>
          {!sendBackOpen ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Btn variant="ghost" onClick={() => setSendBackOpen(true)}>Send back</Btn>
              <Btn variant="primary" icon="check" onClick={handleApprove}>Approve</Btn>
            </div>
          ) : (
            <Card pad={16} style={{ marginTop: 12 }}>
              <label style={fieldLabel}>Why does this need more work?</label>
              <textarea
                className="a-input" autoFocus value={sendBackReason} onChange={(e) => setSendBackReason(e.target.value)}
                rows={3} style={{ ...textareaStyle, marginBottom: 10 }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Btn variant="ghost" size="sm" onClick={() => { setSendBackOpen(false); setSendBackReason(''); }}>Cancel</Btn>
                <Btn variant="primary" size="sm" icon="arrow_back" disabled={!sendBackReason.trim()} onClick={handleSendBack}>Send back</Btn>
              </div>
            </Card>
          )}
        </>
      )}

      {b.status === 'resolved' && (
        <>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>Resolution</div>
          <Card pad={16} style={{ boxShadow: 'none' }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.55 }}>{b.resolutionNote}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 8 }}>— {b.resolvedBy}</div>
          </Card>
        </>
      )}

      {b.linkedObservationId && (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft }}>
          <Icon name="hub" size={16} color={colors.inkMuted} />
          Escalated into the Insight pipeline as {b.linkedObservationId} — visible now in Observations.
        </div>
      )}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>Detail</div>
      <Card pad={16}>
        <Fact k="Flagged by" v={b.flaggedBy} />
        <Fact k="Site" v={b.siteName} />
        <Fact k="When" v={b.when} />
        <Fact k="Control type" v={CONTROL_TYPE_LABEL[b.controlType]} />
        <Fact k="Hazard" v={b.hazardName} last />
      </Card>
    </Card>
  );
}
