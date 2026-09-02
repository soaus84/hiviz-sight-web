import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Pills, Search, DataTable, Badge, Icon, type Column } from '@/components';
import { SITES } from '@/data/sites';
import { inPurview, purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import type { Site } from '@/types';

export function IncidentSites() {
  const navigate = useNavigate();
  const { region, division } = usePurviewScope();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const inRegion = useMemo(() => SITES.filter((s) => inPurview(s, { region, division })), [region, division]);

  const filtered = useMemo(() => {
    return inRegion
      .filter((s) => filter === 'all' || (filter === 'severe' && s.severeIncidentsCount > 0) || (filter === 'open' && s.openIncidentsCount > 0))
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
    { key: 'openIncidentsCount', label: 'Open incidents', w: 140, align: 'left', mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{r.openIncidentsCount}</span> },
    { key: 'severeIncidentsCount', label: 'Severe', w: 110, render: (r) => r.severeIncidentsCount > 0 ? <Badge tone="warning">{r.severeIncidentsCount} pending review</Badge> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: colors.inkMuted }}>None</span> },
    { key: 'lastIncident', label: 'Last incident', w: 150, mono: true, render: (r) => <span style={{ color: (r.lastIncidentDays ?? 0) > 20 ? colors.red : colors.inkSoft }}>{r.lastIncident ?? '—'}</span> },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  return (
    <div>
      <PageHead
        title="Sites"
        sub={`Every worksite in ${purviewPhrase(region, division)}, with its current incident load and review queue.`}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <Pills
          value={filter}
          onChange={setFilter}
          items={[
            { k: 'all', label: 'All', n: inRegion.length },
            { k: 'severe', label: 'Has severe', n: inRegion.filter((s) => s.severeIncidentsCount > 0).length },
            { k: 'open', label: 'Needs review', n: inRegion.filter((s) => s.openIncidentsCount > 0).length },
          ]}
        />
        <Search placeholder="Search sites" width={260} value={query} onChange={setQuery} />
      </div>
      <DataTable columns={cols} rows={filtered} rowKey="id" onRow={(r) => navigate(`/sites/${r.id}`)} empty={inRegion.length === 0 ? `No sites in ${purviewPhrase(region, division)} yet.` : 'No sites match these filters.'} />
    </div>
  );
}
