import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Dashboard',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The only "Dashboard" pattern in the app: a 4-up Stat grid plus a mix of Cards. Not shared with any other page — kept here as the reference if a second dashboard-shaped page is ever proposed.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <PageAt path="/dashboard" />,
};
