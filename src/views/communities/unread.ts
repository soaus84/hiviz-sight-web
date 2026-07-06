import type { Post } from '@/types';

const STORAGE_KEY = 'hiviz.communities.feedLastVisit';
export const FEED_VISITED_EVENT = 'hiviz:communities-feed-visited';

// Fixed once per page load so a post's mock "when" offset resolves to a
// stable timestamp for the rest of the session, instead of drifting on every
// call to Date.now().
const SESSION_NOW = Date.now();

function postTimestamp(p: Post): number {
  return SESSION_NOW - p.postedAgoMinutes * 60_000;
}

export function markFeedVisited(): void {
  localStorage.setItem(STORAGE_KEY, String(SESSION_NOW));
  window.dispatchEvent(new Event(FEED_VISITED_EVENT));
}

/** Posts newer than your last Feed visit — no per-post read receipts, just one timestamp. */
export function countUnseenPosts(posts: Post[]): number {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return posts.length;
  const lastVisit = Number(raw);
  return posts.filter((p) => postTimestamp(p) > lastVisit).length;
}
