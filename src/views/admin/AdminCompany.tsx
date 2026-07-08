import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Tabs, Card, Btn, DataTable, Drawer, IconBtn, Icon, type Column } from '@/components';
import { COMPANY_DETAILS, updateCompanyDetails } from '@/data/admin/company';
import { TERMINOLOGY_TERMS, updateTerminologyLabel, clearTerminologyLabel } from '@/data/admin/terminology';
import type { TerminologyTerm } from '@/types';

type CompanyTab = 'details' | 'terminology';
const VALID_TABS: CompanyTab[] = ['details', 'terminology'];

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

/** Fixed set of app-wide terms Admin can rename — see TerminologyTerm's doc
 * comment. No add/delete, only editing customLabel, so this doesn't reuse
 * TagList's add-a-new-record pattern. */
function TerminologyList() {
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);
  const [editing, setEditing] = useState<TerminologyTerm | null>(null);
  const [customLabel, setCustomLabel] = useState('');

  const openEdit = (t: TerminologyTerm) => { setEditing(t); setCustomLabel(t.customLabel ?? ''); };
  const close = () => setEditing(null);
  const save = () => {
    if (!editing) return;
    updateTerminologyLabel(editing.id, customLabel);
    refresh();
    close();
  };
  const revert = () => {
    if (!editing) return;
    clearTerminologyLabel(editing.id);
    refresh();
    close();
  };

  const cols: Column<TerminologyTerm>[] = [
    { key: 'defaultLabel', label: 'Term', render: (r) => <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.defaultLabel}</span> },
    { key: 'customLabel', label: 'Custom label', render: (r) => <span style={{ color: r.customLabel ? colors.ink : colors.inkMuted, fontStyle: r.customLabel ? 'normal' : 'italic' }}>{r.customLabel || '— default —'}</span> },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, marginBottom: 14, maxWidth: 640 }}>
        Override the terms used across the app. These aren't wired into live labels yet — stored here for when they are.
      </div>
      <DataTable columns={cols} rows={TERMINOLOGY_TERMS} rowKey="id" onRow={openEdit} empty="No terms yet." />

      <Drawer open={!!editing} onClose={close}>
        {editing && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
              <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>{editing.defaultLabel}</div>
              <IconBtn name="close" onClick={close} />
            </div>
            <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
              <label style={fieldLabel}>Custom label</label>
              <input className="a-input" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder={editing.defaultLabel} style={{ ...inputStyle, marginBottom: 16 }} autoFocus />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {editing.customLabel && <Btn variant="ghost" icon="restart_alt" onClick={revert}>Revert to default</Btn>}
                <div style={{ flex: 1 }} />
                <Btn variant="primary" icon="check" onClick={save}>Save</Btn>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}

export function AdminCompany() {
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab = (VALID_TABS as string[]).includes(tabParam || '') ? (tabParam as CompanyTab) : 'details';
  const setTab = (k: string) => setParams(k === 'details' ? {} : { tab: k });

  return (
    <div>
      <PageHead title="Company" sub="Company details and terminology." />
      <Tabs value={tab} onChange={setTab} items={[{ k: 'details', label: 'Details' }, { k: 'terminology', label: 'Terminology', n: TERMINOLOGY_TERMS.length }]} />
      <div style={{ marginTop: 20 }}>
        {tab === 'details' && <DetailsForm />}
        {tab === 'terminology' && <TerminologyList />}
      </div>
    </div>
  );
}
