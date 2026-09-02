import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { Card, Eyebrow, Badge, Btn, Icon, ListRow } from '@/components';
import { SiteHeader } from './SiteHeader';
import { SITES } from '@/data/sites';
import { CRITICAL_CONTROLS_BY_ID, HAZARDS_BY_ID, WORKSITE_CONTROLS, acceptControl, modifyControl, markNotRequired, statusLabel } from '@/data/risk';
import { BARRIER_FAILURES } from '@/data/barrierFailures';
import { BARRIER_FAILURE_STATUS_DISPLAY } from '@/views/risk/riskDisplay';

const inputStyle = { padding: '7px 9px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, outline: 'none', flex: 1 };

export function SiteControls() {
  const { id } = useParams();
  const navigate = useNavigate();
  const s = SITES.find((x) => x.id === id) || SITES[0];
  const [, forceRender] = useState(0);
  const [openRow, setOpenRow] = useState<{ id: string; mode: 'modify' | 'reject' } | null>(null);
  const [text, setText] = useState('');

  const controlsAtSite = WORKSITE_CONTROLS.filter((wc) => wc.siteId === s.id);
  const pending = controlsAtSite.filter((wc) => wc.status === 'pending_review');
  const active = controlsAtSite.filter((wc) => wc.status === 'implementing' || wc.status === 'active');
  const openFailures = BARRIER_FAILURES.filter((b) => b.siteId === s.id && b.status !== 'resolved');

  const handleAccept = (wcId: string) => { acceptControl(wcId); forceRender((v) => v + 1); };
  const handleSubmit = () => {
    if (!openRow || !text.trim()) return;
    if (openRow.mode === 'modify') modifyControl(openRow.id, text.trim());
    else markNotRequired(openRow.id, text.trim());
    setOpenRow(null); setText('');
    forceRender((v) => v + 1);
  };

  return (
    <div>
      <SiteHeader s={s} />

      <Card pad={20} style={{ marginBottom: 16 }}>
        <Eyebrow>Pending acceptance · {pending.length}</Eyebrow>
        {pending.length === 0 && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkMuted, fontWeight: 500, padding: '8px 0' }}>No controls awaiting review at this site.</div>
        )}
        {pending.map((wc) => {
          const control = CRITICAL_CONTROLS_BY_ID[wc.criticalControlId];
          const hazard = HAZARDS_BY_ID[control.hazardId];
          const rowOpen = openRow?.id === wc.id;
          return (
            <div key={wc.id} style={{ padding: '12px 0', borderTop: `1px solid ${colors.ruleSoft}` }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{control.name}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>{hazard.name}</div>
              {!rowOpen ? (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Btn variant="primary" size="sm" icon="check" onClick={() => handleAccept(wc.id)}>Accept</Btn>
                  <Btn variant="ghost" size="sm" onClick={() => { setOpenRow({ id: wc.id, mode: 'modify' }); setText(''); }}>Modify (stricter)</Btn>
                  <Btn variant="ghost" size="sm" onClick={() => { setOpenRow({ id: wc.id, mode: 'reject' }); setText(''); }}>Not required</Btn>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input style={inputStyle} autoFocus placeholder={openRow.mode === 'modify' ? 'Stricter local standard…' : 'Reason not required…'} value={text} onChange={(e) => setText(e.target.value)} />
                  <Btn variant="ghost" size="sm" onClick={() => setOpenRow(null)}>Cancel</Btn>
                  <Btn variant="primary" size="sm" icon="check" disabled={!text.trim()} onClick={handleSubmit}>{openRow.mode === 'modify' ? 'Save' : 'Confirm'}</Btn>
                </div>
              )}
            </div>
          );
        })}
      </Card>

      <Card pad={20} style={{ marginBottom: 16 }}>
        <Eyebrow>Active controls · {active.length}</Eyebrow>
        {active.length === 0 && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkMuted, fontWeight: 500, padding: '8px 0' }}>No accepted controls at this site yet.</div>
        )}
        {active.map((wc, i) => {
          const control = CRITICAL_CONTROLS_BY_ID[wc.criticalControlId];
          return (
            <ListRow key={wc.id} last={i === active.length - 1}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600 }}>{control.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{wc.assignedVerifierName ? `${wc.assignedVerifierName} · last verified ${wc.lastVerified ?? '—'}` : 'No verifier assigned'}</div>
              </div>
              <Badge tone={wc.status === 'active' ? 'success' : 'info'}>{statusLabel(wc.status)}</Badge>
            </ListRow>
          );
        })}
      </Card>

      <Card pad={20}>
        <Eyebrow>Outstanding barrier failures · {openFailures.length}</Eyebrow>
        {openFailures.length === 0 && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkMuted, fontWeight: 500, padding: '8px 0' }}>Nothing outstanding at this site.</div>
        )}
        {openFailures.map((b, i) => {
          const status = BARRIER_FAILURE_STATUS_DISPLAY[b.status];
          return (
            <div key={b.id} className="a-card-int" onClick={() => navigate(`/risk/barrier-failures/${b.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderTop: i === 0 ? undefined : `1px solid ${colors.ruleSoft}`, cursor: 'pointer' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600 }}>{b.controlName}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{b.hazardName} · {b.when}</div>
              </div>
              <Badge tone={status.tone}>{status.label}</Badge>
              <Icon name="chevron_right" size={18} color={colors.inkMuted} />
            </div>
          );
        })}
      </Card>
    </div>
  );
}
