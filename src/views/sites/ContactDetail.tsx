import { colors } from '@/tokens';
import { Avatar, Badge, Card, Fact, Btn, IconBtn } from '@/components';
import type { Contact } from '@/types';

export function ContactDetail({ c, onClose }: { c: Contact; onClose: () => void }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <Avatar name={c.name} size={38} tone={c.primary ? colors.hi : undefined} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>{c.name}</div>
        </div>
        {/* Always tone="primary" outline regardless of which of the two roles
            (Work supervisor / Safety advisor) — an identity tag, not a status
            signal, so it doesn't earn a color of its own. */}
        <Badge tone="primary" outline>{c.role}</Badge>
        {c.primary && <Badge tone="hi">Primary</Badge>}
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <Btn variant="primary" icon="call" full>Call</Btn>
          </div>
          {c.radioChannel && (
            <div style={{ flex: 1 }}>
              <Btn variant="ghost" icon="settings_input_antenna" full>Radio</Btn>
            </div>
          )}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '0 0 8px' }}>Contact details</div>
        <Card pad={16}>
          <Fact k="Status" v={c.status} />
          {c.shift && <Fact k="Shift" v={c.shift} />}
          <Fact k="Phone" v={c.phone} />
          {c.radioChannel && <Fact k="Radio" v={c.radioChannel} />}
          <Fact k="Email" v={c.email} last />
        </Card>
      </div>
    </>
  );
}
