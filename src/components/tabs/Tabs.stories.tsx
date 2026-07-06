import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Primitives/Tabs',
  component: Tabs,
};
export default meta;
type Story = StoryObj<typeof Tabs>;

const ITEMS = [
  { k: 'review', label: 'For review', n: 3 },
  { k: 'action', label: 'In action', n: 2 },
  { k: 'closed', label: 'Closed', n: 1 },
];

export const Interactive: Story = {
  render: function Render() {
    const [value, setValue] = useState('review');
    return <Tabs items={ITEMS} value={value} onChange={setValue} />;
  },
};

export const NoCounts: Story = {
  render: function Render() {
    const [value, setValue] = useState('account');
    return (
      <Tabs
        items={[{ k: 'account', label: 'Account' }, { k: 'notifications', label: 'Notifications' }, { k: 'access', label: 'Users & access', n: 6 }]}
        value={value}
        onChange={setValue}
      />
    );
  },
};
