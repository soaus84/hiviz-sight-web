import { colors } from '@/tokens';
import { FW_FACTOR_DISPLAY, FW_DOMAIN_LABEL } from '@/views/shared/fwFactorDisplay';
import type { FwDomain, FwFactor } from '@/types';

const inputStyle = { padding: '7px 9px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, outline: 'none', width: '100%' };

const DOMAINS: FwDomain[] = ['guide', 'enable', 'execute'];
const FACTORS_BY_DOMAIN: Record<FwDomain, FwFactor[]> = DOMAINS.reduce((acc, d) => {
  acc[d] = (Object.keys(FW_FACTOR_DISPLAY) as FwFactor[]).filter((f) => FW_FACTOR_DISPLAY[f].domain === d);
  return acc;
}, {} as Record<FwDomain, FwFactor[]>);

/** A Forge Works Map® factor `<select>`, grouped by domain, showing the
 * real one-sentence description underneath once a factor is picked — same
 * "better lookup" pattern as ControlPicker's failure-consequence panel.
 * Descriptions come straight from the roadmap spec's own lightweight
 * selection-aid text (views/shared/fwFactorDisplay.ts), not paraphrased.
 * Used by ContextDrawer for 'systemic' contexts only — see
 * TimelineContext.fwFactor's own doc comment (types/timeline.ts). */
export function FwFactorPicker({ value, onChange }: { value: string; onChange: (factor: string) => void }) {
  const selected = value ? FW_FACTOR_DISPLAY[value as FwFactor] : undefined;
  return (
    <div>
      <select className="a-input" style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select a factor…</option>
        {DOMAINS.map((d) => (
          <optgroup key={d} label={FW_DOMAIN_LABEL[d]}>
            {FACTORS_BY_DOMAIN[d].map((f) => <option key={f} value={f}>{FW_FACTOR_DISPLAY[f].label}</option>)}
          </optgroup>
        ))}
      </select>
      {selected && (
        <div style={{ marginTop: 8, padding: '8px 10px', background: colors.fill, borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, lineHeight: 1.45 }}>
          {selected.description}
        </div>
      )}
    </div>
  );
}
