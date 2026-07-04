import { colors } from '@/tokens';
import { Icon } from '../icon/Icon';

export interface SearchProps {
  placeholder?: string;
  width?: number | string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Search({ placeholder = 'Search', width = 280, value, onChange }: SearchProps) {
  return (
    <div style={{ position: 'relative', width }}>
      <Icon
        name="search"
        size={18}
        color={colors.inkMuted}
        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      />
      <input
        className="a-input"
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        style={{
          fontFamily: 'var(--font-sans)',
          width: '100%',
          height: 38,
          padding: '0 12px 0 38px',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${colors.rule}`,
          background: colors.panel,
          fontSize: 13.5,
          color: colors.ink,
          outline: 'none',
        }}
      />
    </div>
  );
}
