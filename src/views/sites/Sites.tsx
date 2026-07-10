import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { colors, type Tone } from '@/tokens';
import { PageHead, IconBtn, Pills, Search, DataTable, Badge, Icon, type Column } from '@/components';
import { SITES } from '@/data/sites';
import { inPurview, purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { SitesMap } from './SitesMap';
import type { Site, Visibility } from '@/types';

const VIZ_TONE: Record<Visibility, Tone> = { high: 'success', moderate: 'warning', low: 'error' };
const VIZ_LABEL: Record<Visibility, string> = { high: 'High', moderate: 'Moderate', low: 'Low' };

export function Sites() {
  const navigate = useNavigate();
  const { region, division } = usePurviewScope();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'map' ? 'map' : 'list';
  const setView = (v: 'list' | 'map') => {
    const next = new URLSearchParams(params);
    if (v === 'list') next.delete('view'); else next.set('view', v);
    setParams(next);
  };

  const inRegion = useMemo(() => SITES.filter((s) => inPurview(s, { region, division })), [region, division]);

  const filtered = useMemo(() => {
    return inRegion.filter((s) => filter === 'all' || (filter === 'risk' && s.risk) || (filter === 'visit' && s.needsVisit) || (filter === 'live' && s.live))
      .filter((s) => !query || s.name.toLowerCase().includes(query.toLowerCase()));
  }, [inRegion, filter, query]);

  const cols: Column<Site>[] = [
    { key: 'name', label: 'Site', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="location_on" size={17} color={colors.inkSoft} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{r.region} · {r.division} · {r.type}</div>
        </div>
      </div>
    ) },
    { key: 'visibility', label: 'Visibility', w: 150, render: (r) => <Badge tone={VIZ_TONE[r.visibility]}>{VIZ_LABEL[r.visibility]}</Badge> },
    { key: 'lastVisit', label: 'Last visit', w: 150, mono: true, render: (r) => <span style={{ color: r.lastVisitDays > 20 ? colors.red : colors.inkSoft }}>{r.lastVisit}</span> },
    { key: 'openInsightsCount', label: 'Open insights', w: 120, align: 'left', mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{r.openInsightsCount}</span> },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  return (
    <div>
      <PageHead
        title="Sites"
        sub={`Every worksite in ${purviewPhrase(region, division)}, with its current visibility and open work.`}
        actions={<>
          <IconBtn name="view_list" active={view === 'list'} onClick={() => setView('list')} />
          <IconBtn name="map" active={view === 'map'} onClick={() => setView('map')} />
        </>}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <Pills
          value={filter}
          onChange={setFilter}
          items={[
            { k: 'all', label: 'All', n: inRegion.length },
            { k: 'live', label: 'On site now', n: inRegion.filter((s) => s.live).length },
            { k: 'risk', label: 'At risk', n: inRegion.filter((s) => s.risk).length },
            { k: 'visit', label: 'Needs a visit', n: inRegion.filter((s) => s.needsVisit).length },
          ]}
        />
        <Search placeholder="Search sites" width={260} value={query} onChange={setQuery} />
      </div>
      {view === 'map' && <SitesMap sites={filtered} onSelect={(id) => navigate(`/sites/${id}`)} />}
      {view === 'list' && <DataTable columns={cols} rows={filtered} rowKey="id" onRow={(r) => navigate(`/sites/${r.id}`)} empty={inRegion.length === 0 ? `No sites in ${purviewPhrase(region, division)} yet.` : 'No sites match these filters.'} />}
    </div>
  );
}
