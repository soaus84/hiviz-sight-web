import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { Card, Eyebrow, Badge, Icon, ListRow } from '@/components';
import { SiteHeader } from './SiteHeader';
import { SITES } from '@/data/sites';
import { CRITICAL_CONTROLS_BY_ID, HAZARDS_BY_ID, WORKSITE_CONTROLS } from '@/data/risk';
import { BARRIER_FAILURES } from '@/data/barrierFailures';

/** Grouped by where a control actually sits in its own lifecycle, not by
 * "pending vs everything else" — pending acceptance and not-yet-active are
 * both this site's own action items (see implementingControlsCount's note
 * in data/risk.ts), active is steady state, not required is inert. A
 * BarrierFailure always belongs to exactly one WorksiteControl instance
 * (its worksiteControlId), so it's surfaced as a badge on that control's
 * own row here rather than as a separate, disconnected list — accept/
 * modify/reject/activate all live on SiteControlDetail, the same place a
 * failure's full history lives; every row below just links through. */
export function SiteControls() {
  const { id } = useParams();
  const navigate = useNavigate();
  const s = SITES.find((x) => x.id === id) || SITES[0];

  const controlsAtSite = WORKSITE_CONTROLS.filter((wc) => wc.siteId === s.id);
  const pending = controlsAtSite.filter((wc) => wc.status === 'pending_review');
  const implementing = controlsAtSite.filter((wc) => wc.status === 'implementing');
  const active = controlsAtSite.filter((wc) => wc.status === 'active' || wc.status === 'active_defeating' || wc.status === 'active_degraded');
  const notRequired = controlsAtSite.filter((wc) => wc.status === 'not_required');

  const openFailureCount = (worksiteControlId: string) => BARRIER_FAILURES.filter((b) => b.worksiteControlId === worksiteControlId && b.status !== 'resolved').length;

  return (
    <div>
      <SiteHeader s={s} />

      <Card pad={20} style={{ marginBottom: 16 }}>
        <Eyebrow>Pending acceptance · {pending.length}</Eyebrow>
        {pending.length === 0 && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkMuted, fontWeight: 500, padding: '8px 0' }}>No controls awaiting review at this site.</div>
        )}
        {pending.map((wc, i) => {
          const control = CRITICAL_CONTROLS_BY_ID[wc.criticalControlId];
          const hazard = HAZARDS_BY_ID[control.hazardId];
          return (
            <ListRow key={wc.id} last={i === pending.length - 1} onClick={() => navigate(`/sites/${s.id}/controls/${control.id}`)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{control.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>{hazard.name}</div>
              </div>
              <Icon name="chevron_right" size={18} color={colors.inkMuted} />
            </ListRow>
          );
        })}
      </Card>

      <Card pad={20} style={{ marginBottom: 16 }}>
        <Eyebrow>Pending verification · {implementing.length}</Eyebrow>
        {implementing.length === 0 && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkMuted, fontWeight: 500, padding: '8px 0' }}>Nothing accepted and waiting on a verifier.</div>
        )}
        {implementing.map((wc, i) => {
          const control = CRITICAL_CONTROLS_BY_ID[wc.criticalControlId];
          return (
            <ListRow key={wc.id} last={i === implementing.length - 1} onClick={() => navigate(`/sites/${s.id}/controls/${control.id}`)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{control.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>Accepted — needs a verifier assigned</div>
              </div>
              <Icon name="chevron_right" size={18} color={colors.inkMuted} />
            </ListRow>
          );
        })}
      </Card>

      <Card pad={20} style={{ marginBottom: notRequired.length ? 16 : 0 }}>
        <Eyebrow>Active · {active.length}</Eyebrow>
        {active.length === 0 && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkMuted, fontWeight: 500, padding: '8px 0' }}>No controls fully active at this site yet.</div>
        )}
        {active.map((wc, i) => {
          const control = CRITICAL_CONTROLS_BY_ID[wc.criticalControlId];
          const failures = openFailureCount(wc.id);
          return (
            <ListRow key={wc.id} last={i === active.length - 1} onClick={() => navigate(`/sites/${s.id}/controls/${control.id}`)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600 }}>{control.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{wc.assignedVerifierName} · last verified {wc.lastVerified ?? '—'}</div>
              </div>
              {failures > 0 && <Badge tone="error" icon="gpp_bad">{failures} open failure{failures > 1 ? 's' : ''}</Badge>}
              <Icon name="chevron_right" size={18} color={colors.inkMuted} />
            </ListRow>
          );
        })}
      </Card>

      {notRequired.length > 0 && (
        <Card pad={20}>
          <Eyebrow>Not required · {notRequired.length}</Eyebrow>
          {notRequired.map((wc, i) => {
            const control = CRITICAL_CONTROLS_BY_ID[wc.criticalControlId];
            return (
              <ListRow key={wc.id} last={i === notRequired.length - 1} onClick={() => navigate(`/sites/${s.id}/controls/${control.id}`)} padding="8px 0">
                <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: colors.inkSoft }}>{control.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkMuted, maxWidth: 260, textAlign: 'right' }}>{wc.rejectionReason}</div>
              </ListRow>
            );
          })}
        </Card>
      )}
    </div>
  );
}
