import { POSTS } from '@/data/communities';
import { countUnseenPosts } from '@/views/communities/unread';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: () => number | undefined;
}

export type WorkspaceId = 'insights' | 'communities';

export interface Workspace {
  id: WorkspaceId;
  label: string;
  icon: string;
  description: string;
  home: string;
  nav: NavItem[];
}

export const WORKSPACES: Workspace[] = [
  {
    id: 'insights',
    label: 'Insights',
    icon: 'lightbulb',
    description: 'Dashboard, visits, observations & sites',
    home: '/dashboard',
    nav: [
      { path: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
      { path: '/insights', label: 'Insights', icon: 'lightbulb' },
      { path: '/visits', label: 'Visits', icon: 'event' },
      { path: '/observations', label: 'Observations', icon: 'visibility' },
      { path: '/sites', label: 'Sites', icon: 'location_on' },
    ],
  },
  {
    id: 'communities',
    label: 'Communities',
    icon: 'groups',
    description: 'Discussions, polls & briefings',
    home: '/communities',
    nav: [
      { path: '/communities', label: 'Feed', icon: 'dynamic_feed', badge: () => countUnseenPosts(POSTS) },
      { path: '/communities/mine', label: 'My Communities', icon: 'groups' },
    ],
  },
];

export function workspaceForPath(pathname: string): Workspace {
  const section = '/' + pathname.split('/')[1];
  return WORKSPACES.find((w) => w.nav.some((n) => n.path === section)) ?? WORKSPACES[0];
}

/** Longest nav path that is (or is an ancestor of) the current route — lets
 * deep sub-routes like /communities/:id highlight the right nav item without
 * hardcoding each one. */
export function activeNavPath(pathname: string, nav: NavItem[]): string | null {
  const matches = nav.filter((n) => pathname === n.path || pathname.startsWith(`${n.path}/`));
  if (matches.length === 0) return null;
  return matches.reduce((best, n) => (n.path.length > best.path.length ? n : best)).path;
}
