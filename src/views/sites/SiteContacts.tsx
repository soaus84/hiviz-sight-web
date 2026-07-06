import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { Card, Eyebrow, Avatar, Badge, ListRow, Drawer } from '@/components';
import { SiteHeader } from './SiteHeader';
import { ContactDetail } from './ContactDetail';
import { SITES } from '@/data/sites';
import { CONTACTS_BY_SITE } from '@/data/contacts';
import type { Contact } from '@/types';

export function SiteContacts() {
  const { id } = useParams();
  const s = SITES.find((x) => x.id === id) || SITES[0];
  const contacts = CONTACTS_BY_SITE[s.id] ?? [];
  const [selected, setSelected] = useState<Contact | null>(null);

  return (
    <div>
      <SiteHeader s={s} />
      <Card pad={20} style={{ maxWidth: 480 }}>
        <Eyebrow>Site contacts · {contacts.length}</Eyebrow>
        {contacts.map((c, i) => (
          <ListRow key={c.id} last={i === contacts.length - 1} onClick={() => setSelected(c)}>
            <Avatar name={c.name} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1, fontWeight: 500 }}>{c.role}</div>
            </div>
            {c.primary && <Badge tone="hi">Primary</Badge>}
          </ListRow>
        ))}
      </Card>

      <Drawer open={!!selected} onClose={() => setSelected(null)}>
        {selected && <ContactDetail c={selected} onClose={() => setSelected(null)} />}
      </Drawer>
    </div>
  );
}
