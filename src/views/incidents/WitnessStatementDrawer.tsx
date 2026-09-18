import { useState } from 'react';
import { colors } from '@/tokens';
import { IconBtn, Btn, Badge } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';
import { addWitnessStatement, updateWitnessStatement, removeWitnessStatement } from '@/data/investigations';
import { BEST_PRACTICE_WITNESS_QUESTIONS } from './witnessQuestions';
import type { InterviewQuestion, WitnessAnswer, WitnessStatement } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600, color: colors.inkSoft, marginBottom: 5 };
const inputStyle = { width: '100%', padding: '7px 9px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, outline: 'none' };
const textareaStyle = { width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, resize: 'vertical' as const, outline: 'none' };
const readOnlyText = { fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5 };

/** New statement's starting transcript — the best-practice question bank
 * plus this investigation's own `aiSuggestedInterviewQuestions`, deduped by
 * question text (a suggested question can genuinely overlap the generic
 * bank). Every witness starts from the same base, but nothing stops the
 * investigator editing/removing/adding per statement — different witnesses
 * often warrant different follow-ups. */
function buildInitialAnswers(aiSuggestedInterviewQuestions?: InterviewQuestion[]): WitnessAnswer[] {
  const answers: WitnessAnswer[] = BEST_PRACTICE_WITNESS_QUESTIONS.map((question) => ({ question }));
  const seen = new Set(answers.map((a) => a.question));
  for (const q of aiSuggestedInterviewQuestions ?? []) {
    if (!seen.has(q.question)) { answers.push({ question: q.question }); seen.add(q.question); }
  }
  return answers;
}

/** Add/edit surface for one WitnessStatement — see its own doc comment
 * (types/incident.ts). `statement: null` means adding a new witness,
 * starting from `buildInitialAnswers`; editing an existing one loads its
 * real transcript as-is, whatever it was built from at the time. */
export function WitnessStatementDrawer({ investigationId, aiSuggestedInterviewQuestions, statement, canEdit, onClose, onChanged }: {
  investigationId: string;
  aiSuggestedInterviewQuestions?: InterviewQuestion[];
  statement: WitnessStatement | null;
  canEdit: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { user } = useActiveUser();
  const isNew = !statement;
  const [witnessName, setWitnessName] = useState(statement?.witnessName ?? '');
  const [witnessRole, setWitnessRole] = useState(statement?.witnessRole ?? '');
  const [answers, setAnswers] = useState<WitnessAnswer[]>(statement?.answers ?? buildInitialAnswers(aiSuggestedInterviewQuestions));
  const [newQuestion, setNewQuestion] = useState('');

  const canSave = !!witnessName.trim();

  const patchAnswer = (idx: number, answer: string) => setAnswers((prev) => prev.map((a, i) => (i === idx ? { ...a, answer } : a)));
  const removeQuestion = (idx: number) => setAnswers((prev) => prev.filter((_, i) => i !== idx));
  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    setAnswers((prev) => [...prev, { question: newQuestion.trim() }]);
    setNewQuestion('');
  };

  const handleSave = () => {
    const fields = { witnessName: witnessName.trim(), witnessRole: witnessRole.trim() || undefined, answers };
    if (isNew) addWitnessStatement(investigationId, { ...fields, takenBy: user.name });
    else updateWitnessStatement(investigationId, statement.id, fields);
    onChanged();
    onClose();
  };
  const handleDelete = () => {
    if (!statement) return;
    removeWitnessStatement(investigationId, statement.id);
    onChanged();
    onClose();
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <Badge tone="primary" outline icon="record_voice_over">{isNew ? 'Add witness' : 'Witness statement'}</Badge>
        <span style={{ flex: 1 }} />
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <label style={fieldLabel}>Witness name</label>
        {canEdit ? (
          <input className="a-input" style={{ ...inputStyle, marginBottom: 14 }} value={witnessName} onChange={(e) => setWitnessName(e.target.value)} placeholder="Full name…" />
        ) : (
          <div style={{ ...readOnlyText, marginBottom: 14 }}>{witnessName}</div>
        )}

        <label style={fieldLabel}>Role (optional)</label>
        {canEdit ? (
          <input className="a-input" style={{ ...inputStyle, marginBottom: 18 }} value={witnessRole} onChange={(e) => setWitnessRole(e.target.value)} placeholder="e.g. Contractor, site supervisor…" />
        ) : (
          <div style={{ ...readOnlyText, marginBottom: 18 }}>{witnessRole || '—'}</div>
        )}

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10 }}>Transcript</div>
        {answers.map((a, i) => (
          <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i === answers.length - 1 ? undefined : `1px solid ${colors.ruleSoft}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <label style={{ ...fieldLabel, flex: 1, marginBottom: 6 }}>{a.question}</label>
              {canEdit && <IconBtn name="close" size={14} onClick={() => removeQuestion(i)} />}
            </div>
            {canEdit ? (
              <textarea className="a-input" value={a.answer ?? ''} onChange={(e) => patchAnswer(i, e.target.value)} rows={2} style={textareaStyle} placeholder="What the witness said, as close to their own words as possible…" />
            ) : (
              <div style={readOnlyText}>{a.answer || <span style={{ color: colors.inkMuted }}>Not answered.</span>}</div>
            )}
          </div>
        ))}

        {canEdit && (
          <div style={{ display: 'flex', gap: 6, marginTop: 4, marginBottom: 18 }}>
            <input className="a-input" style={{ ...inputStyle, flex: 1 }} value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Add a question…" />
            <Btn variant="ghost" size="sm" icon="add" onClick={addQuestion}>Add</Btn>
          </div>
        )}

        {canEdit && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 10 }}>
            {!isNew ? <Btn variant="ghost" size="sm" icon="delete" onClick={handleDelete}>Delete</Btn> : <span />}
            <Btn variant="primary" size="sm" icon="check" disabled={!canSave} onClick={handleSave}>{isNew ? 'Save statement' : 'Save'}</Btn>
          </div>
        )}
      </div>
    </>
  );
}
