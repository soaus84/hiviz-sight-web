import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Card, Eyebrow, Icon, ListRow, Search } from '@/components';
import { COMMUNITIES, POSTS, isMyCommunity } from '@/data/communities';
import { useActiveUser } from '@/state/ActiveUser';
import { useCommunityScope } from '@/state/CommunityScope';
import { summarizePosts } from './postSummary';
import type { CommunityKind } from '@/types';

const KIND_LABEL: Record<CommunityKind, string> = {
  Org: 'Org communities',
  HighRiskWork: 'High-risk work communities',
  SafetyPractice: 'Safety practice communities',
  Regional: 'Regional communities',
};
const KIND_SHORT_LABEL: Record<CommunityKind, string> = {
  Org: 'Org',
  HighRiskWork: 'High-risk work',
  SafetyPractice: 'Safety practice',
  Regional: 'Regional',
};
const KINDS: CommunityKind[] = ['Org', 'HighRiskWork', 'SafetyPractice', 'Regional'];

export function MyCommunities() {
  const navigate = useNavigate();
  const { user } = useActiveUser();
  const { scope } = useCommunityScope();
  const [search, setSearch] = useState('');

  const groups = KINDS
    .map((kind) => ({
      kind,
      items: COMMUNITIES.filter((c) => c.kind === kind && c.name.toLowerCase().includes(search.toLowerCase()) && (scope === 'all' || isMyCommunity(c, user))),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <PageHead
        title="Communities"
        sub={scope === 'associated' ? 'Your org tier, plus the practice communities you’ve joined.' : 'Every community across the org, grouped by type.'}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Search placeholder="Search communities" width={280} value={search} onChange={setSearch} />
        {groups.map((group) => (
          <Card key={group.kind} pad={18}>
            <Eyebrow>{KIND_LABEL[group.kind]} · {group.items.length}</Eyebrow>
            {group.items.map((c, i) => {
              const posts = POSTS.filter((p) => p.community === c.name);
              const latest = posts.length ? posts.reduce((a, b) => (a.postedAgoMinutes < b.postedAgoMinutes ? a : b)) : undefined;
              // Subdivisions render indented under their division, same
              // smaller-swatch treatment PurviewSwitcher uses for the same
              // tier — makes Parent > Subs > Parent > Subs read as a
              // hierarchy rather than a coincidental sort order.
              const isSub = c.orgLevel === 'subdivision';
              return (
                <ListRow key={c.id} last={i === group.items.length - 1} padding={isSub ? '11px 0 11px 22px' : '11px 0'} onClick={() => navigate(`/communities/${c.id}`)}>
                  <div style={{ width: isSub ? 26 : 34, height: isSub ? 26 : 34, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={c.icon} size={isSub ? 14 : 18} color={colors.inkSoft} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1, fontWeight: 500 }}>{KIND_SHORT_LABEL[c.kind]} · {c.members} members</div>
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
