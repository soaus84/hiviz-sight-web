import type { Post, PostKind } from '@/types';

const LABELS: Record<PostKind, [string, string]> = {
  discussion: ['discussion', 'discussions'],
  poll: ['poll', 'polls'],
  briefing: ['briefing', 'briefings'],
};
const ORDER: PostKind[] = ['discussion', 'poll', 'briefing'];

export function summarizePosts(posts: Post[]): string {
  if (posts.length === 0) return 'No posts yet';
  return ORDER.map((kind) => {
    const n = posts.filter((p) => p.kind === kind).length;
    if (!n) return null;
    const [singular, plural] = LABELS[kind];
    return `${n} ${n === 1 ? singular : plural}`;
  })
    .filter(Boolean)
    .join(' · ');
}
