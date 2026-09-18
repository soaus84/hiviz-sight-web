import { useState } from 'react';
import { colors } from '@/tokens';
import { LinkBtn } from '@/components';
import { CRITICAL_CONTROLS, CRITICAL_CONTROLS_BY_ID, controlsForWorkTypes } from '@/data/risk';
import type { ControlType } from '@/types';

const inputStyle = { padding: '7px 9px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, outline: 'none', width: '100%' };

const CONTROL_TYPE_LABEL: Record<ControlType, string> = { prevention: 'Prevention', mitigation: 'Mitigation' };

/** A control `<select>` scoped by default to the Investigation's own work
 * type(s) (see data/risk.ts's controlsForWorkTypes), with a visible escape
 * hatch to the full register — a control from a different work type is
 * legitimately possible often enough (an adjacent trade, shared equipment,
 * a systemic finding) that this has to stay a default, not a constraint.
 * `allowedControlTypes` (see timelineDisplay.ts's allowedControlTypesFor)
 * additionally restricts by prevention/mitigation where the calling context
 * kind requires it — e.g. 'recovery' only makes sense for a mitigation
 * control, since recovery presupposes the top event already happened.
 * Once a control is picked, shows its real `failureConsequence` (and, once
 * more than one type is in play, its prevention/mitigation label) from the
 * register underneath — "a better control lookup" than a bare name in a
 * dropdown, so the investigator can confirm this is really the control that
 * mattered here before committing. Shared by ContextDrawer's create/edit
 * form wherever 'recovery'/'failure' needs one. */
export function ControlPicker({ relevantWorkTypeIds, allowedControlTypes, value, onChange }: { relevantWorkTypeIds: string[]; allowedControlTypes?: ControlType[]; value: string; onChange: (id: string) => void }) {
  const byType = allowedControlTypes ? (list: typeof CRITICAL_CONTROLS) => list.filter((c) => allowedControlTypes.includes(c.controlType)) : (list: typeof CRITICAL_CONTROLS) => list;
  const allEligible = byType(CRITICAL_CONTROLS);
  const relevant = byType(controlsForWorkTypes(relevantWorkTypeIds));
  const isFiltered = relevantWorkTypeIds.length > 0 && relevant.length < allEligible.length;
  const [showAll, setShowAll] = useState(!isFiltered);
  const options = showAll ? allEligible : relevant;
  const selected = value ? CRITICAL_CONTROLS_BY_ID[value] : undefined;

  return (
    <div>
      <select className="a-input" style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select a control…</option>
        {options.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {isFiltered && (
        <div style={{ marginTop: 4 }}>
          <LinkBtn onClick={() => setShowAll((v) => !v)}>{showAll ? 'Show relevant controls only' : `Show all controls (${allEligible.length})`}</LinkBtn>
        </div>
      )}
      {selected && (
        <div style={{ marginTop: 8, padding: '8px 10px', background: colors.fill, borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, lineHeight: 1.45 }}>
          <strong style={{ color: colors.ink }}>{CONTROL_TYPE_LABEL[selected.controlType]} — if this fails:</strong> {selected.failureConsequence}
        </div>
      )}
    </div>
  );
}
