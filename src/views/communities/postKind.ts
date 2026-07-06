import type { Post } from '@/types';

export const KIND_BADGE: Record<Post['kind'], { label: string; tone: 'info' | 'warning'; icon: string } | null> = {
  discussion: null,
  poll: { label: 'Poll', tone: 'info', icon: 'poll' },
  briefing: { label: 'Briefing', tone: 'warning', icon: 'campaign' },
};
