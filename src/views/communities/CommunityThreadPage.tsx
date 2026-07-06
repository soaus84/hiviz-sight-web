import { useParams } from 'react-router-dom';
import { POSTS, THREADS } from '@/data/communities';
import { ThreadView } from './ThreadView';

export function CommunityThreadPage() {
  const { id } = useParams();
  const post = POSTS.find((p) => p.id === id) ?? POSTS[0];
  const extra = THREADS[post.id];
  return <ThreadView post={post} question={extra?.question} replies={extra?.replies ?? []} />;
}
