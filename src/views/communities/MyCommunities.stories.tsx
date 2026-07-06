import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Feed + Sidebar/My Communities',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'My Communities nav item of the Communities workspace — the communities you belong to, grouped by type with search. Selecting one opens its dedicated Community page (see Views/Master-Detail).',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <PageAt path="/communities/mine" />,
};
