import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Feed + Sidebar/Feed',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Feed nav item of the Communities workspace — every discussion, poll and briefing across all communities, newest first. Selecting a post navigates to a full Thread page (see Views/Thread).',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <PageAt path="/communities" />,
};
