import type { Tone } from '@/tokens';
import type { WorkStreamKind, WorkStreamStatus } from '@/types';

export const WORK_STREAM_KIND_DISPLAY: Record<WorkStreamKind, { label: string; icon: string }> = {
  toolbox_talk: { label: 'Toolbox talk', icon: 'forum' },
  learn: { label: 'Learn', icon: 'help' },
  improve: { label: 'Improve', icon: 'task_alt' },
};

export const WORK_STREAM_STATUS_DISPLAY: Record<WorkStreamStatus, { label: string; tone: Tone }> = {
  draft: { label: 'Draft', tone: 'primary' },
  live: { label: 'Live', tone: 'info' },
  completed: { label: 'Completed', tone: 'success' },
};

/** "Delivered" for a toolbox talk, "Complete" for learn/improve — same
 * underlying per-site boolean (WorkStreamSite.complete), just read
 * differently per kind. Shared so the parent-side card and the site-side
 * drawer/list never drift into using different words for the same state. */
export function workStreamDoneWord(kind: WorkStreamKind): string {
  return kind === 'toolbox_talk' ? 'Delivered' : 'Complete';
}
