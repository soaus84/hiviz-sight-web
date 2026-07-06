import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Master-Detail/Insights',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The only "Master-Detail" page in the app (360px card list + detail panel on desktop, two full-screen steps with a back link below desktop). If a second master-detail page is ever added, compare it here first. Also has a read-only Kanban alternative (`?view=board`) — Review/Action/Resolved columns, no drag-and-drop, clicking a card hands off to the normal list+detail view.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Desktop_ListAndDetail: Story = {
  render: () => <PageAt path="/insights" />,
};

export const Desktop_KanbanBoard: Story = {
  name: 'Desktop — Kanban board view',
  render: () => <PageAt path="/insights?view=board" />,
};

export const Desktop_DeepLinkedDetail: Story = {
  name: 'Desktop — deep-linked to a specific insight',
  render: () => <PageAt path="/insights/INS-2204" />,
};

export const Mobile_ListStep: Story = {
  name: 'Mobile — list step (single-column pattern)',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <PageAt path="/insights" />,
};

export const Mobile_DetailStep: Story = {
  name: 'Mobile — detail step with back link',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <PageAt path="/insights/INS-2204" />,
};
