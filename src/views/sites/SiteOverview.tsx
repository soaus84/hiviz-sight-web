import { useParams, useNavigate } from 'react-router-dom';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Stat, Card, Eyebrow, AINote, Avatar, Badge, ListRow, LinkBtn } from '@/components';
import { colors } from '@/tokens';
import { AttnRow } from '@/views/shared/AttnRow';
import { SiteHeader } from './SiteHeader';
import { SITES } from '@/data/sites';
import { INSIGHTS, INSIGHT_KIND_LABEL } from '@/data/insights';
import { VISITS } from '@/data/visits';

export function SiteOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const s = SITES.find((x) => x.id === id) || SITES[0];
  const open = INSIGHTS.filter((i) => i.siteNames.includes(s.name)).slice(0, 3);
  const history = VISITS.filter((v) => v.siteName === s.name).slice(0, 3);

  const statCols = breakpoint === 'mobile' ? '1fr' : 'repeat(3, 1fr)';

  return (
    <div>
      <SiteHeader s={s} />

      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 16, marginBottom: 24 }}>
        <Stat label="Visibility" value={s.visibilityLabel.split(' ')[0]} sub={s.live ? 'On site now' : s.lastVisit} icon="visibility" />
        <Stat label="Observations" value={s.observationsCount} sub="All time" icon="forum" />
        <Stat label="Open insights" value={s.openInsightsCount} sub="Across this site" icon="lightbulb" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {s.risk && (
          <AINote>
            Atrophy is climbing at {s.name} and the last visit was {s.lastVisit.toLowerCase()}. {open.length} open insight{open.length > 1 ? 's' : ''} reference this site — worth pointing your next visit here.
          </AINote>
        )}
        <Card pad={20}>
          <Eyebrow right={<LinkBtn onClick={() => navigate(`/sites/${s.id}/insights`)}>View all</LinkBtn>}>
            Open insights · {s.openInsightsCount}
          </Eyebrow>
          {open.length === 0 && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkMuted, fontWeight: 500, padding: '8px 0' }}>No open insights reference this site.</div>
          )}
          {open.map((i, idx) => {
            const [label, tone] = INSIGHT_KIND_LABEL[i.kind];
            return (
              <AttnRow key={i.id} label={label} tone={tone} title={i.title} meta={`${i.id} · ${i.observationCount} observation${i.observationCount > 1 ? 's' : ''} · ${i.updated}`} onClick={() => navigate(`/insights/${i.id}`)} last={idx === open.length - 1} />
            );
          })}
        </Card>
        <Card pad={20}>
          <Eyebrow right={<LinkBtn onClick={() => navigate(`/sites/${s.id}/visits`)}>View all</LinkBtn>}>
            Visit history
          </Eyebrow>
          {history.length === 0 && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkMuted, fontWeight: 500, padding: '8px 0' }}>No visits recorded yet.</div>
          )}
          {history.map((v, i) => (
            <ListRow key={v.id} last={i === history.length - 1} onClick={() => navigate(`/visits/${v.id}`)}>
              <Avatar name={v.visitor} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600 }}>{v.visitor}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1, fontWeight: 500 }}>{v.when}</div>
              </div>
              {v.state === 'live' ? <Badge tone="success" outline icon="circle">Live</Badge> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: colors.inkSoft }}>{v.observationCount} obs</span>}
            </ListRow>
          ))}
        </Card>
      </div>
    </div>
  );
}
