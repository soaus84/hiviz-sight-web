import { THREAD } from '@/data/communities';
import { ThreadView } from './ThreadView';

// Mock data only has one full thread example; a real backend would fetch by :id.
export function CommunityThreadPage() {
  return <ThreadView t={THREAD} />;
}
