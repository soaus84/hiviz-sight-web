import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Card, Eyebrow, Badge, Btn, LinkBtn, ListRow } from '@/components';
import { CRITICAL_CONTROLS, HAZARDS_BY_ID, WORKSITE_CONTROLS, pushControlToSites, statusLabel } from '@/data/risk';
import { SITES } from '@/data/sites';
import { HIGH_RISK_WORK } from '@/data/admin/taxonomies';
import { CONTROL_TYPE_LABEL, FREQUENCY_LABEL, WORKSITE_CONTROL_STATUS_DISPLAY } from './riskDisplay';
import { ControlEffectivenessCard } from './ControlEffectiveness';

/** The full picture for one CriticalControl: how it's actually holding up
 * (ControlEffectivenessCard, unscoped — every site it's reached) and how
 * far its rollout has reached (every site doing the hazard's work type,
 * whether pushed here or not). SiteControlDetail is the same effectiveness
 * card scoped to one site, minus this rollout table — that table is the
 * one thing that's only meaningful from the register-owner's seat. */
export function ControlDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [, forceRender] = useState(0);
  const control = CRITICAL_CONTROLS.find((c) => c.id === id) ?? CRITICAL_CONTROLS[0];
  const hazard = HAZARDS_BY_ID[control.hazardId];
  const workType = HIGH_RISK_WORK.find((t) => t.id === hazard?.workTypeId);

  const targetSites = SITES.filter((s) => hazard && s.workTypeIds.includes(hazard.workTypeId));
  const instanceBySite = new Map(WORKSITE_CONTROLS.filter((wc) => wc.criticalControlId === control.id).map((wc) => [wc.siteId, wc]));
  const untargeted = targetSites.filter((s) => !instanceBySite.has(s.id)).length;

  const handlePush = () => { pushControlToSites(control.id); forceRender((v) => v + 1); };

  return (
    <div>
      <LinkBtn icon="arrow_back" size="md" onClick={() => navigate(`/risk/register/${hazard?.id}`)} style={{ marginBottom: 16 }}>{hazard?.name ?? 'Back'}</LinkBtn>
      <PageHead
        title={control.name}
        sub={control.verificationPrompt}
        actions={untargeted > 0 ? <Btn variant="accent" icon="send" onClick={handlePush}>Push to {untargeted} more site{untargeted > 1 ? 's' : ''}</Btn> : undefined}
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {workType && <Badge tone="primary" outline icon="engineering">{workType.name}</Badge>}
        <Badge tone="primary" outline>{CONTROL_TYPE_LABEL[control.controlType]}</Badge>
        <Badge tone="primary" outline icon="schedule">{FREQUENCY_LABEL[control.verificationFrequency]}</Badge>
        <Badge tone="primary" outline icon="timer">{control.rectificationSlaHours}h SLA</Badge>
      </div>

      <ControlEffectivenessCard criticalControlId={control.id} />

      <Eyebrow>Rollout · {instanceBySite.size} of {targetSites.length} sites</Eyebrow>
      <Card pad={20}>
        {targetSites.map((s, i) => {
          const wc = instanceBySite.get(s.id);
          return (
            <ListRow key={s.id} last={i === targetSites.length - 1} onClick={() => navigate(`/sites/${s.id}/controls/${control.id}`)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>
                  {wc ? (wc.assignedVerifierName ? `${wc.assignedVerifierName} · last verified ${wc.lastVerified ?? '—'}` : 'No verifier assigned') : 'Not pushed to this site'}
                </div>
              </div>
              {wc ? <Badge tone={WORKSITE_CONTROL_STATUS_DISPLAY[wc.status].tone}>{statusLabel(wc.status)}</Badge> : <Badge tone="primary" outline>Not pushed</Badge>}
            </ListRow>
          );
        })}
        {targetSites.length === 0 && <div style={{ padding: '20px 4px', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>No sites currently doing this work.</div>}
      </Card>
    </div>
  );
}
