import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Card, Avatar, SChip, AINote, Icon, Btn } from '@/components';
import { CURRENT_USER } from '@/data/currentUser';
import type { Thread } from '@/types';

export function ThreadView({ t }: { t: Thread }) {
  const navigate = useNavigate();
  const p = t.post;
  return (
    <div style={{ maxWidth: 760 }}>
      <button onClick={() => navigate('/communities')} className="a-link" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: colors.inkSoft, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.6 }}>
        <Icon name="arrow_back" size={16} /> {p.community}
      </button>
      <Card pad={24}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
          <Avatar name={p.author} size={38} tone={colors.hi} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700 }}>{p.author}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, marginTop: 2, fontWeight: 600 }}>Generated insight · {p.community} · {p.when}</div>
          </div>
          <SChip hue={colors.hiInk} icon="auto_awesome">From insight</SChip>
        </div>
        <h2 style={{ fontFamily: 'var(--font-sans)', margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.25 }}>{p.title}</h2>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: colors.inkSoft, marginTop: 10, lineHeight: 1.6, fontWeight: 500 }}>{p.body}</div>
        <div style={{ marginTop: 16 }}><AINote title="The question this raises">{t.question}</AINote></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '11px 14px', border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)' }}>
          <Icon name="description" size={20} color={colors.inkSoft} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, flex: 1 }}>Spotter-handover-checklist-v2.pdf</span>
          <button className="a-link" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: colors.ink, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>View</button>
        </div>
      </Card>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '24px 4px 12px' }}>{t.replies.length} replies</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {t.replies.map((r, k) => (
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
        <Avatar name={CURRENT_USER.name} size={36} />
        <input className="a-input" placeholder="Add a reply…" style={{ fontFamily: 'var(--font-sans)', flex: 1, height: 44, padding: '0 16px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontSize: 14, outline: 'none' }} />
        <Btn variant="primary" icon="send">Reply</Btn>
      </div>
    </div>
  );
}
