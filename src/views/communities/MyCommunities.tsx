import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Card, Eyebrow, Icon, ListRow, Search } from '@/components';
import { COMMUNITIES, POSTS } from '@/data/communities';
import { summarizePosts } from './postSummary';
import type { CommunityKind } from '@/types';

const KIND_LABEL: Record<CommunityKind, string> = {
  Practice: 'Practice communities',
  Regional: 'Regional communities',
};
const KINDS: CommunityKind[] = ['Practice', 'Regional'];

export function MyCommunities() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const groups = KINDS
    .map((kind) => ({ kind, items: COMMUNITIES.filter((c) => c.kind === kind && c.name.toLowerCase().includes(search.toLowerCase())) }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <PageHead title="My communities" sub="Communities you're a member of, grouped by type." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Search placeholder="Search communities" width={280} value={search} onChange={setSearch} />
        {groups.map((group) => (
          <Card key={group.kind} pad={18}>
            <Eyebrow>{KIND_LABEL[group.kind]} · {group.items.length}</Eyebrow>
            {group.items.map((c, i) => {
              const posts = POSTS.filter((p) => p.community === c.name);
              const latest = posts.length ? posts.reduce((a, b) => (a.postedAgoMinutes < b.postedAgoMinutes ? a : b)) : undefined;
              return (
                <ListRow key={c.id} last={i === group.items.length - 1} onClick={() => navigate(`/communities/${c.id}`)}>
                  <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={c.icon} size={18} color={colors.inkSoft} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1, fontWeight: 500 }}>{c.kind} · {c.members} members</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 3, fontWeight: 600 }}>
                      {summarizePosts(posts)}{latest && <> · Active {latest.when}</>}
                    </div>
                  </div>
                  <Icon name="chevron_right" size={16} color={colors.inkMuted} />
                </ListRow>
              );
            })}
          </Card>
        ))}
        {groups.length === 0 && (
          <Card pad={24} style={{ textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>
            No communities match “{search}”.
          </Card>
        )}
      </div>
    </div>
  );
}
