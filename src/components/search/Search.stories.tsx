import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Search } from './Search';

const meta: Meta<typeof Search> = {
  title: 'Primitives/Search',
  component: Search,
};
export default meta;
type Story = StoryObj<typeof Search>;

export const Playground: Story = {
  args: { placeholder: 'Search sites, observations, people…', width: 340 },
};

export const Controlled: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    return <Search placeholder="Search observations" width={280} value={value} onChange={setValue} />;
  },
};
