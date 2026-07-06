import { colors } from '@/tokens';
import { Card, Avatar, Badge, Icon } from '@/components';
import { KIND_BADGE } from './postKind';
import { PollBars } from './PollBars';
import type { Post } from '@/types';

export function PostCard({ p, onOpen }: { p: Post; onOpen: () => void }) {
  const kindBadge = KIND_BADGE[p.kind];
  const totalVotes = p.pollOptions?.reduce((sum, o) => sum + o.votes, 0) ?? 0;

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
        {p.generated && <Badge tone="primary" outline icon="lightbulb">From insight</Badge>}
        {p.digest && <Badge tone="info" outline>Digest</Badge>}
        {kindBadge && <Badge tone={kindBadge.tone} outline icon={kindBadge.icon}>{kindBadge.label}</Badge>}
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.3 }}>{p.title}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkSoft, marginTop: 7, lineHeight: 1.55, fontWeight: 500 }}>{p.body}</div>

      {p.kind === 'poll' && p.pollOptions && (
        <div style={{ marginTop: 14 }}><PollBars options={p.pollOptions} /></div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, paddingTop: 13, borderTop: `1px solid ${colors.ruleSoft}` }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: colors.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="chat_bubble" size={15} color={colors.inkMuted} />{p.replies}
        </span>
        {p.kind === 'poll' ? (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: colors.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="how_to_vote" size={15} color={colors.inkMuted} />{totalVotes} votes
          </span>
        ) : (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: colors.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="thumb_up" size={15} color={colors.inkMuted} />{p.likes}
          </span>
        )}
        {!!p.files && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: colors.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="attach_file" size={15} color={colors.inkMuted} />{p.files}
          </span>
        )}
      </div>
    </Card>
  );
}
