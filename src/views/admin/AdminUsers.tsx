import { useState } from 'react';
import { colors, type Tone } from '@/tokens';
import { Search, Btn, Badge, DataTable, Avatar, Drawer, Icon, IconBtn, type Column } from '@/components';
import { USERS, addUser, updateUser, removeUser, type UserInput } from '@/data/users';
import { ADMIN_REGIONS, ADMIN_DIVISIONS } from '@/data/admin/company';
import { SearchSelect } from './SearchSelect';
import type { AccessLevel, User } from '@/types';

const ACCESS_TONE: Record<AccessLevel, Tone> = { Admin: 'primary', Manager: 'info', Supervisor: 'success', Observer: 'primary' };
const ACCESS_OUTLINE: Record<AccessLevel, boolean> = { Admin: false, Manager: false, Supervisor: false, Observer: true };
const ACCESS_LEVELS: AccessLevel[] = ['Admin', 'Manager', 'Supervisor', 'Observer'];
// role stays constrained to these two values app-wide — see MemberDetail's
// role badge, which relies on there only ever being two roles so it never
// needs to vary its tone per role.
const ROLES = ['Safety Manager', 'Business Manager'] as const;
const REGION_OPTIONS = ADMIN_REGIONS.map((r) => ({ value: r.name, label: r.name }));
const DIVISION_OPTIONS = ADMIN_DIVISIONS.map((d) => ({ value: d.name, label: d.name }));

const fieldLabel = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: colors.inkMuted, marginBottom: 5 };
const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13.5, outline: 'none', background: colors.panel };

const EMPTY_INPUT: UserInput = { name: '', role: ROLES[0], region: '', division: '', access: 'Observer' };

export function AdminUsers() {
  const [query, setQuery] = useState('');
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);

  const [editing, setEditing] = useState<User | 'new' | null>(null);
  const [input, setInput] = useState<UserInput>(EMPTY_INPUT);
  const set = (field: keyof UserInput) => (v: string) => setInput((i) => ({ ...i, [field]: v }));

  const openNew = () => { setEditing('new'); setInput(EMPTY_INPUT); };
  const openEdit = (u: User) => { setEditing(u); setInput({ name: u.name, role: u.role, region: u.region, division: u.division ?? '', access: u.access }); };
  const close = () => setEditing(null);

  const save = () => {
    if (!input.name.trim() || !input.region.trim()) return;
    const cleaned: UserInput = { ...input, division: input.division?.trim() || undefined };
    if (editing === 'new') addUser(cleaned);
    else if (editing) updateUser(editing.id, cleaned);
    refresh();
    close();
  };
  const remove = () => {
    if (editing && editing !== 'new') removeUser(editing.id);
    refresh();
    close();
  };

  const rows = USERS.filter((u) => !query || u.name.toLowerCase().includes(query.toLowerCase()));

  const cols: Column<User>[] = [
    { key: 'name', label: 'Name', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <Avatar name={r.name} size={32} />
        <div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</div><div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{r.role}</div></div>
      </div>
    ) },
    { key: 'region', label: 'Region', w: 130, render: (r) => <span style={{ color: colors.inkSoft }}>{r.region}</span> },
    { key: 'access', label: 'Access', w: 130, render: (r) => <Badge tone={ACCESS_TONE[r.access]} outline={ACCESS_OUTLINE[r.access]}>{r.access}</Badge> },
    { key: 'sitesCount', label: 'Sites', w: 80, mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{r.sitesCount}</span> },
    { key: 'lastActive', label: 'Last active', w: 130, render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: r.lastActive === 'Online now' ? colors.green : colors.inkSoft, fontWeight: 600 }}>{r.lastActive}</span> },
    { key: 'status', label: '', w: 110, render: (r) => r.status === 'invited' ? <Badge tone="warning" outline>Invited</Badge> : null },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <Search placeholder="Search people" width={260} value={query} onChange={setQuery} />
        <Btn variant="accent" icon="person_add" onClick={openNew}>Invite user</Btn>
      </div>
      <DataTable columns={cols} rows={rows} rowKey="id" onRow={openEdit} empty="No people match this search." />

      <Drawer open={!!editing} onClose={close}>
        {editing && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
              <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>{editing === 'new' ? 'Invite user' : 'Edit user'}</div>
              <IconBtn name="close" onClick={close} />
            </div>
            <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>Name</label>
                <input className="a-input" value={input.name} onChange={(e) => set('name')(e.target.value)} style={inputStyle} autoFocus />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>Role</label>
                <select className="a-input" value={input.role} onChange={(e) => set('role')(e.target.value)} style={inputStyle}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>Region</label>
                <SearchSelect value={input.region} onChange={set('region')} options={REGION_OPTIONS} placeholder="Select region…" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>Division (optional)</label>
                <SearchSelect value={input.division ?? ''} onChange={set('division')} options={DIVISION_OPTIONS} placeholder="No division (region-wide)" clearable />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>Access level</label>
                <select className="a-input" value={input.access} onChange={(e) => set('access')(e.target.value)} style={inputStyle}>
                  {ACCESS_LEVELS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {editing !== 'new' && <Btn variant="danger" icon="delete" onClick={remove}>Remove</Btn>}
                <div style={{ flex: 1 }} />
                <Btn variant="primary" icon="check" disabled={!input.name.trim() || !input.region.trim()} onClick={save}>Save</Btn>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
