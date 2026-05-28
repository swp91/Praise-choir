'use client';

import { useState } from 'react';
import { parseBirthLabel } from '@/lib/admin/birth-label';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const selectClass =
  'border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep';

type Props = {
  defaultValue?: string | null;
};

export default function BirthPicker({ defaultValue }: Props) {
  const parsed = parseBirthLabel(defaultValue);
  const [month, setMonth] = useState(parsed.month);
  const [day, setDay] = useState(parsed.day);

  const maxDay = month ? DAYS_IN_MONTH[Number(month) - 1] : 31;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  const birthLabel = month && day ? `${month}. ${day}` : '';

  function handleMonthChange(value: string) {
    setMonth(value);
    const max = value ? DAYS_IN_MONTH[Number(value) - 1] : 31;
    if (day && Number(day) > max) setDay('');
  }

  return (
    <div className="flex gap-2">
      <select
        value={month}
        onChange={(e) => handleMonthChange(e.target.value)}
        className={selectClass}
        aria-label="월 선택"
      >
        <option value="">월</option>
        {MONTHS.map((m) => (
          <option key={m} value={String(m)}>{m}월</option>
        ))}
      </select>

      <select
        value={day}
        onChange={(e) => setDay(e.target.value)}
        disabled={!month}
        className={`${selectClass} disabled:opacity-40`}
        aria-label="일 선택"
      >
        <option value="">일</option>
        {days.map((d) => (
          <option key={d} value={String(d)}>{d}일</option>
        ))}
      </select>

      <input type="hidden" name="birth_label" value={birthLabel} />
    </div>
  );
}
