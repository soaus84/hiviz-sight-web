import { colors, TONE } from '@/tokens';
import { RISK_RATING_MATRIX } from '@/data/risk';
import { SEVERITY_DISPLAY, LIKELIHOOD_DISPLAY } from './riskDisplay';
import type { Likelihood, SeverityClass } from '@/types';

const SEVERITIES: SeverityClass[] = ['minor', 'moderate', 'serious', 'critical'];
const LIKELIHOODS: Likelihood[] = ['rare', 'possible', 'likely'];

// Minor/Moderate share a first letter — an explicit abbreviation avoids two
// differently-coloured cells both reading "M", which relies on colour alone
// to disambiguate.
const RATING_ABBR: Record<SeverityClass, string> = { minor: 'Mn', moderate: 'Md', serious: 'Sr', critical: 'Cr' };

const cellStyle = { padding: '5px 4px', textAlign: 'center' as const, fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700 };

/** The popover content behind every "Risk rating" InfoTip — one shared
 * source so the explanation can't drift between WorkTypes.tsx and
 * RiskDashboard.tsx. Renders the actual RISK_RATING_MATRIX, not a
 * paraphrase of it, so "what does the calculation look like" has a literal
 * answer, not just a description of one. */
export function RiskRatingInfo() {
  return (
    <div>
      <div style={{ fontWeight: 700, color: colors.ink, marginBottom: 6 }}>Risk rating</div>
      <div style={{ marginBottom: 10 }}>
        A hazard's authored severity, adjusted by how often it's actually happened — barrier failures and incidents for that work type in the last 90 days. <strong>Likely</strong> bumps the rating up a band, <strong>rare</strong> drops it down a band, <strong>possible</strong> leaves it as authored.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={cellStyle} />
            {LIKELIHOODS.map((l) => (
              <th key={l} style={{ ...cellStyle, color: colors.inkMuted, textTransform: 'uppercase' }}>{LIKELIHOOD_DISPLAY[l].label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SEVERITIES.map((s) => (
            <tr key={s}>
              <td style={{ ...cellStyle, textAlign: 'left', color: colors.inkMuted, textTransform: 'uppercase' }}>{SEVERITY_DISPLAY[s].label}</td>
              {LIKELIHOODS.map((l) => {
                const rating = RISK_RATING_MATRIX[s][l];
                const d = SEVERITY_DISPLAY[rating];
                const [bg] = TONE[d.tone];
                return (
                  <td key={l} style={cellStyle}>
                    <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: 4, background: bg, color: '#fff' }}>{RATING_ABBR[rating]}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 8, fontSize: 11, color: colors.inkMuted }}>No hazard defined yet for a work type = not enough information for a rating.</div>
    </div>
  );
}
