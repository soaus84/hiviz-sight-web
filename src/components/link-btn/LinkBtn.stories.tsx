import type { Meta, StoryObj } from '@storybook/react';
import { LinkBtn } from './LinkBtn';
import { colors } from '@/tokens';

const meta: Meta<typeof LinkBtn> = {
  title: 'Primitives/LinkBtn',
  component: LinkBtn,
  parameters: {
    docs: {
      description: {
        component:
          'Extracted from 7 identical copy-pasted instances found across the app (SiteDetail, Insights, ThreadView back-links; Dashboard x2 and NotifMenu text-links; ThreadView "View" attachment link). Every story below is a real usage, not an invented example.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof LinkBtn>;

export const Playground: Story = {
  args: { children: 'All sites', icon: 'arrow_back', size: 'md' },
};

export const BackLinkSize_md_UsedIn3Places: Story = {
  name: 'size="md" + icon — back-link (used 3×: SiteDetail, Insights, ThreadView)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <LinkBtn icon="arrow_back" size="md">All sites</LinkBtn>
      <LinkBtn icon="arrow_back" size="md">All insights</LinkBtn>
      <LinkBtn icon="arrow_back" size="md">Hot Works</LinkBtn>
    </div>
  ),
};

export const TextLinkSize_sm_UsedIn2Places: Story = {
  name: 'size="sm" (default), no icon — Eyebrow action (used 2×: Dashboard)',
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <LinkBtn>View all</LinkBtn>
      <LinkBtn>All observations</LinkBtn>
    </div>
  ),
};

export const TextLinkSize_xs_UsedIn1Place: Story = {
  name: 'size="xs" — notification panel header (used 1×: NotifMenu)',
  render: () => <LinkBtn size="xs">Mark all read</LinkBtn>,
};

export const ColorOverride_UsedIn1Place: Story = {
  name: 'style override (ink, no letter-spacing) — attachment row (used 1×: ThreadView)',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', maxWidth: 320 }}>
      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>Spotter-handover-checklist-v2.pdf</span>
      <LinkBtn size="sm" style={{ color: colors.ink, letterSpacing: 0 }}>View</LinkBtn>
    </div>
  ),
};
