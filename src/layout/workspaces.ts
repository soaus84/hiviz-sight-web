import { POSTS } from '@/data/communities';
import { countUnseenPosts } from '@/views/communities/unread';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: () => number | undefined;
  /** True for a nav item that's a shortcut into ANOTHER workspace's own
   * territory (e.g. My Workspace's link into Communities' real Feed) rather
   * than a page this workspace owns — excluded from workspaceForPath's
   * matching so visiting that path still resolves to its real owning
   * workspace (and shows that workspace's own nav), not this one. Without
   * this, whichever workspace is first in WORKSPACES to declare a nav item
   * on a given top path segment would silently "win" that segment. */
  external?: boolean;
}

export type WorkspaceId = 'me' | 'insights' | 'incident' | 'communities' | 'admin';

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
    // Icon is a Material Symbol name for every other workspace, but this
    // one renders the active persona's own avatar instead — see
    // WorkspaceSwitcher.tsx's `w.id === 'me'` special case. 'home' is still
    // set here as a harmless fallback (e.g. if that special case is ever
    // bypassed), never actually shown.
    id: 'me',
    label: 'My Workspace',
    icon: 'home',
    description: 'What needs your attention',
    home: '/me',
    nav: [
      // Focus's badge count is purview-scoped (region/division) and owner-
      // aware (Insight/Investigation), both React Context/props a plain
      // `() => number` badge factory can't reach. Sidebar.tsx special-cases
      // this one path instead of forcing every NavItem.badge to carry that
      // through a non-hook signature.
      //
      // Deliberately just these three items, not one per source workspace —
      // an earlier pass here duplicated every real workspace's own page
      // (My Insights, My Investigations, ...) as a second route pointing at
      // the same component with pre-filtered rows. That meant two ways to
      // reach identical content, and every internal navigate() call inside
      // the reused page (built for its own canonical route) would bounce
      // you out of My Workspace's nav context the moment you clicked
      // anything, since it always pushed the canonical path. Focus is the
      // one place "my stuff across every workspace" actually lives now;
      // there's nothing left for a per-type page to do that Focus's own
      // Pills filter (by workspace/type) doesn't already cover.
      { path: '/me', label: 'Focus', icon: 'center_focus_strong' },
      // Communities' Feed needs no dedicated page: it already filters to
      // isMyCommunity(community, user), so this is a shortcut into the
      // existing view, not a new one.
      { path: '/communities', label: 'Communities', icon: 'groups', external: true },
      { path: '/settings', label: 'Account', icon: 'account_circle' },
    ],
  },
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
  // Merged with the former standalone Risk workspace 2026-09-09 — kept as
  // one WorkspaceId/nav rather than two, since both were always "the same
  // people managing the same sites' safety picture," just two different
  // lenses on it. Stop Work and both Barrier Failures views were briefly
  // hidden from this nav (routes/components/Focus's own decision queue for
  // them were left untouched throughout) per an explicit "hide for now,
  // could resurface" prototype request — resurfaced 2026-09-15 once that
  // "for now" was up: easier day-to-day review of upcoming decisions,
  // rather than only reaching them via a linked-entity card from an
  // Incident/Investigation.
  {
    id: 'incident',
    label: 'Incident & Risk',
    icon: 'report',
    description: 'Incidents, investigations, work types & sites',
    home: '/incidents/dashboard',
    nav: [
      { path: '/incidents/dashboard', label: 'Dashboard', icon: 'grid_view' },
      { path: '/investigations', label: 'Investigations', icon: 'search' },
      { path: '/incidents', label: 'Incidents', icon: 'report' },
      { path: '/incidents/stop-work', label: 'Stop Work', icon: 'front_hand' },
      { path: '/risk/dashboard', label: 'Risk Overview', icon: 'shield' },
      { path: '/risk/critical-barrier-failures', label: 'Critical Barrier Failures', icon: 'fact_check' },
      { path: '/risk/barrier-failures', label: 'Barrier Failures', icon: 'gpp_bad' },
      { path: '/risk/work-types', label: 'Work Types', icon: 'engineering' },
      { path: '/risk/register', label: 'Register', icon: 'list_alt' },
      { path: '/incidents/sites', label: 'Sites', icon: 'location_on' },
      { path: '/risk/sites', label: 'Risk Sites', icon: 'domain' },
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
      { path: '/communities/mine', label: 'Communities', icon: 'groups' },
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
  return WORKSPACES.find((w) => w.nav.some((n) => !n.external && n.path.split('/')[1] === section)) ?? WORKSPACES[0];
}

/** Longest nav path that is (or is an ancestor of) the current route — lets
 * deep sub-routes like /communities/:id highlight the right nav item without
 * hardcoding each one. */
export function activeNavPath(pathname: string, nav: NavItem[]): string | null {
  const matches = nav.filter((n) => pathname === n.path || pathname.startsWith(`${n.path}/`));
  if (matches.length === 0) return null;
  return matches.reduce((best, n) => (n.path.length > best.path.length ? n : best)).path;
}
