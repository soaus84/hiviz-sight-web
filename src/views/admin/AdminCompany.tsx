import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Tabs, Card, Btn } from '@/components';
import { COMPANY_DETAILS, updateCompanyDetails, ADMIN_DIVISIONS, ADMIN_REGIONS, addTag, updateTag, removeTag } from '@/data/admin/company';
import { TagList } from './TagList';

type CompanyTab = 'details' | 'divisions' | 'regions';
const VALID_TABS: CompanyTab[] = ['details', 'divisions', 'regions'];

const fieldLabel = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: colors.inkMuted, marginBottom: 5 };
const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13.5, outline: 'none' };

function DetailsForm() {
  const [details, setDetails] = useState(COMPANY_DETAILS);
  const set = (field: keyof typeof details) => (v: string) => setDetails((d) => ({ ...d, [field]: v }));
  const save = () => updateCompanyDetails(details);

  return (
    <Card pad={20} style={{ maxWidth: 560 }}>
      {([
        ['name', 'Company name'],
        ['legalName', 'Legal name'],
        ['abn', 'ABN'],
        ['address', 'Address'],
        ['timezone', 'Timezone'],
      ] as const).map(([field, label]) => (
        <div key={field} style={{ marginBottom: 16 }}>
          <label style={fieldLabel}>{label}</label>
          <input className="a-input" value={details[field]} onChange={(e) => set(field)(e.target.value)} style={inputStyle} />
        </div>
      ))}
      <Btn variant="primary" icon="check" onClick={save}>Save</Btn>
    </Card>
  );
}

export function AdminCompany() {
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab = (VALID_TABS as string[]).includes(tabParam || '') ? (tabParam as CompanyTab) : 'details';
  const setTab = (k: string) => setParams(k === 'details' ? {} : { tab: k });

  // Force a re-render after a TagList mutation — ADMIN_DIVISIONS/REGIONS are
  // plain mutable arrays, not React state (same reasoning as INSIGHTS
  // elsewhere in this app).
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);

  return (
    <div>
      <PageHead title="Company" sub="Company details, divisions and regions." />
      <Tabs value={tab} onChange={setTab} items={[{ k: 'details', label: 'Details' }, { k: 'divisions', label: 'Divisions', n: ADMIN_DIVISIONS.length }, { k: 'regions', label: 'Regions', n: ADMIN_REGIONS.length }]} />
      <div style={{ marginTop: 20 }}>
        {tab === 'details' && <DetailsForm />}
        {tab === 'divisions' && (
          <TagList
            noun="division"
            items={ADMIN_DIVISIONS}
            onAdd={(name, description) => { addTag(ADMIN_DIVISIONS, 'div', name, description); refresh(); }}
            onUpdate={(id, name, description) => { updateTag(ADMIN_DIVISIONS, id, name, description); refresh(); }}
            onDelete={(id) => { removeTag(ADMIN_DIVISIONS, id); refresh(); }}
          />
        )}
        {tab === 'regions' && (
          <TagList
            noun="region"
            items={ADMIN_REGIONS}
            onAdd={(name, description) => { addTag(ADMIN_REGIONS, 'reg', name, description); refresh(); }}
            onUpdate={(id, name, description) => { updateTag(ADMIN_REGIONS, id, name, description); refresh(); }}
            onDelete={(id) => { removeTag(ADMIN_REGIONS, id); refresh(); }}
          />
        )}
      </div>
    </div>
  );
}
