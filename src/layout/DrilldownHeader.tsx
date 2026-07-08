import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Icon } from '@/components';

export interface DrilldownHeaderProps {
  icon: string;
  title: string;
  backPath: string;
  collapsed?: boolean;
}

export function DrilldownHeader({ icon, title, backPath, collapsed }: DrilldownHeaderProps) {
  const navigate = useNavigate();

  return (
    <div style={{ padding: collapsed ? '0 8px 14px' : '0 12px 14px' }}>
      <button
        className="a-nav"
        onClick={() => navigate(backPath)}
        title={collapsed ? 'Back' : undefined}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 9,
          padding: collapsed ? '8px 0' : '8px 10px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: colors.sideMuted,
          marginBottom: 10,
        }}
      >
        <Icon name="arrow_back" size={17} color={colors.sideMuted} />
        {!collapsed && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600 }}>Back</span>}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: collapsed ? 0 : '0 10px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-md)', background: colors.hi, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={15} color={colors.hiInk} />
        </div>
        {!collapsed && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        )}
      </div>
    </div>
  );
}
