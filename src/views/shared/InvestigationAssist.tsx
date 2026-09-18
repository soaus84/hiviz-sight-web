import { colors } from '@/tokens';
import { AINote, Badge, Icon } from '@/components';
import { SuggestionCard } from './SuggestionCard';
import { WORK_STREAM_KIND_DISPLAY } from './workStreamDisplay';
import type { InvestigationAssistFields } from '@/types';

export function hasInvestigationAssist(d: InvestigationAssistFields): boolean {
  return !!(d.aiSuggestedRootCause || d.aiSuggestedContributingFactors?.length || d.aiSuggestedCorrectiveActions?.length || d.aiSuggestedInterviewQuestions?.length || d.aiFactorHint);
}

/** Renders `investigation.assist`'s output (see `InvestigationAssistFields`'
 * own doc comment, types/incident.ts) — shared because the same content
 * needs to render identically in two places: `SevereIncidentReview.tsx`
 * (the incident's own review-stage narrative) and `InvestigationDetail.tsx`
 * (carried over once progressed). One component so those two never drift
 * into different presentations of the same job's output — the same payoff
 * as `SuggestionCard`'s own extraction. Renders nothing but its own content
 * (no outer Card/section label) — callers decide how to frame it, since
 * InvestigationDetail nests this inside its existing Framework card while
 * SevereIncidentReview gives it its own. */
export function InvestigationAssist({ aiSuggestedRootCause, aiSuggestedRootCauseRationale, aiSuggestedContributingFactors, aiSuggestedCorrectiveActions, aiSuggestedInterviewQuestions, aiFactorHint }: InvestigationAssistFields) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Icon name="auto_awesome" size={14} color={colors.inkSoft} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.inkSoft }}>Investigation assist</span>
      </div>

      {aiFactorHint && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <Badge tone="primary" outline icon="auto_awesome">Preliminary factor: {aiFactorHint.factor}</Badge>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: colors.inkMuted }}>{aiFactorHint.confidence.toFixed(2)}</span>
        </div>
      )}

      {aiSuggestedRootCause && (
        <AINote title="Hiviz-suggested root cause" style={{ marginBottom: 12 }}>
          {aiSuggestedRootCause}
          {aiSuggestedRootCauseRationale && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(26,31,0,0.15)', fontStyle: 'italic', fontWeight: 500, color: 'rgba(26,31,0,0.65)' }}>
              {aiSuggestedRootCauseRationale}
            </div>
          )}
        </AINote>
      )}

      {!!aiSuggestedContributingFactors?.length && (
        <SuggestionCard icon="search" title="Hiviz-suggested contributing factors" subtitle="Use to focus what the investigation should confirm">
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {aiSuggestedContributingFactors.map((f, k) => (
              <li key={k} style={{ marginBottom: 10 }}>
                {f.factor}
                <div style={{ marginTop: 4, fontSize: 12.5, fontStyle: 'italic', color: colors.inkSoft }}>{f.rationale}</div>
              </li>
            ))}
          </ol>
        </SuggestionCard>
      )}

      {!!aiSuggestedCorrectiveActions?.length && (
        <SuggestionCard icon={WORK_STREAM_KIND_DISPLAY.improve.icon} title="Hiviz-suggested corrective actions" subtitle="Use to close the gap driving this incident">
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {aiSuggestedCorrectiveActions.map((a, k) => (
              <li key={k} style={{ marginBottom: 10 }}>
                {a.action}
                <div style={{ marginTop: 4, fontSize: 12.5, fontStyle: 'italic', color: colors.inkSoft }}>{a.rationale}</div>
              </li>
            ))}
          </ol>
        </SuggestionCard>
      )}

      {!!aiSuggestedInterviewQuestions?.length && (
        <SuggestionCard icon={WORK_STREAM_KIND_DISPLAY.learn.icon} title="Hiviz-suggested interview questions" subtitle="Use to confirm this during interviews">
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {aiSuggestedInterviewQuestions.map((q, k) => (
              <li key={k} style={{ marginBottom: 10 }}>
                {q.question}
                <div style={{ marginTop: 4, fontSize: 12.5, fontStyle: 'italic', color: colors.inkSoft }}>{q.rationale}</div>
              </li>
            ))}
          </ol>
        </SuggestionCard>
      )}
    </>
  );
}
