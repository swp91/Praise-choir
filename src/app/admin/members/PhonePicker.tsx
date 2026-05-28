'use client';

import { useRef, useState } from 'react';

function parsePhone(value: string | null | undefined) {
  if (!value) return { part1: '', part2: '', part3: '' };
  const match = value.match(/(\d{2,4})[^\d](\d{3,4})[^\d](\d{4})/);
  if (match) return { part1: match[1], part2: match[2], part3: match[3] };
  return { part1: '', part2: '', part3: '' };
}

const inputClass =
  'border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep text-center';

type Props = {
  defaultValue?: string | null;
};

export default function PhonePicker({ defaultValue }: Props) {
  const parsed = parsePhone(defaultValue);
  const [part1, setPart1] = useState(parsed.part1);
  const [part2, setPart2] = useState(parsed.part2);
  const [part3, setPart3] = useState(parsed.part3);

  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);

  const phoneLabel = part1 && part2 && part3 ? `${part1}-${part2}-${part3}` : '';

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="text"
        inputMode="numeric"
        maxLength={3}
        value={part1}
        placeholder="010"
        className={`${inputClass} w-16`}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '');
          setPart1(v);
          if (v.length === 3) ref2.current?.focus();
        }}
      />
      <span className="font-ko text-[14px] text-ink-mute">-</span>
      <input
        ref={ref2}
        type="text"
        inputMode="numeric"
        maxLength={4}
        value={part2}
        placeholder="0000"
        className={`${inputClass} w-20`}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '');
          setPart2(v);
          if (v.length === 4) ref3.current?.focus();
        }}
      />
      <span className="font-ko text-[14px] text-ink-mute">-</span>
      <input
        ref={ref3}
        type="text"
        inputMode="numeric"
        maxLength={4}
        value={part3}
        placeholder="0000"
        className={`${inputClass} w-20`}
        onChange={(e) => setPart3(e.target.value.replace(/\D/g, ''))}
      />

      <input type="hidden" name="phone_label" value={phoneLabel} />
    </div>
  );
}
