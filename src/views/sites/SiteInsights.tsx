import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { Card, Eyebrow, Pills } from '@/components';
import { AttnRow } from '@/views/shared/AttnRow';
import { SiteHeader } from './SiteHeader';
import { SITES } from '@/data/sites';
import { INSIGHTS, INSIGHT_KIND_LABEL } from '@/data/insights';

export function SiteInsights() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const s = SITES.find((x) => x.id === id) || SITES[0];
  const referencing = INSIGHTS.filter((i) => i.siteNames.includes(s.name));

  const assigned = params.get('assigned') === 'unassigned' ? 'unassigned' : 'all';
  const setAssigned = (k: string) => {
    const next = new URLSearchParams(params);
    if (k === 'all') next.delete('assigned'); else next.set('assigned', k);
    setParams(next, { replace: true });
  };
  const unassignedCount = referencing.filter((i) => !i.owner).length;
  const open = assigned === 'all' ? referencing : referencing.filter((i) => !i.owner);

  return (
    <div>
      <SiteHeader s={s} />
      <div style={{ marginBottom: 16 }}>
        <Pills value={assigned} onChange={setAssigned} items={[{ k: 'all', label: 'All' }, { k: 'unassigned', label: 'Unassigned', n: unassignedCount }]} />
      </div>
      <Card pad={20}>
        <Eyebrow>Insights referencing this site · {open.length}</Eyebrow>
        {open.length === 0 && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkMuted, fontWeight: 500, padding: '8px 0' }}>No insights match.</div>
        )}
        {open.map((i, idx) => {
          const [label, tone] = INSIGHT_KIND_LABEL[i.kind];
          return (
            <AttnRow key={i.id} label={label} tone={tone} title={i.title} meta={`${i.id} · ${i.observationCount} observation${i.observationCount > 1 ? 's' : ''} · ${i.updated}`} onClick={() => navigate(`/insights/${i.id}`)} last={idx === open.length - 1} />
          );
        })}
      </Card>
    </div>
  );
}
