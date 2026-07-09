import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Tabbed Content/Visits',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'One of 2 "Tabbed Content" pages (with Settings). Same PageHead + Tabs shape as Settings — the "Upcoming" tab is a standard table, with any in-progress visit sorting to the top and showing a pulsing "Live" status in place of the usual briefing badge.',
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
