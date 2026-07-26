import { useEffect, useState } from 'react';
import { colors } from '@/tokens';
import { Icon } from '@/components';
import { REGIONS, COMPANY, type RegionName } from '@/data/regions';
import { DIVISIONS, ALL_DIVISIONS, type DivisionName } from '@/data/divisions';
import { purviewLabel, purviewIcon, regionCompatibleWithDivision, divisionCompatibleWithRegion } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { useActiveUser } from '@/state/ActiveUser';

// PREVIEW ONLY — mock subdivisions for the Option A ("inline nested tree")
// review, not wired into the real purview model. Subdivision isn't a field
// on PurviewFilter/PurviewScopeValue yet, so selecting one here just selects
// its parent Division for real (same as clicking the Division row) and
// tracks the specific subdivision purely as local UI state for the
// checkmark — the trigger button/purviewLabel still only ever reads
// Region/Division. Promoting this to something that actually narrows
// results would mean giving Subdivision the same typed
// treatment Region/Division already have (a literal union, a
// `subdivisionMatchesScope`, a third PurviewFilter field) — deliberately
// out of scope here. Easy to strip: this block + the two bits marked
// "subdivision preview" below.
const SUBDIVISIONS_MOCK: Partial<Record<DivisionName, string[]>> = {
  'Iron Ore': ['Crushing & Screening', 'Rail & Port'],
  Gold: ['Open Pit'],
};

export function PurviewSwitcher() {
  const [open, setOpen] = useState(false);
  const [expandedDivision, setExpandedDivision] = useState<DivisionName | null>(null); // subdivision preview
  const [selectedSubdivision, setSelectedSubdivision] = useState<string | null>(null); // subdivision preview
  const { region, division, homeRegion, homeDivision, setRegion, setDivision, setCompany } = usePurviewScope();
  const { user } = useActiveUser();

  // subdivision preview — the real region/division already reset themselves
  // on user-switch (PurviewScopeProvider's own effect keyed on the active
  // user), but this local state doesn't hear about that at all, so a stale
  // subdivision can keep showing as selected after switching personas. The
  // real fix is giving Subdivision the same typed, model-driven treatment
  // Region/Division already have (see the block comment above) so it
  // resets through that exact same effect instead of two local patches:
  //
  // 1. Mirrors PurviewScopeProvider's own trigger directly — reset
  //    whenever the active user identity changes, full stop. Needed
  //    because a value-only comparison (below) can't tell "Renee's home
  //    division is coincidentally also Gold" apart from "still Jordan's
  //    Gold" — the string never changes, so nothing else would catch it.
  useEffect(() => {
    setSelectedSubdivision(null);
    setExpandedDivision(null);
  }, [user.email]);

  // 2. Catches everything else that can move division out from under a
  //    selected subdivision without going through this component's own
  //    handlers (e.g. the "Back to my purview" reset).
  useEffect(() => {
    const stillValid = division !== ALL_DIVISIONS && SUBDIVISIONS_MOCK[division]?.includes(selectedSubdivision ?? '');
    if (selectedSubdivision && !stillValid) {
      setSelectedSubdivision(null);
      setExpandedDivision(null);
    }
  }, [division, selectedSubdivision]);

  // Selecting an already-selected item clears just that axis, instead of
  // forcing a detour through "Company" to get back to a single filter.
  // subdivision preview — also collapses whatever tree was expanded,
  // otherwise a division could sit open with no selected/selectable
  // subdivision under it once you've moved off it.
  const toggleDivision = (d: DivisionName) => { setDivision(d === division ? ALL_DIVISIONS : d); setSelectedSubdivision(null); setExpandedDivision(null); setOpen(false); };
  const toggleRegion = (r: RegionName) => { setRegion(r === region ? COMPANY : r); setOpen(false); };
  // subdivision preview — real division selection, cosmetic subdivision
  // state. Clicking the already-selected subdivision again drops back to
  // just the division (matching the Division/Region toggle-off pattern),
  // rather than re-selecting the same thing with no way out except the
  // division row itself.
  const selectSubdivision = (d: DivisionName, sub: string) => {
    if (d === division && sub === selectedSubdivision) {
      setSelectedSubdivision(null);
    } else {
      setDivision(d);
      setSelectedSubdivision(sub);
    }
    setOpen(false);
  };

  // subdivision preview — mirrors purviewLabel's part-joining, with the
  // subdivision (if any) inserted between Division and Region so the
  // trigger doesn't silently drop it once the popover closes. Safe to
  // reuse `division` directly here since selectedSubdivision is only ever
  // set alongside a specific (non-ALL_DIVISIONS) division.
  const triggerLabel = selectedSubdivision
    ? [division, selectedSubdivision, region !== COMPANY ? region : null].filter(Boolean).join(' · ')
    : purviewLabel(region, division);

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="a-ws"
        onClick={() => setOpen((v) => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 'var(--radius-md)' }}
      >
        <Icon name={purviewIcon(region, division)} size={18} color={colors.inkSoft} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, color: colors.ink }}>{triggerLabel}</span>
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
              onClick={() => { setCompany(); setSelectedSubdivision(null); setExpandedDivision(null); setOpen(false); }}
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
              // subdivision preview — the swatch/background stays lit for the
              // whole division whenever one of its subdivisions is active
              // (the real filter is still scoped to this division either
              // way); the checkmark is reserved for the exact selection so
              // there's only ever one "this precisely" mark at a time.
              const on = d === division;
              const exactlySelected = on && !selectedSubdivision;
              const isHome = d === homeDivision;
              const compatible = divisionCompatibleWithRegion(d, region);
              const subdivisions = SUBDIVISIONS_MOCK[d]; // subdivision preview
              const expanded = expandedDivision === d; // subdivision preview
              return (
                <div key={d}>
                  <button
                    onClick={() => compatible && toggleDivision(d)}
                    disabled={!compatible}
                    title={compatible ? undefined : `No ${d} sites in ${region}`}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', background: on ? colors.fill : 'transparent', border: 'none', cursor: compatible ? 'pointer' : 'not-allowed', textAlign: 'left', opacity: compatible ? 1 : 0.4 }}
                  >
                    {subdivisions ? (
                      <span
                        onClick={(e) => { e.stopPropagation(); setExpandedDivision(expanded ? null : d); }}
                        style={{ display: 'flex', flexShrink: 0, padding: '10px 10px 10px 0', margin: '-10px -10px -10px 0' }}
                      >
                        <Icon name={expanded ? 'expand_more' : 'chevron_right'} size={16} color={colors.inkSoft} />
                      </span>
                    ) : (
                      <span style={{ width: 16, flexShrink: 0 }} />
                    )}
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
                    {exactlySelected && <Icon name="check" size={16} color={colors.ink} />}
                  </button>
                  {subdivisions && expanded && ( // subdivision preview
                    <div style={{ paddingLeft: 25 }}>
                      {subdivisions.map((sub) => {
                        const subOn = d === division && sub === selectedSubdivision;
                        return (
                          <button
                            key={sub}
                            onClick={() => compatible && selectSubdivision(d, sub)}
                            disabled={!compatible}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px 8px 6px', background: subOn ? colors.fill : 'transparent', border: 'none', cursor: compatible ? 'pointer' : 'not-allowed', textAlign: 'left', opacity: compatible ? 1 : 0.4 }}
                          >
                            <div style={{ width: 20, height: 20, borderRadius: 'var(--radius-sm)', background: subOn ? colors.hi : colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon name="subdirectory_arrow_right" size={12} color={subOn ? colors.hiInk : colors.inkMuted} />
                            </div>
                            <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600, color: colors.ink }}>{sub}</span>
                            {subOn && <Icon name="check" size={15} color={colors.ink} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
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
