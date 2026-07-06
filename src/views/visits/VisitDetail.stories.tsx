import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Detail Page/Visit Detail',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Single-visit detail page reached from Visits, the Dashboard live-visit card, or the site-history list on Site Detail. Its child observations open in a Drawer (the same ObsDetail used on the Observations page) so the visit stays in context underneath.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Live: Story = {
  render: () => <PageAt path="/visits/v1" />,
};

export const Past: Story = {
  render: () => <PageAt path="/visits/v5" />,
};

export const Upcoming: Story = {
  render: () => <PageAt path="/visits/v2" />,
};
