import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Filtered Table/Users & Access',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'One of 3 real "Filtered Table" pages (reached via Settings → Users & access tab). Slightly leaner than Sites/Observations — Search + Btn + DataTable, no Pills filter row — worth deciding whether that\'s intentional or a gap.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <PageAt path="/settings?tab=access" />,
};
