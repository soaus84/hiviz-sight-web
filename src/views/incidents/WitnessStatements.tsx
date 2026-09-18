import { useState } from 'react';
import { colors } from '@/tokens';
import { Btn, IconBtn, Drawer } from '@/components';
import { Section } from '@/views/shared/SectionHeading';
import { WitnessStatementDrawer } from './WitnessStatementDrawer';
import type { InterviewQuestion, WitnessStatement } from '@/types';

/** One witness's account, shown in full — same "every field it actually
 * carries, not hidden behind a click" principle as ContextNarrative/FindingRow
 * (see [[project_investigation_timeline]]'s "long form it now" note): the
 * whole point of a witness statement is checking it against the timeline,
 * which means actually reading it, not clicking through to a drawer for
 * every witness in turn. Unanswered questions are left out of this card
 * entirely — an empty "Not answered" line for every unfinished question
 * would bury the answers that do exist. */
function StatementCard({ s, canEdit, onEdit }: { s: WitnessStatement; canEdit: boolean; onEdit: () => void }) {
  const answered = s.answers.filter((a) => a.answer?.trim());
  return (
    <div style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{s.witnessName}</div>
          {s.witnessRole && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{s.witnessRole}</div>}
        </div>
        {canEdit && <IconBtn name="edit" size={15} onClick={onEdit} />}
      </div>
      {answered.length > 0 ? (
        answered.map((a, i) => (
          <div key={i} style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.ruleSoft}` }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: 3 }}>{a.question}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.ink, lineHeight: 1.5 }}>“{a.answer}”</div>
          </div>
        ))
      ) : (
        <div style={{ marginTop: 10, fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkMuted, fontStyle: 'italic' }}>No answers recorded yet.</div>
      )}
    </div>
  );
}

/** Witness statements — a lighter-weight stand-in for the full witness
 * enquiry the roadmap spec describes (see WitnessStatement's own doc
 * comment, types/incident.ts, for why the full multi-recipient/AI-synthesis
 * machinery doesn't fit a single named witness's account). Exists purely to
 * help the investigator cross-check the Timeline against what a witness
 * actually says — no automatic linking to TimelineEvents, that's a human
 * judgment call while reading, not a data relationship worth forcing. */
export function WitnessStatements({ investigationId, canEdit, witnessStatements, aiSuggestedInterviewQuestions, onChanged }: {
  investigationId: string;
  canEdit: boolean;
  witnessStatements: WitnessStatement[];
  aiSuggestedInterviewQuestions?: InterviewQuestion[];
  onChanged?: () => void;
}) {
  const [target, setTarget] = useState<WitnessStatement | 'new' | null>(null);
  if (witnessStatements.length === 0 && !canEdit) return null;

  return (
    <>
      <Section
        title="Witness statements"
        subtitle="Accounts from people involved or nearby — check them against the timeline you’ve built."
        footer={canEdit ? <Btn variant="ghost" size="sm" icon="add" onClick={() => setTarget('new')}>Add witness</Btn> : undefined}
      >
        {witnessStatements.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkMuted, fontWeight: 500 }}>
            No witness statements yet — add one using the button below.
          </div>
        ) : (
          witnessStatements.map((s) => <StatementCard key={s.id} s={s} canEdit={canEdit} onEdit={() => setTarget(s)} />)
        )}
      </Section>

      <Drawer open={!!target} onClose={() => setTarget(null)}>
        {target && (
          <WitnessStatementDrawer
            investigationId={investigationId}
            aiSuggestedInterviewQuestions={aiSuggestedInterviewQuestions}
            statement={target === 'new' ? null : target}
            canEdit={canEdit}
            onClose={() => setTarget(null)}
            onChanged={() => onChanged?.()}
          />
        )}
      </Drawer>
    </>
  );
}
