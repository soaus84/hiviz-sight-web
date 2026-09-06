import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Card, Eyebrow, Badge, InfoTip } from '@/components';
import { computeControlEffectiveness, recentControlFailures } from '@/data/risk';
import { CONTROL_EFFECTIVENESS_DISPLAY, BARRIER_FAILURE_STATUS_DISPLAY } from './riskDisplay';

function ControlEffectivenessInfo() {
  return (
    <div>
      <div style={{ fontWeight: 700, color: colors.ink, marginBottom: 6 }}>Effectiveness</div>
      <div>
        How often this control has actually been flagged not-in-place in the last 90 days — only failures are logged, so this reads failure frequency, not a pass rate. <strong>0</strong> = Reliable, <strong>1–2</strong> = Inconsistent, <strong>3+</strong> = Failing. A control only starts being verified once it's active at a site, so one that's still pending review, mid-rollout, or not required has nothing to score yet.
      </div>
    </div>
  );
}

/** Shared between the global control view (ControlDetail, every site the
 * control has reached) and the site-scoped one (SiteControlDetail, this
 * site's own instance only) — same card, `siteId` just narrows the failure
 * set computeControlEffectiveness/recentControlFailures reads. */
export function ControlEffectivenessCard({ criticalControlId, siteId }: { criticalControlId: string; siteId?: string }) {
  const navigate = useNavigate();
  const { failureCount, likelihood } = computeControlEffectiveness(criticalControlId, siteId);
  const failures = likelihood ? recentControlFailures(criticalControlId, siteId) : [];
  const d = likelihood ? CONTROL_EFFECTIVENESS_DISPLAY[likelihood] : null;

  return (
    <Card pad={20} style={{ marginBottom: 16 }}>
      <Eyebrow right={<InfoTip><ControlEffectivenessInfo /></InfoTip>}>Effectiveness</Eyebrow>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {d ? (
          <>
            <Badge tone={d.tone}>{d.label}</Badge>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft }}>
              {failureCount} failure{failureCount === 1 ? '' : 's'} in the last 90 days
            </span>
          </>
        ) : (
          <Badge tone="primary" outline>Not yet verified</Badge>
        )}
      </div>
      {failures.map((f) => {
        const status = BARRIER_FAILURE_STATUS_DISPLAY[f.status];
        return (
          <div
            key={f.id}
            className="a-card-int"
            onClick={() => navigate(`/risk/barrier-failures/${f.id}`)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 0', marginTop: 4, borderTop: `1px solid ${colors.ruleSoft}`, cursor: 'pointer' }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600 }}>{siteId ? f.when : `${f.siteName} · ${f.when}`}</div>
              {f.notes && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>{f.notes}</div>}
            </div>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
        );
      })}
    </Card>
  );
}
