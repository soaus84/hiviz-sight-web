import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHead, Btn, Card } from '@/components';
import { colors } from '@/tokens';
import { COMMUNITIES, POSTS, isMyCommunity } from '@/data/communities';
import { useActiveUser } from '@/state/ActiveUser';
import { useCommunityScope } from '@/state/CommunityScope';
import { PostCard } from './PostCard';
import { NewPostDrawer } from './NewPostDrawer';
import { markFeedVisited } from './unread';

export function Feed() {
  const navigate = useNavigate();
  const { user } = useActiveUser();
  const { scope } = useCommunityScope();
  const [newPostOpen, setNewPostOpen] = useState(false);

  const posts = useMemo(() => {
    const sorted = [...POSTS].sort((a, b) => a.postedAgoMinutes - b.postedAgoMinutes);
    if (scope === 'all') return sorted;
    return sorted.filter((p) => {
      const community = COMMUNITIES.find((c) => c.name === p.community);
      return !!community && isMyCommunity(community, user);
    });
  }, [scope, user]);

  useEffect(() => {
    markFeedVisited();
  }, []);

  return (
    <div>
      <PageHead
        title="Feed"
        sub={scope === 'associated' ? 'Every discussion, poll and briefing from your communities, newest first.' : 'Every discussion, poll and briefing across your communities, newest first.'}
        actions={<Btn variant="accent" icon="add" onClick={() => setNewPostOpen(true)}>New post</Btn>}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.length === 0 && (
          <Card pad={24} style={{ textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>
            No posts in your communities yet.
          </Card>
        )}
        {posts.map((p) => <PostCard key={p.id} p={p} onOpen={() => navigate(`/communities/thread/${p.id}`)} />)}
      </div>
      <NewPostDrawer open={newPostOpen} onClose={() => setNewPostOpen(false)} />
    </div>
  );
}
