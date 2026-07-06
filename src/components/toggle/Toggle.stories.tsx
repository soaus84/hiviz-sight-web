import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Primitives/Toggle',
  component: Toggle,
};
export default meta;
type Story = StoryObj<typeof Toggle>;

export const Interactive: Story = {
  render: function Render() {
    const [checked, setChecked] = useState(true);
    return <Toggle checked={checked} onChange={setChecked} />;
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Toggle checked={true} onChange={() => {}} />
      <Toggle checked={false} onChange={() => {}} />
      <Toggle checked={true} onChange={() => {}} disabled />
      <Toggle checked={false} onChange={() => {}} disabled />
    </div>
  ),
};
