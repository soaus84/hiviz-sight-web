import { useState } from 'react';
import { colors } from '@/tokens';
import { PageHead, Btn, Search, DataTable, Avatar, Badge, Icon, Drawer, type Column } from '@/components';
import { monthRange, memberStats, lastVisitRecency, membersInPurview } from '@/data/leaders';
import { purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { MemberDetail } from './MemberDetail';
import type { User } from '@/types';

const monthNavBtn = { width: 32, height: 32, borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, background: colors.panel, display: 'flex', alignItems: 'center', justifyContent: 'center' } as const;

export function Leaders() {
  const { region, division } = usePurviewScope();
  const [monthOffset, setMonthOffset] = useState(0);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<User | null>(null);

  const range = monthRange(monthOffset);
  const inPurview = membersInPurview({ region, division });
  const rows = inPurview.filter((u) => !query || u.name.toLowerCase().includes(query.toLowerCase()));

  const cols: Column<User>[] = [
    { key: 'name', label: 'Member', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <Avatar name={r.name} size={32} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{r.role} · {r.region}</div>
        </div>
      </div>
    ) },
    { key: 'visits', label: 'Visits', w: 90, align: 'left', mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{memberStats(r, range).visitCount}</span> },
    { key: 'obs', label: 'Observations', w: 130, align: 'left', mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{memberStats(r, range).obsCount}</span> },
    { key: 'lastVisit', label: 'Last visit', w: 140, render: (r) => {
      const rec = lastVisitRecency(r);
      return rec.tone ? <Badge tone={rec.tone}>{rec.label}</Badge> : <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkMuted, fontWeight: 500 }}>{rec.label}</span>;
    } },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  return (
    <div>
      <PageHead
        title="Leaders"
        sub={`Members contributing to insights across ${purviewPhrase(region, division)} — visits, observations and how recently they've been on site.`}
        actions={<Btn variant="ghost" icon="download">Export</Btn>}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <Search placeholder="Search members" width={260} value={query} onChange={setQuery} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => setMonthOffset((o) => o - 1)} style={monthNavBtn} aria-label="Previous month">
            <Icon name="chevron_left" size={18} color={colors.inkSoft} />
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: colors.ink, minWidth: 180, textAlign: 'center' }}>{range.label}</span>
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            style={{ ...monthNavBtn, opacity: range.isCurrent ? 0.35 : 1, cursor: range.isCurrent ? 'not-allowed' : 'pointer' }}
            aria-label="Next month"
            disabled={range.isCurrent}
          >
            <Icon name="chevron_right" size={18} color={colors.inkSoft} />
          </button>
        </div>
      </div>
      <DataTable columns={cols} rows={rows} rowKey="id" onRow={setSelected} empty="No members in this purview." />

      <Drawer open={!!selected} onClose={() => setSelected(null)}>
        {selected && <MemberDetail u={selected} onClose={() => setSelected(null)} />}
      </Drawer>
    </div>
  );
}
