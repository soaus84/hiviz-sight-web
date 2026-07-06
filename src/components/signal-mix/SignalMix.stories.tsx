import type { Meta, StoryObj } from '@storybook/react';
import { SignalMix } from './SignalMix';

const meta: Meta<typeof SignalMix> = {
  title: 'Primitives/SignalMix',
  component: SignalMix,
};
export default meta;
type Story = StoryObj<typeof SignalMix>;

export const Playground: Story = {
  args: { s: { pos: 2, weak: 3, barrier: 1 } },
};

export const Empty: Story = {
  args: { s: undefined },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SignalMix s={{ pos: 3, weak: 0, barrier: 0 }} />
      <SignalMix s={{ pos: 0, weak: 2, barrier: 1 }} />
      <SignalMix s={undefined} />
    </div>
  ),
};
