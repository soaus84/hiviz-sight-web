import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Filtered Table/Sites',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'One of 3 real "Filtered Table" pages (Sites, Observations, Settings → Users & Access). Shared shape: PageHead + Pills filter row + Search + DataTable. Compare this against Observations and Users & Access to catch drift (e.g. the Search width was found inconsistent — 240 vs 260 — and fixed to 260 everywhere).',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <PageAt path="/sites" />,
};
