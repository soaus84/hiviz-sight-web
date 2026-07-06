import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Detail Page/Site (drilldown nav)',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The "YouTube Studio" drilldown pattern: opening a site replaces the sidebar\'s workspace switcher with a back button + site name, and the nav list below becomes Overview/Observations/Visits/Contacts/Insights — sections scoped entirely to this one site. Compare against Views/Feed + Sidebar or Views/Tabbed Content for the normal (non-drilldown) sidebar.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Overview: Story = {
  name: 'Overview — healthy site (Northgate Open Cut)',
  render: () => <PageAt path="/sites/s1" />,
};

export const OverviewAtRisk: Story = {
  name: 'Overview — at-risk site with AINote callout (Coolinga Plant)',
  render: () => <PageAt path="/sites/s4" />,
};

export const Observations: Story = {
  render: () => <PageAt path="/sites/s1/observations" />,
};

export const Visits: Story = {
  render: () => <PageAt path="/sites/s1/visits" />,
};

export const Contacts: Story = {
  render: () => <PageAt path="/sites/s1/contacts" />,
};

export const Insights: Story = {
  render: () => <PageAt path="/sites/s1/insights" />,
};
