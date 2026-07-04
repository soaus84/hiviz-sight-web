import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { atrophyTone } from '@/utils/atrophy';
import { PageHead, Btn, Pills, Search, DataTable, SChip, Dot, Icon, Meter, type Column } from '@/components';
import { SITES } from '@/data/sites';
import type { Site, Visibility } from '@/types';

const VIZ_TONE: Record<Visibility, string> = { high: colors.green, moderate: colors.amber, low: colors.red };

export function Sites() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return SITES.filter((s) => filter === 'all' || (filter === 'risk' && s.risk) || (filter === 'visit' && s.needsVisit) || (filter === 'live' && s.live))
      .filter((s) => !query || s.name.toLowerCase().includes(query.toLowerCase()));
  }, [filter, query]);

  const cols: Column<Site>[] = [
    { key: 'name', label: 'Site', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        {r.live && <Dot tone={colors.green} size={8} pulse />}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{r.region} · {r.type}</div>
        </div>
      </div>
    ) },
    { key: 'visibility', label: 'Visibility', w: 150, render: (r) => <SChip hue={VIZ_TONE[r.visibility]}>{r.visibilityLabel}</SChip> },
    { key: 'lastVisit', label: 'Last visit', w: 120, mono: true, render: (r) => <span style={{ color: r.lastVisitDays > 20 ? colors.red : colors.inkSoft }}>{r.lastVisit}</span> },
    { key: 'openInsightsCount', label: 'Open insights', w: 120, align: 'left', mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{r.openInsightsCount}</span> },
    { key: 'atrophyScore', label: 'Atrophy', w: 150, render: (r) => r.atrophyScore != null ? <Meter value={r.atrophyScore} tone={atrophyTone(r.atrophyScore)} /> : <span style={{ color: colors.inkMuted }}>—</span> },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  return (
    <div>
      <PageHead title="Sites" sub="Every worksite in the region, with its current visibility and open work." actions={<Btn variant="ghost" icon="map">Map view</Btn>} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <Pills
          value={filter}
          onChange={setFilter}
          items={[
            { k: 'all', label: 'All', n: SITES.length },
            { k: 'live', label: 'On site now', n: SITES.filter((s) => s.live).length },
            { k: 'risk', label: 'At risk', n: SITES.filter((s) => s.risk).length },
            { k: 'visit', label: 'Needs a visit', n: SITES.filter((s) => s.needsVisit).length },
          ]}
        />
        <Search placeholder="Search sites" width={240} value={query} onChange={setQuery} />
      </div>
      <DataTable columns={cols} rows={filtered} rowKey="id" onRow={(r) => navigate(`/sites/${r.id}`)} empty="No sites match these filters." />
    </div>
  );
}
