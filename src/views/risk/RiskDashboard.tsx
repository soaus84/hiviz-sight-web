import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Stat, Card, Eyebrow, Meter, Icon, InfoTip } from '@/components';
import { SITES } from '@/data/sites';
import { HAZARDS, CRITICAL_CONTROLS, WORKSITE_CONTROLS, computeWorkTypeRisk, RATING_RANK } from '@/data/risk';
import { BARRIER_FAILURES, barrierFailureInRegion, barrierFailurePath } from '@/data/barrierFailures';
import { HIGH_RISK_WORK } from '@/data/admin/taxonomies';
import { inPurview, purviewLabel, purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { AttnRow } from '@/views/shared/AttnRow';
import { SEVERITY_DISPLAY, LIKELIHOOD_DISPLAY } from './riskDisplay';
import { RiskRatingInfo } from './RiskRatingInfo';

export function RiskDashboard() {
  const navigate = useNavigate();
  const { region, division } = usePurviewScope();
  const purview = { region, division };

  const sites = SITES.filter((s) => inPurview(s, purview));
  const failures = BARRIER_FAILURES.filter((b) => barrierFailureInRegion(b, purview));
  const controlsAtSites = WORKSITE_CONTROLS.filter((wc) => sites.some((s) => s.id === wc.siteId));

  const open = failures.filter((b) => b.status === 'open');
  const inReview = failures.filter((b) => b.status === 'review');
  const sitesWithPending = sites.filter((s) => s.pendingControlsCount > 0);
  const activeControls = controlsAtSites.filter((wc) => wc.status === 'active');
  const workTypesWithHazards = HIGH_RISK_WORK.filter((t) => HAZARDS.some((h) => h.workTypeId === t.id));
  const highestRisk = workTypesWithHazards
    .map((t) => ({ t, risk: computeWorkTypeRisk(t.id, sites) }))
    .filter((x) => x.risk.rating)
    .sort((a, b) => RATING_RANK[b.risk.rating!] - RATING_RANK[a.risk.rating!])
    .slice(0, 5);

  return (
    <div>
      <PageHead
        title="Risk overview"
        sub={`${purviewLabel(region, division)} · ${sites.length} worksite${sites.length === 1 ? '' : 's'}. ${open.length} barrier failure${open.length === 1 ? '' : 's'} waiting on you.`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Stat label="Open barrier failures" value={open.length} icon="gpp_bad" />
        <Stat label="In review" value={inReview.length} icon="fact_check" />
        <Stat label="Sites with pending controls" value={sitesWithPending.length} unit={`of ${sites.length}`} icon="domain" />
        <Stat label="Active controls" value={activeControls.length} icon="verified" />
      </div>

      <Card pad={20} style={{ marginBottom: 16 }}>
        <Eyebrow right={<span onClick={() => navigate('/risk/critical-barrier-failures')} style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: colors.ink, textDecoration: 'underline' }}>View all</span>}>
          Needs your attention
        </Eyebrow>
        {[...open, ...inReview].map((b, i, arr) => {
          const severity = SEVERITY_DISPLAY[b.severityClass];
          return (
            <AttnRow key={b.id} label={severity.label} tone={severity.tone} title={b.controlName} meta={`${b.siteName} · ${b.hazardName}`} onClick={() => navigate(barrierFailurePath(b))} last={i === arr.length - 1} />
          );
        })}
        {open.length === 0 && inReview.length === 0 && (
          <div style={{ padding: '20px 4px', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>Nothing needs attention in {purviewPhrase(region, division)} right now.</div>
        )}
      </Card>

      <Card pad={20} style={{ marginBottom: 16 }}>
        <Eyebrow right={<span onClick={() => navigate('/risk/work-types')} style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: colors.ink, textDecoration: 'underline' }}>All work types</span>}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Highest risk work types
            <InfoTip><RiskRatingInfo /></InfoTip>
          </span>
        </Eyebrow>
        {highestRisk.map(({ t, risk }, i) => (
          <AttnRow
            key={t.id}
            label={SEVERITY_DISPLAY[risk.rating!].label}
            tone={SEVERITY_DISPLAY[risk.rating!].tone}
            title={t.name}
            meta={`${risk.eventCount} event${risk.eventCount === 1 ? '' : 's'} in 90 days · ${LIKELIHOOD_DISPLAY[risk.likelihood].label.toLowerCase()} likelihood`}
            onClick={() => navigate(`/risk/work-types/${t.id}`)}
            last={i === highestRisk.length - 1}
          />
        ))}
        {highestRisk.length === 0 && (
          <div style={{ padding: '20px 4px', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>No hazards defined yet — start from Work Types.</div>
        )}
      </Card>

      <Eyebrow right={<span onClick={() => navigate('/risk/work-types')} style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: colors.ink, textDecoration: 'underline' }}>All work types</span>}>
        Control health by work type
      </Eyebrow>
      <Card pad={20}>
        {workTypesWithHazards.map((t, i) => {
          const hazardIds = new Set(HAZARDS.filter((h) => h.workTypeId === t.id).map((h) => h.id));
          const controlIds = new Set(CRITICAL_CONTROLS.filter((c) => hazardIds.has(c.hazardId)).map((c) => c.id));
          const instances = WORKSITE_CONTROLS.filter((wc) => controlIds.has(wc.criticalControlId) && sites.some((s) => s.id === wc.siteId));
          const activeCount = instances.filter((wc) => wc.status === 'active').length;
          const health = instances.length === 0 ? 0 : Math.round((activeCount / instances.length) * 100);
          return (
            <div
              key={t.id}
              className="a-card-int"
              onClick={() => navigate(`/risk/work-types/${t.id}`)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderTop: i === 0 ? undefined : `1px solid ${colors.ruleSoft}`, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <Icon name={t.icon || 'engineering'} size={16} color={colors.inkSoft} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkSoft, marginTop: 2 }}>{activeCount} of {instances.length} instances active</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <Meter value={health} tone={health >= 80 ? colors.green : health >= 40 ? colors.amber : colors.red} />
                <Icon name="chevron_right" size={16} color={colors.inkMuted} />
              </div>
            </div>
          );
        })}
        {workTypesWithHazards.length === 0 && (
          <div style={{ padding: '20px 4px', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>No hazards defined yet — start from Work Types.</div>
        )}
      </Card>
    </div>
  );
}
