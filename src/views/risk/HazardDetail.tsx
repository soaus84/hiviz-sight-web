import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PageHead, Card, Badge, Btn, IconBtn, LinkBtn, Icon, Drawer } from '@/components';
import {
  HAZARDS, CRITICAL_CONTROLS, WORKSITE_CONTROLS, pushControlToSites, statusLabel,
  addHazard, updateHazard, deleteHazard, addControl, updateControl, deleteControl,
} from '@/data/risk';
import { SITES } from '@/data/sites';
import { energyLabel } from '@/data/observations';
import { HIGH_RISK_WORK } from '@/data/admin/taxonomies';
import { SEVERITY_DISPLAY } from './riskDisplay';
import type { ControlType, CriticalControl, EnergyType, Hazard, SeverityClass, VerificationFrequency, WorksiteControlStatus } from '@/types';

const FREQUENCY_LABEL: Record<VerificationFrequency, string> = {
  shift_start: 'Shift start', daily: 'Daily', before_ignition: 'Before ignition', event_triggered: 'Event triggered', weekly: 'Weekly',
};
const ENERGY_TYPES: EnergyType[] = ['kinetic', 'gravitational', 'electrical', 'thermal', 'chemical', 'pressure', 'noise_vibration', 'none'];
const SEVERITIES: SeverityClass[] = ['minor', 'moderate', 'serious', 'critical'];
const FREQUENCIES: VerificationFrequency[] = ['shift_start', 'daily', 'before_ignition', 'event_triggered', 'weekly'];

const fieldLabel = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: colors.inkMuted, marginBottom: 5 };
const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13.5, outline: 'none' };

function ControlCard({ control, onPush, onEdit }: { control: CriticalControl; onPush: () => void; onEdit: () => void }) {
  const instances = WORKSITE_CONTROLS.filter((wc) => wc.criticalControlId === control.id);
  const targetSites = SITES.filter((s) => s.workTypeIds.includes(HAZARDS.find((h) => h.id === control.hazardId)!.workTypeId));
  const untargeted = targetSites.length - instances.length;
  const byStatus = instances.reduce<Record<string, number>>((acc, wc) => { acc[wc.status] = (acc[wc.status] ?? 0) + 1; return acc; }, {});

  return (
    <Card pad={16} style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700 }}>{control.name}</div>
        <IconBtn name="edit" size={16} onClick={onEdit} />
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, lineHeight: 1.45, marginBottom: 10 }}>{control.verificationPrompt}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <Badge tone="primary" outline icon="schedule">{FREQUENCY_LABEL[control.verificationFrequency]}</Badge>
        <Badge tone="primary" outline icon="timer">{control.rectificationSlaHours}h SLA</Badge>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, marginBottom: 10 }}>
        {Object.entries(byStatus).map(([s, n]) => `${n} ${statusLabel(s as WorksiteControlStatus)}`).join(' · ') || 'Not pushed yet'}
      </div>
      {untargeted > 0 && (
        <Btn variant="ghost" size="sm" icon="send" onClick={onPush}>Push to {untargeted} more site{untargeted > 1 ? 's' : ''}</Btn>
      )}
    </Card>
  );
}

export function HazardEditDrawer({ hazard, defaultWorkTypeId, onClose, onSaved, onDeleted }: { hazard: Hazard | null; defaultWorkTypeId?: string; onClose: () => void; onSaved: (hazard: Hazard) => void; onDeleted: () => void }) {
  const [name, setName] = useState(hazard?.name ?? '');
  const [description, setDescription] = useState(hazard?.description ?? '');
  const [workTypeId, setWorkTypeId] = useState(hazard?.workTypeId ?? defaultWorkTypeId ?? HIGH_RISK_WORK[0].id);
  const [severityClass, setSeverityClass] = useState<SeverityClass>(hazard?.severityClass ?? 'moderate');
  const [energyType, setEnergyType] = useState<EnergyType>(hazard?.energyType ?? 'none');
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!name.trim()) return;
    const fields = { name: name.trim(), description: description.trim() || undefined, workTypeId, severityClass, energyType };
    const saved = hazard ? updateHazard(hazard.id, fields) : addHazard(fields);
    if (saved) onSaved(saved);
  };
  const remove = () => {
    if (!hazard) return;
    const result = deleteHazard(hazard.id);
    if (result.error) { setError(result.error); return; }
    onDeleted();
  };

  return (
    <Drawer open onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>{hazard ? 'Edit hazard' : 'New hazard'}</div>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <label style={fieldLabel}>Name</label>
        <input className="a-input" value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} autoFocus />

        <label style={fieldLabel}>Work type</label>
        <select className="a-input" value={workTypeId} onChange={(e) => setWorkTypeId(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }}>
          {HIGH_RISK_WORK.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={fieldLabel}>Severity</label>
            <select className="a-input" value={severityClass} onChange={(e) => setSeverityClass(e.target.value as SeverityClass)} style={inputStyle}>
              {SEVERITIES.map((s) => <option key={s} value={s}>{SEVERITY_DISPLAY[s].label}</option>)}
            </select>
          </div>
          <div>
            <label style={fieldLabel}>Energy type</label>
            <select className="a-input" value={energyType} onChange={(e) => setEnergyType(e.target.value as EnergyType)} style={inputStyle}>
              {ENERGY_TYPES.map((e) => <option key={e} value={e}>{energyLabel(e)}</option>)}
            </select>
          </div>
        </div>

        <label style={fieldLabel}>Description</label>
        <textarea className="a-input" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

        {error && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.red, fontWeight: 600, marginTop: 14 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          {hazard && <Btn variant="danger" icon="delete" onClick={remove}>Delete</Btn>}
          <div style={{ flex: 1 }} />
          <Btn variant="primary" icon="check" disabled={!name.trim()} onClick={save}>{hazard ? 'Save' : 'Create'}</Btn>
        </div>
      </div>
    </Drawer>
  );
}

function ControlEditDrawer({ hazardId, control, controlType, onClose, onSaved, onDeleted }: {
  hazardId: string; control: CriticalControl | null; controlType: ControlType; onClose: () => void; onSaved: () => void; onDeleted: () => void;
}) {
  const [name, setName] = useState(control?.name ?? '');
  const [verificationPrompt, setVerificationPrompt] = useState(control?.verificationPrompt ?? '');
  const [failureConsequence, setFailureConsequence] = useState(control?.failureConsequence ?? '');
  const [verificationFrequency, setVerificationFrequency] = useState<VerificationFrequency>(control?.verificationFrequency ?? 'shift_start');
  const [rectificationSlaHours, setRectificationSlaHours] = useState(control?.rectificationSlaHours ?? 4);
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim() && verificationPrompt.trim() && failureConsequence.trim();
  const save = () => {
    if (!canSave) return;
    const fields = { name: name.trim(), verificationPrompt: verificationPrompt.trim(), failureConsequence: failureConsequence.trim(), verificationFrequency, rectificationSlaHours };
    if (control) updateControl(control.id, fields);
    else addControl({ hazardId, controlType, ...fields });
    onSaved();
  };
  const remove = () => {
    if (!control) return;
    const result = deleteControl(control.id);
    if (result.error) { setError(result.error); return; }
    onDeleted();
  };

  return (
    <Drawer open onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>
          {control ? 'Edit control' : `New ${controlType} control`}
        </div>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <label style={fieldLabel}>Name</label>
        <input className="a-input" value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} autoFocus />

        <label style={fieldLabel}>Verification prompt</label>
        <textarea className="a-input" value={verificationPrompt} onChange={(e) => setVerificationPrompt(e.target.value)} rows={2} placeholder="The question a verifier answers…" style={{ ...inputStyle, resize: 'vertical', marginBottom: 16 }} />

        <label style={fieldLabel}>Failure consequence</label>
        <textarea className="a-input" value={failureConsequence} onChange={(e) => setFailureConsequence(e.target.value)} rows={2} placeholder="What happens if this control is absent…" style={{ ...inputStyle, resize: 'vertical', marginBottom: 16 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={fieldLabel}>Frequency</label>
            <select className="a-input" value={verificationFrequency} onChange={(e) => setVerificationFrequency(e.target.value as VerificationFrequency)} style={inputStyle}>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABEL[f]}</option>)}
            </select>
          </div>
          <div>
            <label style={fieldLabel}>Rectification SLA (hours)</label>
            <input className="a-input" type="number" min={1} value={rectificationSlaHours} onChange={(e) => setRectificationSlaHours(Number(e.target.value) || 1)} style={inputStyle} />
          </div>
        </div>

        {error && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.red, fontWeight: 600, marginTop: 14 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          {control && <Btn variant="danger" icon="delete" onClick={remove}>Delete</Btn>}
          <div style={{ flex: 1 }} />
          <Btn variant="primary" icon="check" disabled={!canSave} onClick={save}>{control ? 'Save' : 'Create'}</Btn>
        </div>
      </div>
    </Drawer>
  );
}

export function HazardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const hazard = HAZARDS.find((h) => h.id === id) ?? HAZARDS[0];
  const workType = HIGH_RISK_WORK.find((t) => t.id === hazard.workTypeId);
  const severity = SEVERITY_DISPLAY[hazard.severityClass];

  const prevention = CRITICAL_CONTROLS.filter((c) => c.hazardId === hazard.id && c.controlType === 'prevention');
  const mitigation = CRITICAL_CONTROLS.filter((c) => c.hazardId === hazard.id && c.controlType === 'mitigation');

  const [, forceRender] = useState(0);
  const refresh = () => forceRender((v) => v + 1);
  const handlePush = (controlId: string) => { pushControlToSites(controlId); refresh(); };

  const [editingHazard, setEditingHazard] = useState(false);
  const [controlDraft, setControlDraft] = useState<{ control: CriticalControl | null; controlType: ControlType } | null>(null);

  const cols = breakpoint === 'desktop' ? '1fr 260px 1fr' : '1fr';

  return (
    <div>
      <LinkBtn icon="arrow_back" size="md" onClick={() => navigate('/risk/register')} style={{ marginBottom: 16 }}>All hazards</LinkBtn>
      <PageHead
        title={hazard.name}
        sub={hazard.description}
        actions={<Btn variant="ghost" icon="edit" onClick={() => setEditingHazard(true)}>Edit hazard</Btn>}
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <Badge tone="primary" outline icon="engineering">{workType?.name ?? hazard.workTypeId}</Badge>
        <Badge tone={severity.tone}>{severity.label}</Badge>
        <Badge tone="primary" outline>{energyLabel(hazard.energyType)}</Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft }}>Prevention</div>
            <LinkBtn icon="add" onClick={() => setControlDraft({ control: null, controlType: 'prevention' })}>Add</LinkBtn>
          </div>
          {prevention.length === 0 && <Card pad={16} style={{ textAlign: 'center', color: colors.inkMuted, fontSize: 13 }}>No prevention controls yet.</Card>}
          {prevention.map((c) => <ControlCard key={c.id} control={c} onPush={() => handlePush(c.id)} onEdit={() => setControlDraft({ control: c, controlType: c.controlType })} />)}
        </div>

        <Card pad={20} style={{ textAlign: 'center', background: colors.fill, boxShadow: 'none' }}>
          <Icon name="hub" size={28} color={colors.inkSoft} />
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, marginTop: 10 }}>{hazard.name}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 6, lineHeight: 1.45 }}>{hazard.description}</div>
        </Card>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft }}>Mitigation</div>
            <LinkBtn icon="add" onClick={() => setControlDraft({ control: null, controlType: 'mitigation' })}>Add</LinkBtn>
          </div>
          {mitigation.length === 0 && <Card pad={16} style={{ textAlign: 'center', color: colors.inkMuted, fontSize: 13 }}>No mitigation controls yet.</Card>}
          {mitigation.map((c) => <ControlCard key={c.id} control={c} onPush={() => handlePush(c.id)} onEdit={() => setControlDraft({ control: c, controlType: c.controlType })} />)}
        </div>
      </div>

      {editingHazard && (
        <HazardEditDrawer
          hazard={hazard}
          onClose={() => setEditingHazard(false)}
          onSaved={() => { setEditingHazard(false); refresh(); }}
          onDeleted={() => navigate('/risk/register')}
        />
      )}

      {controlDraft && (
        <ControlEditDrawer
          hazardId={hazard.id}
          control={controlDraft.control}
          controlType={controlDraft.controlType}
          onClose={() => setControlDraft(null)}
          onSaved={() => { setControlDraft(null); refresh(); }}
          onDeleted={() => { setControlDraft(null); refresh(); }}
        />
      )}
    </div>
  );
}
