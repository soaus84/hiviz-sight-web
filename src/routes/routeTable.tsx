import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/layout/AppShell';
import { MyWorkspace } from '@/views/me/MyWorkspace';
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
import { SiteIncidents } from '@/views/sites/SiteIncidents';
import { SiteControls } from '@/views/sites/SiteControls';
import { SiteControlDetail } from '@/views/sites/SiteControlDetail';
import { Observations } from '@/views/observations/Observations';
import { Insights } from '@/views/insights/Insights';
import { Incidents } from '@/views/incidents/Incidents';
import { Investigations } from '@/views/incidents/Investigations';
import { IncidentSites } from '@/views/incidents/IncidentSites';
import { IncidentDashboard } from '@/views/incidents/IncidentDashboard';
import { StopWork } from '@/views/incidents/StopWork';
import { RiskDashboard } from '@/views/risk/RiskDashboard';
import { BarrierFailures } from '@/views/risk/BarrierFailures';
import { WorkTypes } from '@/views/risk/WorkTypes';
import { WorkTypeDetail } from '@/views/risk/WorkTypeDetail';
import { Register } from '@/views/risk/Register';
import { HazardDetail } from '@/views/risk/HazardDetail';
import { ControlDetail } from '@/views/risk/ControlDetail';
import { RiskSites } from '@/views/risk/RiskSites';
import { Leaders } from '@/views/leaders/Leaders';
import { Feed } from '@/views/communities/Feed';
import { MyCommunities } from '@/views/communities/MyCommunities';
import { CommunityDetail } from '@/views/communities/CommunityDetail';
import { CommunityThreadPage } from '@/views/communities/CommunityThreadPage';
import { Settings } from '@/views/settings/Settings';
import { AdminCompany } from '@/views/admin/AdminCompany';
import { AdminStructure } from '@/views/admin/AdminStructure';
import { AdminUsers } from '@/views/admin/AdminUsers';
import { AdminTaxonomies } from '@/views/admin/AdminTaxonomies';
import { AdminWorksites } from '@/views/admin/AdminWorksites';
import { AdminApiTokens } from '@/views/admin/AdminApiTokens';
import { NotFound } from '@/views/NotFound';

// Extracted so it can also be fed to createMemoryRouter for Storybook page
// stories — those stay in sync with real routing instead of a parallel copy.
export const routes = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/me" replace /> },
      { path: 'me', element: <MyWorkspace /> },
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
      { path: 'sites/:id/incidents', element: <SiteIncidents /> },
      { path: 'sites/:id/controls', element: <SiteControls /> },
      { path: 'sites/:id/controls/:controlId', element: <SiteControlDetail /> },
      { path: 'observations', element: <Observations /> },
      { path: 'insights', element: <Insights /> },
      { path: 'insights/:id', element: <Insights /> },
      { path: 'incidents', element: <Incidents /> },
      { path: 'investigations', element: <Investigations /> },
      { path: 'investigations/:id', element: <Investigations /> },
      { path: 'incidents/sites', element: <IncidentSites /> },
      { path: 'incidents/dashboard', element: <IncidentDashboard /> },
      { path: 'incidents/stop-work', element: <StopWork /> },
      { path: 'risk/dashboard', element: <RiskDashboard /> },
      { path: 'risk/barrier-failures', element: <BarrierFailures /> },
      { path: 'risk/barrier-failures/:id', element: <BarrierFailures /> },
      { path: 'risk/work-types', element: <WorkTypes /> },
      { path: 'risk/work-types/:id', element: <WorkTypeDetail /> },
      { path: 'risk/register', element: <Register /> },
      { path: 'risk/register/:id', element: <HazardDetail /> },
      { path: 'risk/controls/:id', element: <ControlDetail /> },
      { path: 'risk/sites', element: <RiskSites /> },
      { path: 'leaders', element: <Leaders /> },
      { path: 'communities', element: <Feed /> },
      { path: 'communities/mine', element: <MyCommunities /> },
      { path: 'communities/thread/:id', element: <CommunityThreadPage /> },
      { path: 'communities/:id', element: <CommunityDetail /> },
      { path: 'settings', element: <Settings /> },
      { path: 'admin/company', element: <AdminCompany /> },
      { path: 'admin/structure', element: <AdminStructure /> },
      { path: 'admin/users', element: <AdminUsers /> },
      { path: 'admin/taxonomies', element: <AdminTaxonomies /> },
      { path: 'admin/worksites', element: <AdminWorksites /> },
      { path: 'admin/api-tokens', element: <AdminApiTokens /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
