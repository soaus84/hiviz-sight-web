import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from './Drawer';
import { Btn } from '../button/Btn';
import { Icon } from '../icon/Icon';
import { colors } from '@/tokens';

const meta: Meta<typeof Drawer> = {
  title: 'Primitives/Drawer',
  component: Drawer,
};
export default meta;
type Story = StoryObj<typeof Drawer>;

export const Interactive: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Btn onClick={() => setOpen(true)}>Open drawer</Btn>
        <Drawer open={open} onClose={() => setOpen(false)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: colors.inkSoft }}>OB-5821</span>
            <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', width: 34, height: 34, borderRadius: 8, border: 'none', background: colors.fill, cursor: 'pointer' }}>
              <Icon name="close" size={18} />
            </button>
          </div>
          <div style={{ padding: 22 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, fontWeight: 700 }}>
              Spotter not in position when an excavator began reversing near the live haul road.
            </div>
          </div>
        </Drawer>
      </div>
    );
  },
};
