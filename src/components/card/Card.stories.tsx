import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Playground: Story = {
  args: { children: 'Card content', pad: 18, interactive: false },
};

export const Interactive: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Card pad={18}>Static card</Card>
      <Card pad={18} interactive onClick={() => {}}>Hover me (interactive)</Card>
    </div>
  ),
};
