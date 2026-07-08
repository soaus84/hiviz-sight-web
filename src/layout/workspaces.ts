import { POSTS } from '@/data/communities';
import { countUnseenPosts } from '@/views/communities/unread';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: () => number | undefined;
}

export type WorkspaceId = 'insights' | 'communities' | 'admin';

export interface Workspace {
  id: WorkspaceId;
  label: string;
  icon: string;
  description: string;
  home: string;
  nav: NavItem[];
  /** Only offered in the workspace switcher when the active preview
   * persona has CurrentUser.isAdmin — see WorkspaceSwitcher. */
  adminOnly?: boolean;
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
      { path: '/visits', label: 'Visits', icon: 'calendar_today' },
      { path: '/observations', label: 'Observations', icon: 'visibility' },
      { path: '/leaders', label: 'Leaders', icon: 'shield_person' },
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
  {
    id: 'admin',
    label: 'Admin',
    icon: 'admin_panel_settings',
    description: 'Company, users, taxonomies & worksites',
    home: '/admin/company',
    adminOnly: true,
    nav: [
      { path: '/admin/company', label: 'Company', icon: 'apartment' },
      { path: '/admin/structure', label: 'Structure', icon: 'account_tree' },
      { path: '/admin/users', label: 'Users', icon: 'group' },
      { path: '/admin/taxonomies', label: 'Taxonomies', icon: 'sell' },
      { path: '/admin/worksites', label: 'Worksites', icon: 'domain' },
      { path: '/admin/api-tokens', label: 'API Tokens', icon: 'key' },
    ],
  },
];

/** Matches by top path segment rather than a full nav-path equality check —
 * Insights/Communities nav items sit one segment deep ('/sites',
 * '/communities') but Admin's sit two deep ('/admin/company'), so comparing
 * whole paths would never match Admin at all. */
export function workspaceForPath(pathname: string): Workspace {
  const section = pathname.split('/')[1];
  return WORKSPACES.find((w) => w.nav.some((n) => n.path.split('/')[1] === section)) ?? WORKSPACES[0];
}

/** Longest nav path that is (or is an ancestor of) the current route — lets
 * deep sub-routes like /communities/:id highlight the right nav item without
 * hardcoding each one. */
export function activeNavPath(pathname: string, nav: NavItem[]): string | null {
  const matches = nav.filter((n) => pathname === n.path || pathname.startsWith(`${n.path}/`));
  if (matches.length === 0) return null;
  return matches.reduce((best, n) => (n.path.length > best.path.length ? n : best)).path;
}
