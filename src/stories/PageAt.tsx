import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '@/routes/routeTable';

/**
 * Renders a real page at a given URL, using the actual route tree (same
 * AppShell/Sidebar/Topbar chrome as production) instead of a re-implemented
 * copy — so these "Views" stories can never silently drift from real routing.
 */
export function PageAt({ path }: { path: string }) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return <RouterProvider router={router} />;
}
