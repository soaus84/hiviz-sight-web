import { useState } from 'react';
import { colors } from '@/tokens';
import { IconBtn, Btn, Badge, Icon, ListRow, LinkBtn } from '@/components';
import { CRITICAL_CONTROLS, HAZARDS_BY_ID, controlsForWorkTypes } from '@/data/risk';
import { addControlAssessment } from '@/data/investigations';
import { CONTROL_TYPE_LABEL } from '@/views/risk/riskDisplay';

/** The Risk assessment section's "Add control" surface — the investigator
 * ticks which controls are worth judging for this investigation, rather
 * than every control the relevant work type(s) carry being auto-enumerated
 * (a work type's full control set can run long, and not all of it bears on
 * any one incident — see [[project_investigation_timeline]]'s 2026-09-18
 * ICAM discussion). Same default-to-relevant-then-escape-hatch pattern as
 * ControlPicker.tsx, just multi-select instead of a single `<select>`,
 * since this adds several controls to the checklist at once rather than
 * picking one control for one context tag. */
export function AddControlDrawer({ investigationId, relevantWorkTypeIds, existingControlIds, onClose, onChanged }: {
  investigationId: string;
  relevantWorkTypeIds: string[];
  existingControlIds: string[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const allEligible = CRITICAL_CONTROLS.filter((c) => !existingControlIds.includes(c.id));
  const relevant = controlsForWorkTypes(relevantWorkTypeIds).filter((c) => !existingControlIds.includes(c.id));
  const isFiltered = relevantWorkTypeIds.length > 0 && relevant.length < allEligible.length;
  const [showAll, setShowAll] = useState(!isFiltered);
  const options = showAll ? allEligible : relevant;
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const handleAdd = () => {
    selected.forEach((id) => addControlAssessment(investigationId, id));
    onChanged();
    onClose();
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <Badge tone="primary" outline icon="add">Add control</Badge>
        <span style={{ flex: 1 }} />
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 22px' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, lineHeight: 1.5, padding: '14px 0' }}>
          Tick every control worth assessing for this investigation, pulled from the Risk register for the work involved.
        </div>
        {isFiltered && (
          <div style={{ marginBottom: 8 }}>
            <LinkBtn onClick={() => setShowAll((v) => !v)}>{showAll ? 'Show relevant controls only' : `Show all controls (${allEligible.length})`}</LinkBtn>
          </div>
        )}
        {options.map((c, i) => {
          const hazard = HAZARDS_BY_ID[c.hazardId];
          const checked = selected.has(c.id);
          return (
            <ListRow key={c.id} last={i === options.length - 1} onClick={() => toggle(c.id)}>
              <Icon name={checked ? 'check_box' : 'check_box_outline_blank'} size={20} color={checked ? colors.green : colors.inkMuted} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{CONTROL_TYPE_LABEL[c.controlType]}{hazard ? ` · ${hazard.name}` : ''}</div>
              </div>
            </ListRow>
          );
        })}
        {options.length === 0 && (
          <div style={{ padding: '20px 0', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>No more controls to add.</div>
        )}
      </div>
      <div style={{ padding: 16, borderTop: `1px solid ${colors.rule}` }}>
        <Btn variant="primary" full disabled={selected.size === 0} onClick={handleAdd}>
          Add {selected.size > 0 ? selected.size : ''} control{selected.size === 1 ? '' : 's'}
        </Btn>
      </div>
    </>
  );
}
