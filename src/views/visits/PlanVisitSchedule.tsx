import { useRef } from 'react';
import { colors } from '@/tokens';
import { Icon, LinkBtn } from '@/components';
import type { Site } from '@/types';

const WEEKDAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const FULL_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const labelStyle = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, color: colors.inkSoft, marginBottom: 8 };

export function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function partsOf(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function shortDateLabel(iso: string): string {
  const dt = partsOf(iso);
  return `${WEEKDAYS_SHORT[dt.getDay()]} ${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]}`;
}

function monthYearLabel(iso: string): string {
  const dt = partsOf(iso);
  return `${MONTHS_SHORT[dt.getMonth()]} ${dt.getFullYear()}`;
}

export type DateChoice = 'today' | 'tomorrow' | 'custom' | 'later';

const ARRIVE_TIMES = ['06:00', '07:30', '09:00', '11:00', '13:30'];

export interface PlanVisitScheduleProps {
  site: Site;
  dateChoice: DateChoice | null;
  date: string;
  time: string;
  onChoiceChange: (choice: DateChoice, date: string) => void;
  onTimeChange: (v: string) => void;
  onChangeSite: () => void;
}

export function PlanVisitSchedule({ site, dateChoice, date, time, onChoiceChange, onTimeChange, onChangeSite }: PlanVisitScheduleProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const todayIso = isoOffset(0);
  const tomorrowIso = isoOffset(1);

  const strip = Array.from({ length: 5 }, (_, i) => {
    const iso = isoOffset(i + 2);
    const dt = partsOf(iso);
    const weekend = dt.getDay() === 0 || dt.getDay() === 6;
    return { iso, weekday: WEEKDAYS_SHORT[dt.getDay()], day: dt.getDate(), weekend };
  });

  const hasDate = dateChoice !== null && dateChoice !== 'later' && !!date;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 'var(--radius-lg)', background: colors.ink, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: colors.hi, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, color: '#fff' }}>{site.name}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>{site.region}</div>
          </div>
        </div>
        <LinkBtn onClick={onChangeSite} style={{ color: colors.hi }}>Change</LinkBtn>
      </div>

      <label style={labelStyle}>{monthYearLabel(todayIso)}</label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {[{ choice: 'today' as const, iso: todayIso, label: 'Today' }, { choice: 'tomorrow' as const, iso: tomorrowIso, label: 'Tomorrow' }].map((q) => {
          const on = dateChoice === q.choice;
          return (
            <div
              key={q.choice}
              onClick={() => onChoiceChange(q.choice, q.iso)}
              style={{ padding: '16px 10px', borderRadius: 'var(--radius-lg)', border: `1.5px solid ${on ? colors.ink : colors.rule}`, background: on ? colors.ink : colors.panel, textAlign: 'center', cursor: 'pointer' }}
            >
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700, color: on ? '#fff' : colors.ink }}>{q.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, marginTop: 4, color: on ? 'rgba(255,255,255,0.6)' : colors.inkSoft }}>{shortDateLabel(q.iso)}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 10 }}>
        {strip.map((d) => {
          const on = dateChoice === 'custom' && date === d.iso;
          return (
            <div
              key={d.iso}
              onClick={() => !d.weekend && onChoiceChange('custom', d.iso)}
              style={{
                padding: '10px 4px',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${on ? colors.ink : colors.rule}`,
                background: on ? colors.ink : colors.panel,
                textAlign: 'center',
                cursor: d.weekend ? 'default' : 'pointer',
                opacity: d.weekend ? 0.4 : 1,
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: on ? 'rgba(255,255,255,0.7)' : colors.inkSoft }}>{d.weekday}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, marginTop: 2, color: on ? '#fff' : colors.ink }}>{d.day}</div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'relative', marginBottom: 14 }}>
        <div
          onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 'var(--radius-lg)', border: `1px solid ${colors.rule}`, background: colors.panel, cursor: 'pointer' }}
        >
          <Icon name="calendar_month" size={18} color={colors.inkSoft} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>Select date</span>
          <Icon name="chevron_right" size={18} color={colors.inkMuted} style={{ marginLeft: 'auto' }} />
        </div>
        <input
          ref={dateInputRef}
          type="date"
          value={dateChoice === 'custom' ? date : ''}
          onChange={(e) => e.target.value && onChoiceChange('custom', e.target.value)}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0, left: 0, bottom: 0 }}
        />
      </div>

      {hasDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 'var(--radius-lg)', background: colors.hi, marginBottom: 14 }}>
          <Icon name="calendar_today" size={18} color={colors.hiInk} />
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, color: colors.hiInk }}>
              {dateChoice === 'today' ? 'Today' : dateChoice === 'tomorrow' ? 'Tomorrow' : FULL_WEEKDAYS[partsOf(date).getDay()]}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: colors.hiInk, opacity: 0.75, marginTop: 1 }}>{shortDateLabel(date)}</div>
          </div>
        </div>
      )}

      {hasDate && (
        <div>
          <label style={labelStyle}>Arrive by</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {ARRIVE_TIMES.map((t) => {
              const on = time === t;
              return (
                <div
                  key={t}
                  onClick={() => onTimeChange(t)}
                  style={{ padding: '10px 4px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${on ? colors.ink : colors.rule}`, background: on ? colors.ink : colors.panel, color: on ? '#fff' : colors.ink, textAlign: 'center', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}
                >
                  {t}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
