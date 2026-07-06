import type { Breakpoint } from '@/hooks/useBreakpoint';

export type InsightsView = 'list' | 'board';

/**
 * Only the desktop List view uses a fixed-height, internally-scrolling
 * master-detail layout. Mobile/tablet and the Kanban board are normal
 * content-sized pages that should scroll with the page — pinning them to
 * viewport height anyway swallows AppShell's bottom padding (content
 * overflows the fixed box instead of growing it), which is what made
 * cards look like they touched the bottom of the page. Shared between
 * Insights.tsx and AppShell.tsx so the two can never drift apart again.
 */
export function insightsFitToHeight(view: InsightsView, breakpoint: Breakpoint): boolean {
  return breakpoint === 'desktop' && view === 'list';
}
