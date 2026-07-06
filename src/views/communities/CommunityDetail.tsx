import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PageHead, Btn, Stat, Card, Eyebrow, AINote, LinkBtn } from '@/components';
import { COMMUNITIES, POSTS } from '@/data/communities';
import { PostCard } from './PostCard';

export function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const community = COMMUNITIES.find((c) => c.id === id) ?? COMMUNITIES[0];
  const posts = POSTS.filter((p) => p.community === community.name).sort((a, b) => a.postedAgoMinutes - b.postedAgoMinutes);
  const seedPost = posts.find((p) => p.generated);

  const statCols = breakpoint === 'mobile' ? '1fr' : 'repeat(2, 1fr)';

  return (
    <div>
      <LinkBtn icon="arrow_back" size="md" onClick={() => navigate('/communities/mine')} style={{ marginBottom: 16 }}>
        My communities
      </LinkBtn>
      <PageHead
        title={community.name}
        sub={`${community.kind} community · ${community.members} members`}
        actions={<Btn variant="accent" icon="add">New post</Btn>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 16, marginBottom: 24, maxWidth: 460 }}>
        <Stat label="Members" value={community.members} icon="groups" />
        <Stat label="Posts" value={posts.length} icon="forum" />
      </div>

      {seedPost && (
        <div style={{ marginBottom: 20, cursor: 'pointer' }} onClick={() => navigate(`/communities/thread/${seedPost.id}`)}>
          <AINote title="Seeded from approved insight">
            “{seedPost.title}” — the pattern that started this community. Tap to view the insight.
          </AINote>
        </div>
      )}

      <Eyebrow>Posts · {posts.length}</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.length === 0 && (
          <Card pad={24} style={{ textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>
            No posts yet in {community.name}.
          </Card>
        )}
        {posts.map((p) => <PostCard key={p.id} p={p} onOpen={() => navigate(`/communities/thread/${p.id}`)} />)}
      </div>
    </div>
  );
}
