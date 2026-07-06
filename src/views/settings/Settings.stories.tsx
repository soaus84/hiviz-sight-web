import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Tabbed Content/Settings',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'One of 2 "Tabbed Content" pages (with Visits). Shared shape: PageHead + Tabs + tab-conditional content. The "Users & Access" tab is a Filtered Table in its own right — see Views/Filtered Table/Users & Access.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const AccountTab: Story = {
  render: () => <PageAt path="/settings" />,
};

export const NotificationsTab: Story = {
  render: () => <PageAt path="/settings?tab=notifications" />,
};
