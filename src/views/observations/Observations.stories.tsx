import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Filtered Table/Observations',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'One of 3 real "Filtered Table" pages. Same shape as Sites (PageHead + Pills + Search + DataTable), plus a Drawer for row detail — compare the filter row against Sites/Users & Access to catch drift.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const ListOnly: Story = {
  render: () => <PageAt path="/observations" />,
};

export const WithDrawerOpen: Story = {
  name: 'With detail drawer open (row selected)',
  render: () => <PageAt path="/observations?id=OB-5798" />,
};
