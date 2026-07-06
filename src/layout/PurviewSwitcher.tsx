import { useState } from 'react';
import { colors } from '@/tokens';
import { Icon } from '@/components';
import { REGIONS, COMPANY, type RegionName } from '@/data/regions';
import { DIVISIONS, ALL_DIVISIONS, type DivisionName } from '@/data/divisions';
import { purviewLabel, purviewIcon, regionCompatibleWithDivision, divisionCompatibleWithRegion } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';

export function PurviewSwitcher() {
  const [open, setOpen] = useState(false);
  const { region, division, homeRegion, homeDivision, setRegion, setDivision, setCompany } = usePurviewScope();

  // Selecting an already-selected item clears just that axis, instead of
  // forcing a detour through "Company" to get back to a single filter.
  const toggleDivision = (d: DivisionName) => { setDivision(d === division ? ALL_DIVISIONS : d); setOpen(false); };
  const toggleRegion = (r: RegionName) => { setRegion(r === region ? COMPANY : r); setOpen(false); };

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="a-ws"
        onClick={() => setOpen((v) => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 'var(--radius-md)' }}
      >
        <Icon name={purviewIcon(region, division)} size={18} color={colors.inkSoft} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, color: colors.ink }}>{purviewLabel(region, division)}</span>
        <Icon name="expand_more" size={18} color={colors.inkMuted} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div
            className="a-pop"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 6,
              width: 250,
              background: colors.panel,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-popover)',
              zIndex: 70,
              overflow: 'hidden',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.inkMuted, padding: '10px 14px 6px' }}>
              Switch purview
            </div>
            <button
              onClick={() => { setCompany(); setOpen(false); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', background: region === COMPANY && division === ALL_DIVISIONS ? colors.fill : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: region === COMPANY && division === ALL_DIVISIONS ? colors.hi : colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="corporate_fare" size={17} color={region === COMPANY && division === ALL_DIVISIONS ? colors.hiInk : colors.inkSoft} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, color: colors.ink }}>Company</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkSoft, marginTop: 1 }}>Every region, every division</div>
              </div>
              {region === COMPANY && division === ALL_DIVISIONS && <Icon name="check" size={16} color={colors.ink} />}
            </button>

            <div style={{ height: 1, background: colors.rule, margin: '4px 0' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.inkMuted, padding: '6px 14px 6px' }}>
              Divisions
            </div>
            {DIVISIONS.map((d) => {
              const on = d === division;
              const isHome = d === homeDivision;
              const compatible = divisionCompatibleWithRegion(d, region);
              return (
                <button
                  key={d}
                  onClick={() => compatible && toggleDivision(d)}
                  disabled={!compatible}
                  title={compatible ? undefined : `No ${d} sites in ${region}`}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', background: on ? colors.fill : 'transparent', border: 'none', cursor: compatible ? 'pointer' : 'not-allowed', textAlign: 'left', opacity: compatible ? 1 : 0.4 }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: on ? colors.hi : colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="category" size={17} color={on ? colors.hiInk : colors.inkSoft} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, color: colors.ink }}>{d}</div>
                    {!compatible ? (
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkSoft, marginTop: 1 }}>No sites in {region}</div>
                    ) : isHome ? (
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkSoft, marginTop: 1 }}>Your home division</div>
                    ) : null}
                  </div>
                  {on && <Icon name="check" size={16} color={colors.ink} />}
                </button>
              );
            })}

            <div style={{ height: 1, background: colors.rule, margin: '4px 0' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.inkMuted, padding: '6px 14px 6px' }}>
              Regions
            </div>
            {REGIONS.map((r) => {
              const on = r === region;
              const isHome = r === homeRegion;
              const compatible = regionCompatibleWithDivision(r, division);
              return (
                <button
                  key={r}
                  onClick={() => compatible && toggleRegion(r)}
                  disabled={!compatible}
                  title={compatible ? undefined : `No ${division} sites in ${r}`}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', background: on ? colors.fill : 'transparent', border: 'none', cursor: compatible ? 'pointer' : 'not-allowed', textAlign: 'left', opacity: compatible ? 1 : 0.4 }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: on ? colors.hi : colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="public" size={17} color={on ? colors.hiInk : colors.inkSoft} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, color: colors.ink }}>{r}</div>
                    {!compatible ? (
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkSoft, marginTop: 1 }}>No {division} sites here</div>
                    ) : isHome ? (
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkSoft, marginTop: 1 }}>Your home region</div>
                    ) : null}
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
