import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Btn, LinkBtn } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';
import { SITES, SITE_ID_BY_NAME } from '@/data/sites';
import { VISITS, createVisit, updateVisit } from '@/data/visits';
import { PlanVisitSite } from './PlanVisitSite';
import { PlanVisitSchedule, isoOffset, type DateChoice } from './PlanVisitSchedule';
import { PlanVisitBriefing } from './PlanVisitBriefing';
import { PlanVisitReview } from './PlanVisitReview';

const STEP_LABELS = ['Site', 'Schedule', 'Briefing', 'Review'];
const TOTAL_STEPS = STEP_LABELS.length;

function inferDateChoice(date: string): DateChoice | null {
  if (!date) return 'later';
  if (date === isoOffset(0)) return 'today';
  if (date === isoOffset(1)) return 'tomorrow';
  return 'custom';
}

export function PlanVisit() {
  const navigate = useNavigate();
  const { user } = useActiveUser();
  const { id } = useParams();
  const [params] = useSearchParams();

  const editing = VISITS.find((v) => v.id === id) ?? null;

  const [step, setStep] = useState(1);
  const [siteId, setSiteId] = useState<string | null>(editing ? SITE_ID_BY_NAME[editing.siteName] ?? null : params.get('site'));
  const [dateChoice, setDateChoice] = useState<DateChoice | null>(editing ? inferDateChoice(editing.date) : null);
  const [date, setDate] = useState(editing?.date ?? '');
  const [time, setTime] = useState(editing?.time ?? '07:30');
  const [focusNotes, setFocusNotes] = useState(editing?.focusNotes ?? '');
  const [relatedInsightIds, setRelatedInsightIds] = useState<string[]>(editing?.relatedInsightIds ?? []);

  const site = SITES.find((s) => s.id === siteId) ?? null;

  const handleChoiceChange = (choice: DateChoice, nextDate: string) => {
    setDateChoice(choice);
    setDate(nextDate);
  };

  const handleSaveForLater = () => {
    setDateChoice('later');
    setDate('');
    setStep(step + 1);
  };

  const canProceed = step === 1 ? !!site : step === 2 ? (!!dateChoice && dateChoice !== 'later' && !!date) : true;

  const handleSubmit = () => {
    if (!site) return;
    if (editing) {
      updateVisit(editing.id, {
        site,
        date,
        time,
        focusNotes: focusNotes || undefined,
        relatedInsightIds: relatedInsightIds.length ? relatedInsightIds : undefined,
      });
      navigate(`/visits/${editing.id}`, { replace: true });
    } else {
      const visit = createVisit({
        site,
        date,
        time,
        visitorName: user.name,
        focusNotes: focusNotes || undefined,
        relatedInsightIds: relatedInsightIds.length ? relatedInsightIds : undefined,
      });
      navigate(`/visits/${visit.id}`, { replace: true });
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <LinkBtn icon="arrow_back" size="md" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>Cancel</LinkBtn>
      <PageHead
        title={editing ? 'Edit visit' : 'Plan a visit'}
        sub={editing ? 'Update the schedule or briefing for this planned visit.' : 'Schedule a site visit and brief it for whoever executes it in the field.'}
      />

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, marginBottom: 8 }}>
          Step {step} of {TOTAL_STEPS} · {STEP_LABELS[step - 1]}
        </div>
        <div style={{ height: 4, borderRadius: 99, background: colors.fill, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(step / TOTAL_STEPS) * 100}%`, background: colors.ink, transition: 'width .2s' }} />
        </div>
      </div>

      {step === 1 && <PlanVisitSite siteId={siteId} onChange={setSiteId} />}
      {step === 2 && site && (
        <PlanVisitSchedule site={site} dateChoice={dateChoice} date={date} time={time} onChoiceChange={handleChoiceChange} onTimeChange={setTime} onChangeSite={() => setStep(1)} />
      )}
      {step === 3 && site && (
        <PlanVisitBriefing site={site} focusNotes={focusNotes} onNotesChange={setFocusNotes} relatedInsightIds={relatedInsightIds} onInsightsChange={setRelatedInsightIds} />
      )}
      {step === 4 && site && (
        <PlanVisitReview site={site} dateChoice={dateChoice} date={date} time={time} focusNotes={focusNotes} relatedInsightIds={relatedInsightIds} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: `1px solid ${colors.rule}` }}>
        {step > 1 ? <Btn variant="ghost" onClick={() => setStep(step - 1)}>Back</Btn> : <div />}
        <div style={{ display: 'flex', gap: 10 }}>
          {step === 2 && <Btn variant="ghost" onClick={handleSaveForLater}>Save for later</Btn>}
          {step < TOTAL_STEPS ? (
            <Btn variant="primary" onClick={() => setStep(step + 1)} disabled={!canProceed}>Next</Btn>
          ) : (
            <Btn variant="accent" icon="check" onClick={handleSubmit}>{editing ? 'Save changes' : 'Create visit'}</Btn>
          )}
        </div>
      </div>
    </div>
  );
}
