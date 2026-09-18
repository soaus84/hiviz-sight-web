import { colors } from '@/tokens';
import type { Tone } from '@/tokens';
import { Icon, Badge } from '@/components';
import { SAFETY_PRACTICES } from '@/data/admin/taxonomies';
import type { KeyHazard } from '@/types';

export interface ClassificationRow {
  label: string;
  valueLabel: string;
  tone: Tone;
  confidence: number;
  rationale: string;
}

/** Renders the richer, confidence-scored AI classification (AiClassification,
 * types/observation.ts) an Observation/Incident may carry — 2026-09-15, see
 * [[project_investigation_timeline]]'s upstream-enrichment discussion: real
 * Hiviz shows each classification (Signal type/Energy/Barrier) with a
 * confidence score and a plain-English rationale, plus a synthesized "Key
 * hazard" statement and a set of implicated Safety practice tags, none of
 * which this prototype modeled before. Mirrors this app's own existing
 * value+confidence+rationale layout exactly — `InvestigationDetail.tsx`'s
 * "Forge Works Map® classification" block already established this shape
 * (bordered card, label row with a confidence check-mark, italic rationale
 * below) — reused rather than inventing a second look. `rows` is built by
 * the caller from whichever AiClassification fields the record actually
 * has (most don't — this is an optional enhancement, not a mandatory
 * field, see AiClassification's own doc comment) using the relevant
 * `*_DISPLAY` lookup for the label/tone. Returns null when there's nothing
 * to show, so a thin, unenriched record renders no empty section at all. */
export function ClassificationCard({ rows, keyHazard, safetyPracticeIds }: { rows: ClassificationRow[]; keyHazard?: KeyHazard; safetyPracticeIds?: string[] }) {
  if (rows.length === 0 && !keyHazard && !safetyPracticeIds?.length) return null;
  return (
    <>
      {rows.map((r, k) => (
        <div key={k} style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4 }}>{r.label}</span>
            <Badge tone={r.tone} outline>{r.valueLabel}</Badge>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: colors.green, marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="check" size={13} color={colors.green} />{r.confidence.toFixed(2)}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontStyle: 'italic', color: colors.inkSoft, lineHeight: 1.45 }}>{r.rationale}</div>
        </div>
      ))}
      {keyHazard && (
        <div style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px', marginBottom: 8 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Key hazard</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{keyHazard.title}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontStyle: 'italic', color: colors.inkSoft, lineHeight: 1.45 }}>{keyHazard.rationale}</div>
        </div>
      )}
      {!!safetyPracticeIds?.length && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Safety practices</div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {safetyPracticeIds.map((id) => {
              const p = SAFETY_PRACTICES.find((s) => s.id === id);
              return p ? <Badge key={id} tone="primary" outline icon={p.icon}>{p.name}</Badge> : null;
            })}
          </div>
        </div>
      )}
    </>
  );
}
