import { useState } from 'react';
import { colors } from '@/tokens';
import { PageHead, Btn, DataTable, Drawer, Icon, IconBtn, type Column } from '@/components';
import { ADMIN_WORKSITES, addWorksite, updateWorksite, removeWorksite, type AdminWorksiteInput } from '@/data/admin/worksites';
import { ADMIN_REGIONS, ADMIN_DIVISIONS } from '@/data/admin/company';
import { WORKSITE_TYPES } from '@/data/admin/taxonomies';
import { USERS } from '@/data/users';
import { SearchSelect } from './SearchSelect';
import type { AdminWorksite } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: colors.inkMuted, marginBottom: 5 };
const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13.5, outline: 'none' };

const REGION_OPTIONS = ADMIN_REGIONS.map((r) => ({ value: r.name, label: r.name }));
const DIVISION_OPTIONS = ADMIN_DIVISIONS.map((d) => ({ value: d.name, label: d.name }));
const TYPE_OPTIONS = WORKSITE_TYPES.map((t) => ({ value: t.name, label: t.name, sublabel: t.description }));
const SUPERVISOR_OPTIONS = USERS.map((u) => ({ value: u.name, label: u.name, sublabel: u.role }));

const EMPTY_INPUT: AdminWorksiteInput = { name: '', region: '', division: '', type: '', supervisor: '', crewSize: 0 };

export function AdminWorksites() {
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);

  const [editing, setEditing] = useState<AdminWorksite | 'new' | null>(null);
  const [input, setInput] = useState<AdminWorksiteInput>(EMPTY_INPUT);
  const set = (field: keyof AdminWorksiteInput) => (v: string) => setInput((i) => ({ ...i, [field]: field === 'crewSize' ? Number(v) || 0 : v }));

  const openNew = () => { setEditing('new'); setInput(EMPTY_INPUT); };
  const openEdit = (w: AdminWorksite) => { setEditing(w); setInput({ name: w.name, region: w.region, division: w.division, type: w.type, supervisor: w.supervisor, crewSize: w.crewSize }); };
  const close = () => setEditing(null);

  const save = () => {
    if (!input.name.trim()) return;
    if (editing === 'new') addWorksite(input);
    else if (editing) updateWorksite(editing.id, input);
    refresh();
    close();
  };
  const remove = () => {
    if (editing && editing !== 'new') removeWorksite(editing.id);
    refresh();
    close();
  };

  const cols: Column<AdminWorksite>[] = [
    { key: 'name', label: 'Worksite', render: (r) => (
      <div>
        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{r.region} · {r.division} · {r.type}</div>
      </div>
    ) },
    { key: 'supervisor', label: 'Supervisor', w: 160, render: (r) => <span style={{ color: colors.inkSoft }}>{r.supervisor}</span> },
    { key: 'crewSize', label: 'Crew', w: 80, mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{r.crewSize}</span> },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  return (
    <div>
      <PageHead
        title="Worksites"
        sub="Standalone worksite records for Admin — separate from the live Sites list in Insights."
        actions={<Btn variant="accent" icon="add" onClick={openNew}>Add worksite</Btn>}
      />
      <DataTable columns={cols} rows={ADMIN_WORKSITES} rowKey="id" onRow={openEdit} empty="No worksites yet." />

      <Drawer open={!!editing} onClose={close}>
        {editing && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
              <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>{editing === 'new' ? 'New worksite' : 'Edit worksite'}</div>
              <IconBtn name="close" onClick={close} />
            </div>
            <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>Name</label>
                <input className="a-input" value={input.name} onChange={(e) => set('name')(e.target.value)} style={inputStyle} autoFocus />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>Region</label>
                <SearchSelect value={input.region} onChange={set('region')} options={REGION_OPTIONS} placeholder="Select region…" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>Division</label>
                <SearchSelect value={input.division} onChange={set('division')} options={DIVISION_OPTIONS} placeholder="Select division…" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>Type</label>
                <SearchSelect value={input.type} onChange={set('type')} options={TYPE_OPTIONS} placeholder="Select worksite type…" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>Supervisor</label>
                <SearchSelect value={input.supervisor} onChange={set('supervisor')} options={SUPERVISOR_OPTIONS} placeholder="Select supervisor…" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>Crew size</label>
                <input className="a-input" type="number" min={0} value={input.crewSize} onChange={(e) => set('crewSize')(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {editing !== 'new' && <Btn variant="danger" icon="delete" onClick={remove}>Delete</Btn>}
                <div style={{ flex: 1 }} />
                <Btn variant="primary" icon="check" disabled={!input.name.trim()} onClick={save}>Save</Btn>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
