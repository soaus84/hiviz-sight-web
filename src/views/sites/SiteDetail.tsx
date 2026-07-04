import { useParams, useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PageHead, Btn, Stat, Card, Eyebrow, AINote, Avatar, SChip, Icon, Badge } from '@/components';
import { AttnRow } from '@/views/shared/AttnRow';
import { SITES } from '@/data/sites';
import { INSIGHTS } from '@/data/insights';
import { VISITS } from '@/data/visits';

export function SiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const s = SITES.find((x) => x.id === id) || SITES[0];
  const open = INSIGHTS.filter((i) => i.siteNames.includes(s.name)).slice(0, 3);
  const history = VISITS.filter((v) => v.siteName === s.name);
  const contacts = [
    { name: s.supervisor, role: 'Site supervisor', badge: 'Primary' },
    { name: 'K. Lee', role: 'Crew lead · day shift' },
    { name: 'P. Singh', role: 'HSE lead' },
  ];

  const statCols = breakpoint === 'mobile' ? '1fr' : breakpoint === 'tablet' ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)';
  const bodyCols = breakpoint === 'desktop' ? '1.5fr 1fr' : '1fr';

  return (
    <div>
      <button onClick={() => navigate('/sites')} className="a-link" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: colors.inkSoft, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.6 }}>
        <Icon name="arrow_back" size={16} /> All sites
      </button>
      <PageHead title={s.name} sub={`${s.region} · ${s.type} · ${s.crewSize} crew`} actions={<><Btn variant="ghost" icon="tune">Configure</Btn><Btn variant="accent" icon="add">Plan a visit</Btn></>} />

      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 16, marginBottom: 24 }}>
        <Stat label="Visibility" value={s.visibilityLabel.split(' ')[0]} sub={s.live ? 'On site now' : s.lastVisit} icon="visibility" />
        <Stat label="Observations" value={s.observationsCount} sub="All time" icon="forum" />
        <Stat label="Open insights" value={s.openInsightsCount} sub="Across this site" icon="auto_awesome" />
        <Stat label="Atrophy" value={s.atrophyScore ?? '—'} unit={s.atrophyScore != null ? '/ 100' : undefined} sub={s.atrophyScore != null && s.atrophyScore >= 55 ? 'Climbing — needs a visit' : 'Within range'} icon="trending_up" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: bodyCols, gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {s.risk && (
            <AINote>
              Atrophy is climbing at {s.name} and the last visit was {s.lastVisit.toLowerCase()}. {open.length} open insight{open.length > 1 ? 's' : ''} reference this site — worth pointing your next visit here.
            </AINote>
          )}
          <Card pad={20}>
            <Eyebrow>Open insights · {open.length}</Eyebrow>
            {open.map((i, idx) => (
              <AttnRow key={i.id} icon="auto_awesome" hue={i.status === 'action' ? colors.hiInk : colors.amber} title={i.title} meta={`${i.id} · ${i.observationCount} observations · ${i.updated}`} onClick={() => navigate(`/insights/${i.id}`)} last={idx === open.length - 1} />
            ))}
          </Card>
          <Card pad={20}>
            <Eyebrow>Visit history · {history.length}</Eyebrow>
            {history.map((v, i) => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i === history.length - 1 ? 'none' : `1px solid ${colors.ruleSoft}` }}>
                <Avatar name={v.visitor} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600 }}>{v.visitor}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1, fontWeight: 500 }}>{v.when}</div>
                </div>
                {v.state === 'live' ? <SChip hue={colors.green} icon="circle">Live</SChip> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: colors.inkSoft }}>{v.observationCount} obs</span>}
              </div>
            ))}
          </Card>
        </div>

        <Card pad={20} style={{ alignSelf: 'flex-start' }}>
          <Eyebrow>Site contacts</Eyebrow>
          {contacts.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i === contacts.length - 1 ? 'none' : `1px solid ${colors.ruleSoft}` }}>
              <Avatar name={c.name} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1, fontWeight: 500 }}>{c.role}</div>
              </div>
              {c.badge && <Badge tone="hi">{c.badge}</Badge>}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
