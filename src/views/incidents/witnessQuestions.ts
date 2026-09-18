/** Best-practice witness-interview questions — the default starting
 * transcript for a new `WitnessStatement` (2026-09-18 ICAM pass, see
 * [[project_investigation_timeline]]), merged with this investigation's own
 * `aiSuggestedInterviewQuestions` where present. Open-ended and
 * non-leading, matching `specs/features/ENQUIRY.md`'s own tone rule for the
 * `investigation_witness` trigger ("without leading the witness or assuming
 * conclusions... respectful and non-accusatory") and its `work_as_done`/
 * `gap_identification` question types — asking what actually happens,
 * not what the procedure says, and what the witness thinks is missing,
 * rather than asking them to confirm a theory the investigator already
 * holds. Deliberately never asks "whose fault" or "why didn't you" framing —
 * see [[feedback_progressive_safety_tone]]. */
export const BEST_PRACTICE_WITNESS_QUESTIONS: string[] = [
  'Can you walk me through what you saw or were doing, in your own words?',
  'What did you expect to happen at that point, based on how this work is normally done?',
  'Was anything about this task, shift, or environment different from normal?',
  'What, if anything, made this task harder to do the way it’s meant to be done?',
  'Is there anything about how this work is normally set up or resourced that you think we should know?',
];
