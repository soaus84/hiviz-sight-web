import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { colors } from '@/tokens';
import {
  Icon, Dot, Badge, Avatar, Btn, LinkBtn, IconBtn, Card, Eyebrow, PageHead,
  Tabs, Pills, Search, DataTable, Stat, AINote, Meter, SignalMix, Toggle,
  type Column,
} from '@/components';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <Eyebrow>{title}</Eyebrow>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
    </div>
  );
}

interface Row { id: string; site: string; status: string }
const ROWS: Row[] = [
  { id: 's1', site: 'Northgate Open Cut', status: 'On site now' },
  { id: 's2', site: 'Ridgeback Processing', status: 'Visit planned' },
];
const COLUMNS: Column<Row>[] = [
  { key: 'site', label: 'Site', render: (r) => <span style={{ fontWeight: 700 }}>{r.site}</span> },
  { key: 'status', label: 'Status', w: 160, render: (r) => <Badge tone="success">{r.status}</Badge> },
];

function AllComponents() {
  const [tab, setTab] = useState('review');
  const [pill, setPill] = useState('all');
  const [toggle, setToggle] = useState(true);

  return (
    <div style={{ maxWidth: 1100 }}>
      <PageHead title="Component library" sub="Every primitive in src/components, one of each state, for quick visual reference." />

      <Section title="Icon"><Icon name="auto_awesome" size={24} fill={1} color={colors.hiInk} /><Icon name="warning" size={24} color={colors.red} /><Icon name="check" size={24} color={colors.green} /></Section>
      <Section title="Dot"><Dot tone={colors.green} /><Dot tone={colors.amber} /><Dot tone={colors.red} pulse /></Section>
      <Section title="Badge"><Badge tone="primary">Primary</Badge><Badge tone="hi" dot>Hi</Badge><Badge tone="error" outline icon="warning">Outline</Badge><Badge tone="success" icon="check">Ready</Badge></Section>
      <Section title="Avatar"><Avatar name="Jordan Marsh" size={38} tone={colors.hi} /><Avatar name="Kwame Osei" size={28} ring /></Section>
      <Section title="Btn"><Btn variant="primary">Primary</Btn><Btn variant="accent" icon="add">Accent</Btn><Btn variant="ghost">Ghost</Btn><Btn variant="subtle">Subtle (0× used)</Btn><Btn variant="danger">Danger (0× used)</Btn></Section>
      <Section title="LinkBtn"><LinkBtn icon="arrow_back" size="md">All sites</LinkBtn><LinkBtn>View all</LinkBtn><LinkBtn size="xs">Mark all read</LinkBtn></Section>
      <Section title="IconBtn"><IconBtn name="search" /><IconBtn name="notifications" badge={3} active /></Section>
      <Section title="Card"><Card pad={16}>Static card</Card><Card pad={16} interactive onClick={() => {}}>Interactive card</Card></Section>
      <Section title="Eyebrow"><Eyebrow>Section label</Eyebrow></Section>
      <Section title="Tabs"><Tabs value={tab} onChange={setTab} items={[{ k: 'review', label: 'For review', n: 3 }, { k: 'action', label: 'In action', n: 2 }]} /></Section>
      <Section title="Pills"><Pills value={pill} onChange={setPill} items={[{ k: 'all', label: 'All', n: 7 }, { k: 'risk', label: 'At risk', n: 2 }]} /></Section>
      <Section title="Search"><Search placeholder="Search sites" width={260} /></Section>
      <Section title="Stat"><Stat label="Visits this week" value="4" sub="1 live · 3 planned" icon="calendar_today" /><Stat label="Open insights" value="12" sub="4 awaiting support" icon="lightbulb" /></Section>
      <Section title="AINote"><div style={{ maxWidth: 420 }}><AINote>A control working as designed — captured as a positive to reinforce.</AINote></div></Section>
      <Section title="Meter"><Meter value={64} tone={colors.red} /></Section>
      <Section title="SignalMix"><SignalMix s={{ pos: 2, weak: 3, barrier: 1 }} /></Section>
      <Section title="Toggle"><Toggle checked={toggle} onChange={setToggle} /></Section>
      <Section title="DataTable"><div style={{ width: '100%' }}><DataTable columns={COLUMNS} rows={ROWS} rowKey="id" /></div></Section>
    </div>
  );
}

const meta: Meta<typeof AllComponents> = {
  title: 'Overview/All components',
  component: AllComponents,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof AllComponents>;

export const AllPrimitives: Story = {
  render: () => (
    <div style={{ padding: 32, background: colors.bg, minHeight: '100vh' }}>
      <AllComponents />
    </div>
  ),
};
