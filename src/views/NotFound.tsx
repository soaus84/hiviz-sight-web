import { Link } from 'react-router-dom';
import { colors } from '@/tokens';

export function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700, color: colors.ink }}>Page not found</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: colors.inkSoft, marginTop: 8 }}>
        <Link to="/dashboard" style={{ color: colors.ink, fontWeight: 700 }}>Back to Dashboard</Link>
      </div>
    </div>
  );
}
