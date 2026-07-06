import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pills } from './Pills';

const meta: Meta<typeof Pills> = {
  title: 'Primitives/Pills',
  component: Pills,
};
export default meta;
type Story = StoryObj<typeof Pills>;

const ITEMS = [
  { k: 'all', label: 'All signals' },
  { k: 'barrier', label: 'Barriers' },
  { k: 'weak', label: 'Weak' },
  { k: 'positive', label: 'Positive' },
];

export const Interactive: Story = {
  render: function Render() {
    const [value, setValue] = useState('all');
    return <Pills items={ITEMS} value={value} onChange={setValue} />;
  },
};

export const WithCounts: Story = {
  render: function Render() {
    const [value, setValue] = useState('all');
    return (
      <Pills
        items={[
          { k: 'all', label: 'All', n: 7 },
          { k: 'live', label: 'On site now', n: 1 },
          { k: 'risk', label: 'At risk', n: 2 },
          { k: 'visit', label: 'Needs a visit', n: 2 },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};
