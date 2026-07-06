import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Thread/Community Thread',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The only "Thread/detail with replies" pattern: back-link + main post Card + AINote + reply Cards + composer. Reached from Communities by opening a post.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <PageAt path="/communities/thread/p1" />,
};
