import { useState } from 'react';
import { colors } from '@/tokens';
import { Search, Card, ListRow, Icon, Badge, Pills } from '@/components';
import { SITES } from '@/data/sites';
import { inPurview, purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';

export function PlanVisitSite({ siteId, onChange }: { siteId: string | null; onChange: (id: string) => void }) {
  const { region, division } = usePurviewScope();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Scoped to the active purview, but a site preselected via ?site= (e.g.
  // from that site's own page) stays visible even if it's outside the
  // current scope — otherwise the picker would silently hide it.
  const inRegion = SITES.filter((s) => inPurview(s, { region, division }) || s.id === siteId);

  const filtered = inRegion
    .filter((s) => filter === 'all' || (filter === 'risk' && s.risk) || (filter === 'visit' && s.needsVisit))
    .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Pills
          value={filter}
          onChange={setFilter}
          items={[
            { k: 'all', label: 'All', n: inRegion.length },
            { k: 'risk', label: 'At risk', n: inRegion.filter((s) => s.risk).length },
            { k: 'visit', label: 'Needs a visit', n: inRegion.filter((s) => s.needsVisit).length },
          ]}
        />
        <Search placeholder="Search sites" width={220} value={query} onChange={setQuery} />
      </div>
      <Card pad={8}>
        {filtered.map((s, i) => {
          const on = s.id === siteId;
          return (
            <ListRow key={s.id} last={i === filtered.length - 1} onClick={() => onChange(s.id)} padding="12px 10px">
              <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: on ? colors.ink : colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="location_on" size={17} color={on ? '#fff' : colors.inkSoft} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1, fontWeight: 500 }}>{s.region} · {s.division}</div>
              </div>
              {(s.risk || s.needsVisit) && <Badge tone="warning" outline>Needs a visit</Badge>}
              {on && <Icon name="check_circle" size={20} color={colors.ink} fill={1} />}
            </ListRow>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>
            {query ? `No sites match “${query}”.` : inRegion.length === 0 ? `No sites in ${purviewPhrase(region, division)} yet.` : 'No sites match this filter.'}
          </div>
        )}
      </Card>
    </div>
  );
}
