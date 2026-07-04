import { useState } from 'react';
import { colors } from '@/tokens';
import { Icon, Toggle } from '@/components';

export interface SettingRowProps {
  label: string;
  value: string;
  valueTone?: string;
  toggle?: boolean;
  on?: boolean;
  last?: boolean;
}

export function SettingRow({ label, value, valueTone, toggle, on, last }: SettingRowProps) {
  const [checked, setChecked] = useState(!!on);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: last ? 'none' : `1px solid ${colors.ruleSoft}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, marginTop: 2, fontWeight: 500 }}>{value}</div>
      </div>
      {valueTone && <Icon name="verified" size={18} color={valueTone} fill={1} />}
      {toggle && <Toggle checked={checked} onChange={setChecked} />}
    </div>
  );
}
