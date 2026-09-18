import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Card, Badge, Btn, LinkBtn } from '@/components';
import { SiteHeader } from './SiteHeader';
import { SITES } from '@/data/sites';
import { CRITICAL_CONTROLS_BY_ID, HAZARDS_BY_ID, WORKSITE_CONTROLS, acceptControl, modifyControl, markNotRequired, activateControl, statusLabel } from '@/data/risk';
import { FREQUENCY_LABEL, WORKSITE_CONTROL_STATUS_DISPLAY } from '@/views/risk/riskDisplay';
import { ControlEffectivenessCard } from '@/views/risk/ControlEffectiveness';
import { Section } from '@/views/shared/SectionHeading';

const inputStyle = { padding: '7px 9px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, outline: 'none', flex: 1 };

/** The same control view as ControlDetail — same header, same
 * ControlEffectivenessCard — but scoped to this one site's own instance
 * (siteId passed through) and minus the cross-site rollout table, which
 * only makes sense from the register owner's seat. In exchange this page
 * carries the actions ControlDetail doesn't: accepting/modifying/rejecting
 * a pending push, and assigning a verifier to move implementing -> active. */
export function SiteControlDetail() {
  const { id, controlId } = useParams();
  const navigate = useNavigate();
  const s = SITES.find((x) => x.id === id) || SITES[0];
  const control = CRITICAL_CONTROLS_BY_ID[controlId ?? ''];
  const hazard = control ? HAZARDS_BY_ID[control.hazardId] : undefined;

  const [, forceRender] = useState(0);
  const [openRow, setOpenRow] = useState<'modify' | 'reject' | null>(null);
  const [text, setText] = useState('');
  const [verifierName, setVerifierName] = useState('');

  if (!control) return null;
  const wc = WORKSITE_CONTROLS.find((w) => w.siteId === s.id && w.criticalControlId === control.id);

  const handleAccept = () => { if (wc) { acceptControl(wc.id); forceRender((v) => v + 1); } };
  const handleActivate = () => {
    if (!wc || !verifierName.trim()) return;
    activateControl(wc.id, verifierName.trim());
    setVerifierName('');
    forceRender((v) => v + 1);
  };
  const handleSubmit = () => {
    if (!wc || !openRow || !text.trim()) return;
    if (openRow === 'modify') modifyControl(wc.id, text.trim());
    else markNotRequired(wc.id, text.trim());
    setOpenRow(null); setText('');
    forceRender((v) => v + 1);
  };

  return (
    <div>
      <SiteHeader s={s} />
      <LinkBtn icon="arrow_back" size="md" onClick={() => navigate(`/sites/${s.id}/controls`)} style={{ marginBottom: 16 }}>All controls</LinkBtn>
      <PageHead title={control.name} sub={control.verificationPrompt} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {hazard && <Badge tone="primary" outline>{hazard.name}</Badge>}
        <Badge tone="primary" outline icon="schedule">{FREQUENCY_LABEL[control.verificationFrequency]}</Badge>
        <Badge tone="primary" outline icon="timer">{control.rectificationSlaHours}h SLA</Badge>
        {wc && <Badge tone={WORKSITE_CONTROL_STATUS_DISPLAY[wc.status].tone}>{statusLabel(wc.status)}</Badge>}
      </div>

      {!wc && (
        <Card pad={20} style={{ marginBottom: 16, textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>
          Not pushed to {s.name} yet.
        </Card>
      )}

      {wc?.status === 'pending_review' && (
        <Section title="Awaiting your response" subtitle="This control was just pushed here — accept it, tighten it, or mark it not required.">
          {!openRow ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="primary" size="sm" icon="check" onClick={handleAccept}>Accept</Btn>
              <Btn variant="ghost" size="sm" onClick={() => { setOpenRow('modify'); setText(''); }}>Modify (stricter)</Btn>
              <Btn variant="ghost" size="sm" onClick={() => { setOpenRow('reject'); setText(''); }}>Not required</Btn>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={inputStyle} autoFocus placeholder={openRow === 'modify' ? 'Stricter local standard…' : 'Reason not required…'} value={text} onChange={(e) => setText(e.target.value)} />
              <Btn variant="ghost" size="sm" onClick={() => setOpenRow(null)}>Cancel</Btn>
              <Btn variant="primary" size="sm" icon="check" disabled={!text.trim()} onClick={handleSubmit}>{openRow === 'modify' ? 'Save' : 'Confirm'}</Btn>
            </div>
          )}
        </Section>
      )}

      {wc?.status === 'implementing' && (
        <Section title="Assign a verifier to go active" subtitle="Name who will verify this control before it goes live.">
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={inputStyle} placeholder="Verifier name…" value={verifierName} onChange={(e) => setVerifierName(e.target.value)} />
            <Btn variant="primary" size="sm" icon="check" disabled={!verifierName.trim()} onClick={handleActivate}>Activate</Btn>
          </div>
        </Section>
      )}

      <ControlEffectivenessCard criticalControlId={control.id} siteId={s.id} />
    </div>
  );
}
