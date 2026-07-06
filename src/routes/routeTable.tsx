import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/layout/AppShell';
import { Dashboard } from '@/views/dashboard/Dashboard';
import { Visits } from '@/views/visits/Visits';
import { VisitDetail } from '@/views/visits/VisitDetail';
import { PlanVisit } from '@/views/visits/PlanVisit';
import { Sites } from '@/views/sites/Sites';
import { SiteOverview } from '@/views/sites/SiteOverview';
import { SiteObservations } from '@/views/sites/SiteObservations';
import { SiteVisits } from '@/views/sites/SiteVisits';
import { SiteContacts } from '@/views/sites/SiteContacts';
import { SiteInsights } from '@/views/sites/SiteInsights';
import { Observations } from '@/views/observations/Observations';
import { Insights } from '@/views/insights/Insights';
import { Feed } from '@/views/communities/Feed';
import { MyCommunities } from '@/views/communities/MyCommunities';
import { CommunityDetail } from '@/views/communities/CommunityDetail';
import { CommunityThreadPage } from '@/views/communities/CommunityThreadPage';
import { Settings } from '@/views/settings/Settings';
import { NotFound } from '@/views/NotFound';

// Extracted so it can also be fed to createMemoryRouter for Storybook page
// stories — those stay in sync with real routing instead of a parallel copy.
export const routes = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'visits', element: <Visits /> },
      { path: 'visits/new', element: <PlanVisit /> },
      { path: 'visits/:id', element: <VisitDetail /> },
      { path: 'visits/:id/edit', element: <PlanVisit /> },
      { path: 'sites', element: <Sites /> },
      { path: 'sites/:id', element: <SiteOverview /> },
      { path: 'sites/:id/observations', element: <SiteObservations /> },
      { path: 'sites/:id/visits', element: <SiteVisits /> },
      { path: 'sites/:id/contacts', element: <SiteContacts /> },
      { path: 'sites/:id/insights', element: <SiteInsights /> },
      { path: 'observations', element: <Observations /> },
      { path: 'insights', element: <Insights /> },
      { path: 'insights/:id', element: <Insights /> },
      { path: 'communities', element: <Feed /> },
      { path: 'communities/mine', element: <MyCommunities /> },
      { path: 'communities/thread/:id', element: <CommunityThreadPage /> },
      { path: 'communities/:id', element: <CommunityDetail /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
