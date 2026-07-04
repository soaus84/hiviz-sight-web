import { colors } from '@/tokens';
import { Card, Avatar, SChip, Icon } from '@/components';
import type { Post } from '@/types';

export function PostCard({ p, onOpen }: { p: Post; onOpen: () => void }) {
  return (
    <Card pad={18} interactive onClick={onOpen}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
        <Avatar name={p.author} size={34} tone={p.generated ? colors.hi : undefined} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}>
            {p.author}{p.role && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: colors.inkSoft }}>· {p.role}</span>}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, marginTop: 2, fontWeight: 600 }}>{p.community} · {p.when}</div>
        </div>
        {p.generated && <SChip hue={colors.hiInk} icon="auto_awesome">From insight</SChip>}
        {p.digest && <SChip hue={colors.blue}>Digest</SChip>}
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.3 }}>{p.title}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkSoft, marginTop: 7, lineHeight: 1.55, fontWeight: 500 }}>{p.body}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, paddingTop: 13, borderTop: `1px solid ${colors.ruleSoft}` }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: colors.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="chat_bubble" size={15} color={colors.inkMuted} />{p.replies}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: colors.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="thumb_up" size={15} color={colors.inkMuted} />{p.likes}
        </span>
        {!!p.files && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: colors.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="attach_file" size={15} color={colors.inkMuted} />{p.files}
          </span>
        )}
      </div>
    </Card>
  );
}
