import { SITES } from '@/data/sites';
import type { NavItem } from './workspaces';

export interface Drilldown {
  icon: string;
  title: string;
  nav: NavItem[];
  /** Where the sidebar's "Back" button goes — a fixed destination rather
   * than browser history, since history can land somewhere other than the
   * list this drilldown was reached from (e.g. arriving at a site via an
   * insight rather than the Sites list). */
  backPath: string;
}

/**
 * Purely a function of the current path — no "which workspace did I come
 * from" state to track. Whichever workspace eventually links into a site
 * (Insights today, maybe an Incidents workspace later), the sidebar drops
 * into this same contextual nav, and reverts the moment the path moves on.
 */
export function getDrilldown(pathname: string): Drilldown | null {
  const match = pathname.match(/^\/sites\/([^/]+)/);
  if (!match) return null;
  const site = SITES.find((s) => s.id === match[1]);
  if (!site) return null;

  const base = `/sites/${site.id}`;
  return {
    icon: 'location_on',
    title: site.name,
    backPath: '/sites',
    nav: [
      { path: base, label: 'Overview', icon: 'summarize' },
      { path: `${base}/insights`, label: 'Insights', icon: 'lightbulb' },
      { path: `${base}/visits`, label: 'Visits', icon: 'calendar_today' },
      { path: `${base}/observations`, label: 'Observations', icon: 'visibility' },
      { path: `${base}/contacts`, label: 'Contacts', icon: 'contacts' },
    ],
  };
}
