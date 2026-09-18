import { useNavigate } from 'react-router-dom';
import { colors, type Tone } from '@/tokens';
import { IconBtn, Badge, AINote, Btn, Fact } from '@/components';
import { SIGNAL_DISPLAY, energyLabel } from '@/data/observations';
import { BARRIER_ASSESSMENT_DISPLAY } from '@/views/incidents/incidentDisplay';
import { ClassificationCard, type ClassificationRow } from '@/views/shared/ClassificationCard';
import { Section } from '@/views/shared/SectionHeading';
import type { Observation } from '@/types';

const STATUS_LABEL: Record<Observation['status'], [string, Tone]> = {
  enriched: ['Enriched', 'primary'],
  classified: ['Classified', 'success'],
  linked: ['Linked to insight', 'info'],
};

export function ObsDetail({ o, onClose }: { o: Observation; onClose: () => void }) {
  const navigate = useNavigate();
  const s = SIGNAL_DISPLAY[o.signal_type];
  const [statusLabel] = STATUS_LABEL[o.status];

  const classificationNote =
    o.signal_type === 'barrier_failure'
      ? 'A live barrier failure — high confidence. This is checked against other sites the moment it’s submitted.'
      : o.signal_type === 'positive_performance'
      ? 'A control working as designed — captured as a positive to reinforce.'
      : 'An early signal worth watching — flagged for pattern matching across the region.';

  // Richer, confidence-scored classification (2026-09-15) — only some
  // observations have this (see AiClassification's own doc comment,
  // types/observation.ts); the rest keep the generic AINote below.
  const rows: ClassificationRow[] = [];
  if (o.signalClassification) rows.push({ label: 'Signal type', valueLabel: SIGNAL_DISPLAY[o.signalClassification.value].label, tone: SIGNAL_DISPLAY[o.signalClassification.value].tone, confidence: o.signalClassification.confidence, rationale: o.signalClassification.rationale });
  if (o.energyClassification) rows.push({ label: 'Energy', valueLabel: energyLabel(o.energyClassification.value), tone: o.energyClassification.value === 'none' ? 'warning' : 'error', confidence: o.energyClassification.confidence, rationale: o.energyClassification.rationale });
  if (o.barrierClassification) rows.push({ label: 'Barrier', valueLabel: BARRIER_ASSESSMENT_DISPLAY[o.barrierClassification.value].label, tone: BARRIER_ASSESSMENT_DISPLAY[o.barrierClassification.value].tone, confidence: o.barrierClassification.confidence, rationale: o.barrierClassification.rationale });
  const hasRichClassification = rows.length > 0 || !!o.keyHazard || !!o.safetyPracticeIds?.length;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <Badge tone={s.tone}>{s.label}</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: colors.inkSoft, flex: 1 }}>{o.id}</span>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.3 }}>{o.summary}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, marginTop: 8, fontWeight: 500 }}>{o.siteName} · {o.when}</div>

        {hasRichClassification ? (
          <Section title="Classification" subtitle="Signal, energy, and barrier classification for this observation, with confidence and rationale." style={{ marginTop: 18 }}>
            <ClassificationCard rows={rows} keyHazard={o.keyHazard} safetyPracticeIds={o.safetyPracticeIds} />
          </Section>
        ) : (
          <div style={{ marginTop: 18 }}>
            <AINote title="Hiviz classification">
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 9 }}>
                <Badge tone="primary" outline>{energyLabel(o.energy_type)}</Badge>
                <Badge tone={s.tone} outline>{o.signal_type}</Badge>
              </div>
              {classificationNote}
            </AINote>
          </div>
        )}

        <Section title="Detail" subtitle="Observer, site, and the energy type recorded.">
          <Fact k="Reported by" v={o.observerName} />
          <Fact k="Site" v={o.siteName} />
          <Fact k="When" v={o.when} />
          <Fact k="Energy" v={energyLabel(o.energy_type)} />
          <Fact k="Status" v={statusLabel} last />
        </Section>

        {o.status === 'linked' && o.linkedInsightId && (
          <div style={{ marginTop: 16 }}>
            <Btn variant="ghost" full onClick={() => { onClose(); navigate(`/insights/${o.linkedInsightId}`); }}>
              View the linked insight
            </Btn>
          </div>
        )}
      </div>
    </>
  );
}
