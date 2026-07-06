import { SITES } from '@/data/sites';
import type { NavItem } from './workspaces';

export interface Drilldown {
  icon: string;
  title: string;
  nav: NavItem[];
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
    nav: [
      { path: base, label: 'Overview', icon: 'summarize' },
      { path: `${base}/insights`, label: 'Insights', icon: 'lightbulb' },
      { path: `${base}/visits`, label: 'Visits', icon: 'event' },
      { path: `${base}/observations`, label: 'Observations', icon: 'visibility' },
      { path: `${base}/contacts`, label: 'Contacts', icon: 'contacts' },
    ],
  };
}
