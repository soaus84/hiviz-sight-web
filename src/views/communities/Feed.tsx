import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHead, Btn } from '@/components';
import { POSTS } from '@/data/communities';
import { PostCard } from './PostCard';
import { NewPostDrawer } from './NewPostDrawer';
import { markFeedVisited } from './unread';

export function Feed() {
  const navigate = useNavigate();
  const [newPostOpen, setNewPostOpen] = useState(false);
  const posts = useMemo(() => [...POSTS].sort((a, b) => a.postedAgoMinutes - b.postedAgoMinutes), []);

  useEffect(() => {
    markFeedVisited();
  }, []);

  return (
    <div>
      <PageHead
        title="Feed"
        sub="Every discussion, poll and briefing across your communities, newest first."
        actions={<Btn variant="accent" icon="add" onClick={() => setNewPostOpen(true)}>New post</Btn>}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.map((p) => <PostCard key={p.id} p={p} onOpen={() => navigate(`/communities/thread/${p.id}`)} />)}
      </div>
      <NewPostDrawer open={newPostOpen} onClose={() => setNewPostOpen(false)} />
    </div>
  );
}
