import { useState } from 'react';
import { colors } from '@/tokens';
import { Btn, DataTable, Drawer, Icon, IconBtn, type Column } from '@/components';
import { SearchSelect, type SearchSelectOption } from './SearchSelect';
import type { TagRecord } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: colors.inkMuted, marginBottom: 5 };
const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13.5, outline: 'none' };

export interface TagListParent {
  /** Singular noun for the parent entity — "division". */
  noun: string;
  options: SearchSelectOption[];
}

export interface TagListProps {
  /** Singular noun used in copy — "division", "worksite type". */
  noun: string;
  items: TagRecord[];
  onAdd: (name: string, description: string, parentId?: string) => void;
  onUpdate: (id: string, name: string, description: string, parentId?: string) => void;
  onDelete: (id: string) => void;
  /** When set, every record requires picking one of `options` as its
   * parent (e.g. Subdivision -> Division) — rendered as a mandatory
   * SearchSelect and shown under each row's name. */
  parent?: TagListParent;
}

/** The shared CRUD list pattern for Admin's simple {id, name, description}
 * lists — Structure's Divisions/Subdivisions/Regions and the three Taxonomy
 * lists. List + Drawer form for add/edit + delete, same shape everywhere;
 * only the noun, backing array, and optional `parent` differ per caller. */
export function TagList({ noun, items, onAdd, onUpdate, onDelete, parent }: TagListProps) {
  const [editing, setEditing] = useState<TagRecord | 'new' | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');

  const openNew = () => { setEditing('new'); setName(''); setDescription(''); setParentId(''); };
  const openEdit = (t: TagRecord) => { setEditing(t); setName(t.name); setDescription(t.description ?? ''); setParentId(t.parentId ?? ''); };
  const close = () => setEditing(null);

  const canSave = name.trim().length > 0 && (!parent || parentId.length > 0);

  const save = () => {
    if (!canSave) return;
    if (editing === 'new') onAdd(name.trim(), description.trim(), parent ? parentId : undefined);
    else if (editing) onUpdate(editing.id, name.trim(), description.trim(), parent ? parentId : undefined);
    close();
  };
  const remove = () => {
    if (editing && editing !== 'new') onDelete(editing.id);
    close();
  };

  const cols: Column<TagRecord>[] = [
    { key: 'name', label: 'Name', render: (r) => (
      <div>
        <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</span>
        {parent && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>
            {parent.options.find((o) => o.value === r.parentId)?.label ?? '—'}
          </div>
        )}
      </div>
    ) },
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
              {parent && (
                <>
                  <label style={fieldLabel}>{parent.noun.charAt(0).toUpperCase() + parent.noun.slice(1)}</label>
                  <div style={{ marginBottom: 16 }}>
                    <SearchSelect value={parentId} onChange={setParentId} options={parent.options} placeholder={`Select ${parent.noun}…`} />
                  </div>
                </>
              )}
              <label style={fieldLabel}>Description (optional)</label>
              <textarea className="a-input" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

              <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                {editing !== 'new' && <Btn variant="danger" icon="delete" onClick={remove}>Delete</Btn>}
                <div style={{ flex: 1 }} />
                <Btn variant="primary" icon="check" disabled={!canSave} onClick={save}>{editing === 'new' ? 'Create' : 'Save'}</Btn>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
