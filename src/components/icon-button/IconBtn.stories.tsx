import type { Meta, StoryObj } from '@storybook/react';
import { IconBtn } from './IconBtn';

const meta: Meta<typeof IconBtn> = {
  title: 'Primitives/IconBtn',
  component: IconBtn,
};
export default meta;
type Story = StoryObj<typeof IconBtn>;

export const Playground: Story = {
  args: { name: 'notifications', active: false, badge: 3 },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <IconBtn name="search" />
      <IconBtn name="notifications" badge={3} />
      <IconBtn name="notifications" badge={3} active />
      <IconBtn name="menu" />
    </div>
  ),
};
