import { useState } from 'react';
import { colors } from '@/tokens';
import { Icon } from '@/components';
import { useCommunityScope, type CommunityScope } from '@/state/CommunityScope';

const OPTIONS: { scope: CommunityScope; icon: string; label: string; hint: string }[] = [
  { scope: 'all', icon: 'public', label: 'All communities', hint: 'Everything across the org' },
  { scope: 'associated', icon: 'person_pin_circle', label: 'My communities', hint: 'Your org tier, plus what you’ve joined' },
];

/** Communities doesn't use region/division purview at all, so this takes
 * PurviewSwitcher's slot in the topbar there instead (see Topbar.tsx) —
 * same trigger/popover shape, but scoping Feed/Communities by org
 * membership rather than geography. */
export function CommunityScopeSwitcher() {
  const [open, setOpen] = useState(false);
  const { scope, setScope } = useCommunityScope();
  const current = OPTIONS.find((o) => o.scope === scope)!;

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="a-ws"
        onClick={() => setOpen((v) => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 'var(--radius-md)' }}
      >
        <Icon name={current.icon} size={18} color={colors.inkSoft} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, color: colors.ink }}>{current.label}</span>
        <Icon name="expand_more" size={18} color={colors.inkMuted} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div
            className="a-pop"
            style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, width: 240, background: colors.panel, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-popover)', zIndex: 70, overflow: 'hidden' }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.inkMuted, padding: '10px 14px 6px' }}>
              Show
            </div>
            {OPTIONS.map((o) => {
              const on = o.scope === scope;
              return (
                <button
                  key={o.scope}
                  onClick={() => { setScope(o.scope); setOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', background: on ? colors.fill : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: on ? colors.hi : colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={o.icon} size={17} color={on ? colors.hiInk : colors.inkSoft} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, color: colors.ink }}>{o.label}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkSoft, marginTop: 1 }}>{o.hint}</div>
                  </div>
                  {on && <Icon name="check" size={16} color={colors.ink} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
