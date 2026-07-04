import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/layout/AppShell';
import { Dashboard } from '@/views/dashboard/Dashboard';
import { Visits } from '@/views/visits/Visits';
import { Sites } from '@/views/sites/Sites';
import { SiteDetail } from '@/views/sites/SiteDetail';
import { Observations } from '@/views/observations/Observations';
import { Insights } from '@/views/insights/Insights';
import { Communities } from '@/views/communities/Communities';
import { CommunityThreadPage } from '@/views/communities/CommunityThreadPage';
import { Settings } from '@/views/settings/Settings';
import { NotFound } from '@/views/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'visits', element: <Visits /> },
      { path: 'sites', element: <Sites /> },
      { path: 'sites/:id', element: <SiteDetail /> },
      { path: 'observations', element: <Observations /> },
      { path: 'insights', element: <Insights /> },
      { path: 'insights/:id', element: <Insights /> },
      { path: 'communities', element: <Communities /> },
      { path: 'communities/thread/:id', element: <CommunityThreadPage /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
