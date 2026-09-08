import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { IconBtn, LinkBtn } from '@/components';
import type { ReactNode } from 'react';

/** A header+close bar for the detail components that have never needed one
 * before (InsightDetail/InvestigationDetail/BarrierFailureDetail) because
 * they've only ever lived inline in a split-pane — used wherever one of
 * them is opened as a drawer instead, whether that's Focus opening it
 * primary or another page opening it nested one level deep over its own
 * primary view. Always carries a "Full record" escape hatch: a drawer this
 * shallow can't offer a board view, siblings, or filters, and per the
 * one-level-of-nesting rule (see e.g. StopWorkDrawer.tsx's onOpenSource),
 * this may be as deep as this particular view can go. */
export function DrawerPanel({ title, id, fullRecordPath, onClose, children }: { title: string; id: string; fullRecordPath: string; onClose: () => void; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 2 }}>{id}</div>
        </div>
        <LinkBtn size="sm" icon="open_in_new" onClick={() => navigate(fullRecordPath)}>Full record</LinkBtn>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        {children}
      </div>
    </>
  );
}
