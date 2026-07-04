import { useMemo, useState } from 'react';
import { colors } from '@/tokens';
import { Search, Btn, DataTable, Avatar, SChip, type Column } from '@/components';
import { USERS } from '@/data/users';
import type { AccessLevel, User } from '@/types';

const ACCESS_TONE: Record<AccessLevel, string> = { Admin: colors.ink, Manager: colors.blue, Supervisor: colors.green, Observer: colors.inkSoft };

export function UsersTable() {
  const [query, setQuery] = useState('');
  const rows = useMemo(() => USERS.filter((u) => !query || u.name.toLowerCase().includes(query.toLowerCase())), [query]);

  const cols: Column<User>[] = [
    { key: 'name', label: 'Name', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <Avatar name={r.name} size={32} />
        <div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</div><div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{r.role}</div></div>
      </div>
    ) },
    { key: 'region', label: 'Region', w: 130, render: (r) => <span style={{ color: colors.inkSoft }}>{r.region}</span> },
    { key: 'access', label: 'Access', w: 130, render: (r) => <SChip hue={ACCESS_TONE[r.access]}>{r.access}</SChip> },
    { key: 'sitesCount', label: 'Sites', w: 80, mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{r.sitesCount}</span> },
    { key: 'lastActive', label: 'Last active', w: 130, render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: r.lastActive === 'Online now' ? colors.green : colors.inkSoft, fontWeight: 600 }}>{r.lastActive}</span> },
    { key: 'status', label: '', w: 110, render: (r) => r.status === 'invited' ? <SChip hue={colors.amber}>Invited</SChip> : null },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <Search placeholder="Search people" width={260} value={query} onChange={setQuery} />
        <Btn variant="accent" icon="person_add">Invite user</Btn>
      </div>
      <DataTable columns={cols} rows={rows} rowKey="id" empty="No people match this search." />
    </div>
  );
}
