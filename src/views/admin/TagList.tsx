import { useState } from 'react';
import { colors } from '@/tokens';
import { Btn, DataTable, Drawer, Icon, IconBtn, type Column } from '@/components';
import type { TagRecord } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: colors.inkMuted, marginBottom: 5 };
const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13.5, outline: 'none' };

export interface TagListProps {
  /** Singular noun used in copy — "division", "worksite type". */
  noun: string;
  items: TagRecord[];
  onAdd: (name: string, description: string) => void;
  onUpdate: (id: string, name: string, description: string) => void;
  onDelete: (id: string) => void;
}

/** The shared CRUD list pattern for Admin's simple {id, name, description}
 * lists — Company's Divisions/Regions and the three Taxonomy lists. List +
 * Drawer form for add/edit + delete, same shape everywhere; only the noun
 * and the backing array differ per caller. */
export function TagList({ noun, items, onAdd, onUpdate, onDelete }: TagListProps) {
  const [editing, setEditing] = useState<TagRecord | 'new' | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openNew = () => { setEditing('new'); setName(''); setDescription(''); };
  const openEdit = (t: TagRecord) => { setEditing(t); setName(t.name); setDescription(t.description ?? ''); };
  const close = () => setEditing(null);

  const save = () => {
    if (!name.trim()) return;
    if (editing === 'new') onAdd(name.trim(), description.trim());
    else if (editing) onUpdate(editing.id, name.trim(), description.trim());
    close();
  };
  const remove = () => {
    if (editing && editing !== 'new') onDelete(editing.id);
    close();
  };

  const cols: Column<TagRecord>[] = [
    { key: 'name', label: 'Name', render: (r) => <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</span> },
    { key: 'description', label: 'Description', render: (r) => <span style={{ color: colors.inkSoft }}>{r.description || '—'}</span> },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <Btn variant="accent" icon="add" onClick={openNew}>Add {noun}</Btn>
      </div>
      <DataTable columns={cols} rows={items} rowKey="id" onRow={openEdit} empty={`No ${noun}s yet.`} />

      <Drawer open={!!editing} onClose={close}>
        {editing && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
              <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>
                {editing === 'new' ? `New ${noun}` : `Edit ${noun}`}
              </div>
              <IconBtn name="close" onClick={close} />
            </div>
            <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
              <label style={fieldLabel}>Name</label>
              <input className="a-input" value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} autoFocus />
              <label style={fieldLabel}>Description (optional)</label>
              <textarea className="a-input" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

              <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                {editing !== 'new' && <Btn variant="danger" icon="delete" onClick={remove}>Delete</Btn>}
                <div style={{ flex: 1 }} />
                <Btn variant="primary" icon="check" disabled={!name.trim()} onClick={save}>Save</Btn>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
