import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import { colors } from '@/tokens';

const meta: Meta<typeof Icon> = {
  title: 'Primitives/Icon',
  component: Icon,
  argTypes: {
    color: {
      control: 'select',
      options: ['currentColor', 'inkSoft', 'inkMuted', 'red', 'amber', 'green', 'blue', 'hiInk'],
      mapping: {
        currentColor: 'currentColor', inkSoft: colors.inkSoft, inkMuted: colors.inkMuted,
        red: colors.red, amber: colors.amber, green: colors.green, blue: colors.blue, hiInk: colors.hiInk,
      },
      description: 'Defaults to currentColor (inherits from parent text color) when unset.',
    },
    fill: {
      control: 'select',
      options: [0, 1],
      description: '0 = outlined (default) · 1 = filled — Material Symbols variable-font fill axis.',
    },
  },
};
export default meta;
type Story = StoryObj<typeof Icon>;

export const Playground: Story = {
  args: { name: 'auto_awesome', size: 24, weight: 400, fill: 0 },
};

export const FillStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <Icon name="favorite" size={28} fill={0} />
      <Icon name="favorite" size={28} fill={1} />
      <Icon name="favorite" size={28} fill={1} color={colors.red} />
    </div>
  ),
};

export const SizesAndColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {[16, 20, 24, 32].map((size) => (
        <Icon key={size} name="visibility" size={size} color={colors.inkSoft} />
      ))}
      <Icon name="warning" size={24} color={colors.red} />
      <Icon name="check" size={24} color={colors.green} />
      <Icon name="auto_awesome" size={24} color={colors.hiInk} fill={1} />
    </div>
  ),
};
