import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';
import { colors } from '@/tokens';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  argTypes: {
    tone: {
      control: 'select',
      options: ['(none)', 'hi'],
      mapping: { '(none)': undefined, hi: colors.hi },
      description: 'Only real usage is colors.hi (current-user / brand-toned avatars); everything else leaves tone unset for the default neutral fill.',
    },
  },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {
  args: { name: 'Jordan Marsh', size: 32 },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {[22, 28, 32, 38, 56].map((size) => (
        <Avatar key={size} name="Jordan Marsh" size={size} />
      ))}
    </div>
  ),
};

export const ToneAndRing: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Avatar name="Jordan Marsh" size={38} tone={colors.hi} />
      <Avatar name="Kwame Osei" size={22} ring />
      <div style={{ display: 'flex' }}>
        {['Kwame Osei', 'Tanya Morrow', 'Priya Singh'].map((n, k) => (
          <div key={n} style={{ marginLeft: k ? -7 : 0 }}>
            <Avatar name={n} size={22} ring />
          </div>
        ))}
      </div>
    </div>
  ),
};
