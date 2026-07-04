import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { firstName } from '@/utils/format';
import { PageHead, Stat, Card, Eyebrow, SChip } from '@/components';
import { CURRENT_USER } from '@/data/currentUser';
import { VISITS } from '@/data/visits';
import { INSIGHTS } from '@/data/insights';
import { OBSERVATIONS } from '@/data/observations';
import { AttnRow } from '@/views/shared/AttnRow';
import { LiveVisitCard } from '@/views/shared/LiveVisitCard';
import { ObsTable } from './ObsTable';

export function Dashboard() {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const live = VISITS.find((v) => v.state === 'live');
  const upcoming = VISITS.filter((v) => v.state === 'upcoming').slice(0, 3);
  const review = INSIGHTS.filter((i) => i.status === 'review');
  const recentObs = OBSERVATIONS.slice(0, 5);

  const statCols = breakpoint === 'mobile' ? '1fr' : breakpoint === 'tablet' ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)';
  const bodyCols = breakpoint === 'desktop' ? '1.55fr 1fr' : '1fr';

  return (
    <div>
      <PageHead title={`Good morning, ${firstName(CURRENT_USER.name)}`} sub="Pilbara region · 7 worksites · 1 visit live now. Here’s what needs you today." />

      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 16, marginBottom: 24 }}>
        <Stat label="Visits this week" value="4" sub="1 live · 3 planned" icon="event" />
        <Stat label="Open insights" value="12" sub="4 awaiting your support" icon="auto_awesome" accent />
        <Stat label="Observations · 7d" value="47" delta="+18%" icon="visibility" />
        <Stat label="Sites at risk" value="2" unit="of 7" sub="Coolinga · Jewell" icon="warning" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: bodyCols, gap: 16, marginBottom: 16 }}>
        <Card pad={20}>
          <Eyebrow
            right={
              <button onClick={() => navigate('/insights')} className="a-link" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: colors.inkSoft, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                View all
              </button>
            }
          >
            Needs your attention
          </Eyebrow>
          <AttnRow icon="auto_awesome" hue={colors.hiInk} title="Hiviz routed a heat-plan pattern to your pipeline" meta="4 observations · 3 sites · 18m ago" onClick={() => navigate('/insights')} />
          {review.map((i) => (
            <AttnRow key={i.id} icon="flag" hue={colors.amber} title={i.title} meta={`${i.observationCount} observations · ${i.siteNames.length} site${i.siteNames.length > 1 ? 's' : ''} · ${i.updated}`} onClick={() => navigate(`/insights/${i.id}`)} />
          ))}
          <AttnRow icon="warning" hue={colors.red} title="IM-118 corrective action overdue at Northgate" meta="Unassigned at site level · 3 weeks" onClick={() => navigate('/sites/s1')} last />
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {live && <LiveVisitCard v={live} />}
          <Card pad={18}>
            <Eyebrow>Upcoming visits</Eyebrow>
            {upcoming.map((v, i) => (
              <div key={v.id} className="a-row" onClick={() => navigate('/visits')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i === upcoming.length - 1 ? 'none' : `1px solid ${colors.ruleSoft}`, cursor: 'pointer' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600 }}>{v.siteName}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2, fontWeight: 500 }}>{v.when}</div>
                </div>
                {v.briefing === 'ready' ? <SChip hue={colors.green}>Briefed</SChip> : <SChip hue={colors.amber}>Pending</SChip>}
              </div>
            ))}
          </Card>
        </div>
      </div>

      <Eyebrow
        right={
          <button onClick={() => navigate('/observations')} className="a-link" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: colors.inkSoft, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            All observations
          </button>
        }
      >
        Latest field observations
      </Eyebrow>
      <ObsTable rows={recentObs} />
    </div>
  );
}
