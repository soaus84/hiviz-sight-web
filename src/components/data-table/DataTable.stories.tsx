import type { Meta, StoryObj } from '@storybook/react';
import { DataTable, type Column } from './DataTable';
import { Badge } from '../badge/Badge';
import type { Tone } from '@/tokens';

interface Row {
  id: string;
  site: string;
  region: string;
  status: string;
  statusTone: Tone;
}

const ROWS: Row[] = [
  { id: 's1', site: 'Northgate Open Cut', region: 'Pilbara', status: 'On site now', statusTone: 'success' },
  { id: 's2', site: 'Ridgeback Processing', region: 'Newman, WA', status: 'Visit planned', statusTone: 'info' },
  { id: 's3', site: 'Coolinga Plant', region: 'Goldfields', status: 'At risk', statusTone: 'error' },
];

const COLUMNS: Column<Row>[] = [
  { key: 'site', label: 'Site', render: (r) => <span style={{ fontWeight: 700 }}>{r.site}</span> },
  { key: 'region', label: 'Region', w: 150, render: (r) => r.region },
  { key: 'status', label: 'Status', w: 160, render: (r) => <Badge tone={r.statusTone}>{r.status}</Badge> },
];

const meta: Meta<typeof DataTable> = {
  title: 'Primitives/DataTable',
  component: DataTable,
};
export default meta;
type Story = StoryObj<typeof DataTable>;

export const Default: Story = {
  render: () => <DataTable columns={COLUMNS} rows={ROWS} rowKey="id" onRow={() => {}} />,
};

export const Empty: Story = {
  render: () => <DataTable columns={COLUMNS} rows={[]} empty="No sites match these filters." />,
};

export const MobileStackedCards: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <DataTable columns={COLUMNS} rows={ROWS} rowKey="id" onRow={() => {}} />,
};
