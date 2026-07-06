import { useNavigate, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { firstName } from '@/utils/format';
import { PageHead, Stat, Card, Eyebrow, Badge, LinkBtn, ListRow, Drawer } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';
import { SITES, SITES_BY_ID } from '@/data/sites';
import { VISITS } from '@/data/visits';
import { INSIGHTS, INSIGHT_KIND_LABEL, insightInRegion } from '@/data/insights';
import { OBSERVATIONS } from '@/data/observations';
import { inPurview, purviewLabel, purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { AttnRow } from '@/views/shared/AttnRow';
import { LiveVisitCard } from '@/views/shared/LiveVisitCard';
import { ObsDetail } from '@/views/observations/ObsDetail';
import { ObsTable } from './ObsTable';

// Fixed narrative "now" for this mock dataset (matches the dates already
// baked into visits/observations) rather than the real wall-clock date, so
// the "last 7 days" stat doesn't silently drift as real time passes.
const MOCK_NOW = new Date('2025-05-07T10:00:00');

export function Dashboard() {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const [params, setParams] = useSearchParams();
  const { user } = useActiveUser();
  const { region, division } = usePurviewScope();
  const purview = { region, division };

  const sites = SITES.filter((s) => inPurview(s, purview));
  const visits = VISITS.filter((v) => inPurview(v, purview));
  const insights = INSIGHTS.filter((i) => insightInRegion(i, purview));
  const obs = OBSERVATIONS.filter((o) => sites.some((s) => s.id === o.siteId));

  const live = visits.find((v) => v.state === 'live');
  const upcoming = visits.filter((v) => v.state === 'upcoming').slice(0, 3);
  const review = insights.filter((i) => i.status === 'review');
  const recentObs = obs.slice(0, 5);
  const sitesAtRisk = sites.filter((s) => s.risk);
  const obsLast7d = obs.filter((o) => MOCK_NOW.getTime() - new Date(o.occurredAt).getTime() <= 7 * 24 * 60 * 60 * 1000);

  // A mock placeholder for a not-yet-built corrective-actions feature — only
  // shows when the site it references is actually within the current purview.
  const northgateInPurview = inPurview(SITES_BY_ID['s1'], purview);

  const selObsId = params.get('obs');
  const selObs = OBSERVATIONS.find((o) => o.id === selObsId) || null;
  const openObs = (obsId: string) => {
    const next = new URLSearchParams(params);
    next.set('obs', obsId);
    setParams(next);
  };
  const closeObs = () => {
    const next = new URLSearchParams(params);
    next.delete('obs');
    setParams(next);
  };

  const statCols = breakpoint === 'mobile' ? '1fr' : breakpoint === 'tablet' ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)';
  const bodyCols = breakpoint === 'desktop' ? '1.55fr 1fr' : '1fr';

  return (
    <div>
      <PageHead
        title={`Good morning, ${firstName(user.name)}`}
        sub={`${purviewLabel(region, division)} · ${sites.length} worksite${sites.length === 1 ? '' : 's'}${live ? ' · 1 visit live now' : ''}. Here’s what needs you today.`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 16, marginBottom: 24 }}>
        <Stat label="Visits" value={visits.filter((v) => v.state === 'live' || v.state === 'upcoming').length} sub={`${live ? 1 : 0} live · ${visits.filter((v) => v.state === 'upcoming').length} planned`} icon="event" />
        <Stat label="Open insights" value={insights.filter((i) => i.status !== 'closed').length} sub={`${insights.filter((i) => i.status === 'review' && !i.owner).length} awaiting your support`} icon="lightbulb" />
        <Stat label="Observations · 7d" value={obsLast7d.length} icon="visibility" />
        <Stat label="Sites at risk" value={sitesAtRisk.length} unit={`of ${sites.length}`} sub={sitesAtRisk.length ? sitesAtRisk.map((s) => s.name).join(' · ') : 'None'} icon="warning" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: bodyCols, gap: 16, marginBottom: 16 }}>
        <Card pad={20}>
          <Eyebrow right={<LinkBtn onClick={() => navigate('/insights')}>View all</LinkBtn>}>
            Needs your attention
          </Eyebrow>
          {review.map((i) => {
            const [label, tone] = INSIGHT_KIND_LABEL[i.kind];
            return (
              <AttnRow key={i.id} label={label} tone={tone} title={i.title} meta={`${i.observationCount} observation${i.observationCount > 1 ? 's' : ''} · ${i.siteNames.length} site${i.siteNames.length > 1 ? 's' : ''} · ${i.updated}`} onClick={() => navigate(`/insights/${i.id}`)} />
            );
          })}
          {northgateInPurview && (
            <AttnRow label="Overdue action" tone="error" title="IM-118 corrective action overdue at Northgate" meta="Unassigned at site level · 3 weeks" onClick={() => navigate('/sites/s1')} last={review.length === 0} />
          )}
          {review.length === 0 && !northgateInPurview && (
            <div style={{ padding: '20px 4px', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>Nothing needs your attention in {purviewPhrase(region, division)} right now.</div>
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {live && <LiveVisitCard v={live} />}
          <Card pad={18}>
            <Eyebrow>Upcoming visits</Eyebrow>
            {upcoming.map((v, i) => (
              <ListRow key={v.id} last={i === upcoming.length - 1} onClick={() => navigate('/visits')}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600 }}>{v.siteName}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2, fontWeight: 500 }}>{v.when}</div>
                </div>
                {v.briefing === 'ready' ? <Badge tone="success">Briefed</Badge> : <Badge tone="warning">Pending</Badge>}
              </ListRow>
            ))}
            {upcoming.length === 0 && (
              <div style={{ padding: '16px 4px', textAlign: 'center', color: colors.inkMuted, fontSize: 13, fontWeight: 500 }}>No upcoming visits in {purviewPhrase(region, division)}.</div>
            )}
          </Card>
        </div>
      </div>

      <Eyebrow right={<LinkBtn onClick={() => navigate('/observations')}>All observations</LinkBtn>}>
        Latest field observations
      </Eyebrow>
      <ObsTable rows={recentObs} onOpen={openObs} empty={`No observations captured in ${purviewPhrase(region, division)} yet.`} />

      <Drawer open={!!selObs} onClose={closeObs}>
        {selObs && <ObsDetail o={selObs} onClose={closeObs} />}
      </Drawer>
    </div>
  );
}
