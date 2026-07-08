import { useState } from 'react';
import { colors } from '@/tokens';
import { PageHead, Btn, Badge, DataTable, Drawer, Fact, Icon, IconBtn, type Column } from '@/components';
import { API_TOKENS, createApiToken, revokeApiToken } from '@/data/admin/apiTokens';
import type { ApiToken } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: colors.inkMuted, marginBottom: 5 };
const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13.5, outline: 'none' };

export function AdminApiTokens() {
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [revealed, setRevealed] = useState<{ token: ApiToken; fullValue: string } | null>(null);
  const [viewing, setViewing] = useState<ApiToken | null>(null);

  const openNew = () => { setAdding(true); setName(''); };
  const closeAll = () => { setAdding(false); setRevealed(null); setViewing(null); };

  const create = () => {
    if (!name.trim()) return;
    const result = createApiToken(name.trim());
    refresh();
    setAdding(false);
    setRevealed(result);
  };
  const revoke = () => {
    if (!viewing) return;
    revokeApiToken(viewing.id);
    refresh();
    closeAll();
  };

  const cols: Column<ApiToken>[] = [
    { key: 'name', label: 'Name', render: (r) => <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</span> },
    { key: 'token', label: 'Token', w: 200, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.tokenMasked}</span> },
    { key: 'createdAt', label: 'Created', w: 120, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.createdAt}</span> },
    { key: 'lastUsed', label: 'Last used', w: 120, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.lastUsed ?? 'Never'}</span> },
    { key: 'status', label: '', w: 110, render: (r) => r.status === 'active' ? <Badge tone="success">Active</Badge> : <Badge tone="primary" outline>Revoked</Badge> },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  const open = adding || !!revealed || !!viewing;

  return (
    <div>
      <PageHead title="API Tokens" sub="Tokens for programmatic access to this instance." actions={<Btn variant="accent" icon="add" onClick={openNew}>Add token</Btn>} />
      <DataTable columns={cols} rows={API_TOKENS} rowKey="id" onRow={setViewing} empty="No API tokens yet." />

      <Drawer open={open} onClose={closeAll}>
        {adding && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
              <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>New token</div>
              <IconBtn name="close" onClick={closeAll} />
            </div>
            <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
              <label style={fieldLabel}>Name</label>
              <input className="a-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Reporting export" style={inputStyle} autoFocus />
              <div style={{ marginTop: 20 }}>
                <Btn variant="primary" icon="check" full disabled={!name.trim()} onClick={create}>Create token</Btn>
              </div>
            </div>
          </>
        )}

        {revealed && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
              <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>{revealed.token.name}</div>
              <IconBtn name="close" onClick={closeAll} />
            </div>
            <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
              <div style={{ background: colors.hi, borderRadius: 'var(--radius-lg)', padding: '13px 15px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                  <Icon name="warning" size={15} color={colors.hiInk} fill={1} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.hiInk }}>Copy this now</span>
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.55, color: colors.hiInk, fontWeight: 600 }}>
                  You won't be able to see this token again once you close this panel.
                </div>
              </div>
              <label style={fieldLabel}>Token</label>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, padding: '10px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, wordBreak: 'break-all', marginBottom: 16 }}>
                {revealed.fullValue}
              </div>
              <Btn variant="ghost" icon="content_copy" full onClick={() => navigator.clipboard?.writeText(revealed.fullValue)}>Copy to clipboard</Btn>
              <div style={{ marginTop: 12 }}>
                <Btn variant="primary" full onClick={closeAll}>Done</Btn>
              </div>
            </div>
          </>
        )}

        {viewing && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
              <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>{viewing.name}</div>
              {viewing.status === 'active' ? <Badge tone="success">Active</Badge> : <Badge tone="primary" outline>Revoked</Badge>}
              <IconBtn name="close" onClick={closeAll} />
            </div>
            <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
              <div style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '4px 14px', marginBottom: 20 }}>
                <Fact k="Token" v={viewing.tokenMasked} />
                <Fact k="Created" v={viewing.createdAt} />
                <Fact k="Last used" v={viewing.lastUsed ?? 'Never'} last />
              </div>
              {viewing.status === 'active' && <Btn variant="danger" icon="block" full onClick={revoke}>Revoke token</Btn>}
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
