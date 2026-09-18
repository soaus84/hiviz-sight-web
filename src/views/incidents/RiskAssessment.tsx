import { useState } from 'react';
import { colors } from '@/tokens';
import { Badge, Btn, IconBtn, Drawer } from '@/components';
import { Section } from '@/views/shared/SectionHeading';
import { updateControlAssessment, removeControlAssessment } from '@/data/investigations';
import { WORKSITE_CONTROL_STATUS_DISPLAY } from '@/views/risk/riskDisplay';
import { AddControlDrawer } from './AddControlDrawer';
import type { ControlAssessment, WorksiteControlStatus } from '@/types';

const selectStyle = { padding: '5px 8px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, outline: 'none', flexShrink: 0 };
const noteStyle = { width: '100%', padding: '6px 8px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, lineHeight: 1.4, resize: 'vertical' as const, outline: 'none' };

const STATUS_OPTIONS = Object.keys(WORKSITE_CONTROL_STATUS_DISPLAY) as WorksiteControlStatus[];

function AssessmentRow({ a, isFirst, canEdit, onChangeStatus, onChangeNote, onRemove }: {
  a: ControlAssessment;
  isFirst: boolean;
  canEdit: boolean;
  onChangeStatus: (status?: WorksiteControlStatus) => void;
  onChangeNote: (note: string) => void;
  onRemove: () => void;
}) {
  const info = a.status ? WORKSITE_CONTROL_STATUS_DISPLAY[a.status] : null;
  return (
    <div style={{ padding: '12px 0', borderTop: isFirst ? undefined : `1px solid ${colors.ruleSoft}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{a.controlName}</div>
        {canEdit ? (
          <select
            className="a-input" style={selectStyle} value={a.status ?? ''}
            onChange={(e) => onChangeStatus(e.target.value ? (e.target.value as WorksiteControlStatus) : undefined)}
          >
            <option value="">Not yet assessed</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{WORKSITE_CONTROL_STATUS_DISPLAY[s].label}</option>)}
          </select>
        ) : info ? (
          <Badge tone={info.tone}>{info.label}</Badge>
        ) : (
          <Badge tone="primary" outline>Not yet assessed</Badge>
        )}
        {canEdit && <IconBtn name="close" size={15} onClick={onRemove} />}
      </div>
      {canEdit ? (
        <textarea
          className="a-input" value={a.note ?? ''} onChange={(e) => onChangeNote(e.target.value)} rows={1}
          placeholder="Evidence or reasoning behind this status (optional)…" style={{ ...noteStyle, marginTop: 8 }}
        />
      ) : a.note ? (
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, marginTop: 6, lineHeight: 1.4 }}>{a.note}</div>
      ) : null}
    </div>
  );
}

/** ICAM-style Risk assessment — see [[project_investigation_timeline]]'s
 * 2026-09-18 discussion. The investigator explicitly adds the controls
 * worth judging (via `AddControlDrawer`, scoped to the investigation's
 * relevant work type(s)) and judges each one's real state at the time of
 * the incident, reusing `WorksiteControlStatus` verbatim rather than a
 * bespoke pass/fail enum — this is the same real-world state a site
 * verifier already judges, just the investigator's own retrospective
 * account of it. Deliberately does not auto-create a Finding when a control
 * comes back not-in-place: a control finding can just as easily recommend a
 * brand-new control the register doesn't have at all, so this stays a
 * systematic checklist the investigator cross-references when tagging
 * timeline context, not a shortcut that writes findings on its own. */
export function RiskAssessment({ investigationId, canEdit, controlAssessments, relevantWorkTypeIds, onChanged }: {
  investigationId: string;
  canEdit: boolean;
  controlAssessments: ControlAssessment[];
  relevantWorkTypeIds: string[];
  onChanged?: () => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  if (controlAssessments.length === 0 && !canEdit) return null;

  return (
    <>
      <Section
        title="Risk assessment"
        subtitle="The controls relevant to this work — mark each one's real state at the time of the incident."
        footer={canEdit ? <Btn variant="ghost" size="sm" icon="add" onClick={() => setAddOpen(true)}>Add control</Btn> : undefined}
      >
        {controlAssessments.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkMuted, fontWeight: 500 }}>
            No controls added yet — add the controls worth judging using the button below.
          </div>
        ) : (
          controlAssessments.map((a, i) => (
            <AssessmentRow
              key={a.controlId} a={a} isFirst={i === 0} canEdit={canEdit}
              onChangeStatus={(status) => { updateControlAssessment(investigationId, a.controlId, { status }); onChanged?.(); }}
              onChangeNote={(note) => { updateControlAssessment(investigationId, a.controlId, { note: note || undefined }); onChanged?.(); }}
              onRemove={() => { removeControlAssessment(investigationId, a.controlId); onChanged?.(); }}
            />
          ))
        )}
      </Section>

      <Drawer open={addOpen} onClose={() => setAddOpen(false)}>
        {addOpen && (
          <AddControlDrawer
            investigationId={investigationId}
            relevantWorkTypeIds={relevantWorkTypeIds}
            existingControlIds={controlAssessments.map((a) => a.controlId)}
            onClose={() => setAddOpen(false)}
            onChanged={() => onChanged?.()}
          />
        )}
      </Drawer>
    </>
  );
}
