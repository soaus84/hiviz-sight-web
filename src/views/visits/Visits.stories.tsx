import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Tabbed Content/Visits',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'One of 2 "Tabbed Content" pages (with Settings). Same PageHead + Tabs shape, but the "Active" tab is a bespoke live-visit layout rather than a table — compare against Settings to confirm the Tabs/PageHead composition itself stays consistent even when tab content differs.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const ActiveTab: Story = {
  render: () => <PageAt path="/visits" />,
};

export const UpcomingTab: Story = {
  render: () => <PageAt path="/visits?tab=upcoming" />,
};

export const PastTab: Story = {
  render: () => <PageAt path="/visits?tab=past" />,
};
