import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { DataTable, Avatar, Badge, Icon, Drawer, type Column } from '@/components';
import { SiteHeader } from './SiteHeader';
import { ContactDetail } from './ContactDetail';
import { SITES } from '@/data/sites';
import { CONTACTS_BY_SITE } from '@/data/contacts';
import { OBSERVATIONS } from '@/data/observations';
import type { Contact } from '@/types';

/** Same table pattern as Leaders (data/leaders.ts, views/leaders/Leaders.tsx)
 * but with site-scoped columns instead of purview-scoped ones — a site
 * contact doesn't have a "visits" concept (they work here, they don't visit),
 * so that column is dropped; Observations stays, counted against just this
 * site rather than all-time/purview-wide. */
export function SiteContacts() {
  const { id } = useParams();
  const s = SITES.find((x) => x.id === id) || SITES[0];
  const contacts = CONTACTS_BY_SITE[s.id] ?? [];
  const [selected, setSelected] = useState<Contact | null>(null);

  const obsCountFor = (c: Contact) => OBSERVATIONS.filter((o) => o.siteId === s.id && o.observerName === c.name).length;

  const cols: Column<Contact>[] = [
    { key: 'name', label: 'Contact', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <Avatar name={r.name} size={32} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</span>
            {r.primary && <Badge tone="hi">Primary</Badge>}
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{r.role}</div>
        </div>
      </div>
    ) },
    { key: 'obs', label: 'Observations', w: 130, align: 'left', mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{obsCountFor(r)}</span> },
    { key: 'status', label: 'Status', w: 140, render: (r) => r.status === 'On site now' ? <Badge tone="success">{r.status}</Badge> : <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkMuted, fontWeight: 500 }}>{r.status}</span> },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  return (
    <div>
      <SiteHeader s={s} />
      <DataTable columns={cols} rows={contacts} rowKey="id" onRow={setSelected} empty="No contacts recorded for this site." />

      <Drawer open={!!selected} onClose={() => setSelected(null)}>
        {selected && <ContactDetail c={selected} onClose={() => setSelected(null)} />}
      </Drawer>
    </div>
  );
}
