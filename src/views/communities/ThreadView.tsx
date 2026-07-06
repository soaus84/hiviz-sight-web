import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Card, Avatar, Badge, AINote, Icon, Btn, LinkBtn } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';
import { COMMUNITIES } from '@/data/communities';
import { KIND_BADGE } from './postKind';
import { PollBars } from './PollBars';
import type { Post, ThreadReply } from '@/types';

const COMPOSER: Record<Post['kind'], { placeholder: string; action: string }> = {
  discussion: { placeholder: 'Add a reply…', action: 'Reply' },
  poll: { placeholder: 'Add a comment…', action: 'Reply' },
  briefing: { placeholder: 'Ask a question…', action: 'Ask' },
};

export interface ThreadViewProps {
  post: Post;
  question?: string;
  replies: ThreadReply[];
}

export function ThreadView({ post: p, question, replies }: ThreadViewProps) {
  const navigate = useNavigate();
  const { user } = useActiveUser();
  const community = COMMUNITIES.find((c) => c.name === p.community);
  const kindBadge = KIND_BADGE[p.kind];
  const composer = COMPOSER[p.kind];
  const repliesLabel = p.kind === 'briefing' ? 'questions' : 'replies';

  return (
    <div style={{ maxWidth: 760 }}>
      <LinkBtn
        icon="arrow_back"
        size="md"
        onClick={() => navigate(community ? `/communities/${community.id}` : '/communities')}
        style={{ marginBottom: 16 }}
      >
        {p.community}
      </LinkBtn>
      <Card pad={24}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
          <Avatar name={p.author} size={38} tone={p.generated ? colors.hi : undefined} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700 }}>
              {p.author}{p.role && <span style={{ fontWeight: 500, color: colors.inkSoft }}> · {p.role}</span>}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, marginTop: 2, fontWeight: 600 }}>{p.community} · {p.when}</div>
          </div>
          {p.generated && <Badge tone="primary" outline icon="lightbulb">From insight</Badge>}
          {kindBadge && <Badge tone={kindBadge.tone} outline icon={kindBadge.icon}>{kindBadge.label}</Badge>}
        </div>
        <h2 style={{ fontFamily: 'var(--font-sans)', margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.25 }}>{p.title}</h2>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: colors.inkSoft, marginTop: 10, lineHeight: 1.6, fontWeight: 500 }}>{p.body}</div>

        {p.kind === 'poll' && p.pollOptions && (
          <div style={{ marginTop: 16 }}><PollBars options={p.pollOptions} /></div>
        )}

        {question && <div style={{ marginTop: 16 }}><AINote title="The question this raises">{question}</AINote></div>}

        {!!p.files && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '11px 14px', border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)' }}>
            <Icon name="description" size={20} color={colors.inkSoft} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, flex: 1 }}>{p.fileName ?? 'Attachment.pdf'}</span>
            <LinkBtn size="sm" style={{ color: colors.ink, letterSpacing: 0 }}>View</LinkBtn>
          </div>
        )}
      </Card>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '24px 4px 12px' }}>
        {replies.length < p.replies ? `${replies.length} of ${p.replies} ${repliesLabel}` : `${p.replies} ${repliesLabel}`}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {replies.map((r, k) => (
          <Card key={k} pad={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 9 }}>
              <Avatar name={r.name} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, marginTop: 1, fontWeight: 600 }}>{r.role} · {r.when}</div>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.ink, lineHeight: 1.55, fontWeight: 500 }}>{r.text}</div>
            <div style={{ marginTop: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: colors.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon name="thumb_up" size={15} color={colors.inkMuted} />{r.likes}
              </span>
            </div>
          </Card>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
        <Avatar name={user.name} size={36} />
        <input className="a-input" placeholder={composer.placeholder} style={{ fontFamily: 'var(--font-sans)', flex: 1, height: 44, padding: '0 16px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontSize: 14, outline: 'none' }} />
        <Btn variant="primary" icon="send">{composer.action}</Btn>
      </div>
    </div>
  );
}
