import type { Meta, StoryObj } from '@storybook/react';
import { Eyebrow } from './Eyebrow';
import { colors } from '@/tokens';

const meta: Meta<typeof Eyebrow> = {
  title: 'Primitives/Eyebrow',
  component: Eyebrow,
};
export default meta;
type Story = StoryObj<typeof Eyebrow>;

export const Playground: Story = {
  args: { children: 'Needs your attention' },
};

export const WithAction: Story = {
  render: () => (
    <Eyebrow
      right={
        <button style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: colors.inkSoft, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
          View all
        </button>
      }
    >
      Needs your attention
    </Eyebrow>
  ),
};
