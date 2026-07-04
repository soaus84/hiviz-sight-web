import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PageHead, Btn, Card, Eyebrow, Icon } from '@/components';
import { COMMUNITIES, POSTS } from '@/data/communities';
import { PostCard } from './PostCard';

export function Communities() {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const gridCols = breakpoint === 'desktop' ? '1fr 320px' : '1fr';

  return (
    <div>
      <PageHead title="Communities of practice" sub="Share what works and learn across sites. Hiviz seeds approved insights here so the field can weigh in." actions={<Btn variant="accent" icon="add">New post</Btn>} />
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {POSTS.map((p) => <PostCard key={p.id} p={p} onOpen={() => navigate(`/communities/thread/${p.id}`)} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card pad={18}>
            <Eyebrow>My communities</Eyebrow>
            {COMMUNITIES.map((c, i) => (
              <div key={c.id} className="a-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i === COMMUNITIES.length - 1 ? 'none' : `1px solid ${colors.ruleSoft}`, cursor: 'pointer' }}>
                <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={c.icon} size={18} color={colors.inkSoft} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1, fontWeight: 500 }}>{c.kind} · {c.members} members</div>
                </div>
                <Icon name="chevron_right" size={16} color={colors.inkMuted} />
              </div>
            ))}
          </Card>
          <Card pad={18} style={{ background: colors.ink, borderColor: colors.ink }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon name="auto_awesome" size={16} color={colors.hi} fill={1} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.hi }}>From your insights</span>
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: '#fff', lineHeight: 1.5, fontWeight: 500 }}>
              2 of your supported insights have been shared to communities this month, reaching 240 members.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
