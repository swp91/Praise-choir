import type { PracticeSlot } from '@/lib/types';

const TAG_EN = { '예배': 'Service', '연습': 'Rehearsal' } as const;

function formatTime(time: string) {
  const m = time.match(/(오전|오후)\s*(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2})/);
  if (!m) return time;
  const ampm = m[1] === '오전' ? 'AM' : 'PM';
  return `${m[2]} – ${m[3]} ${ampm}`;
}

type Props = { slot: PracticeSlot };

export default function ScheduleRow({ slot }: Props) {
  const isWorship = slot.tag === '예배';
  return (
    <div className={`flex items-center justify-between gap-4 px-5.5 py-4.5 border-b border-line-soft last:border-b-0 max-[880px]:px-4 max-[880px]:py-3.5 ${isWorship ? 'bg-gold/7' : ''}`}>
      <div>
        <span className={`inline-block font-en text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 mb-1.5 ${isWorship ? 'text-gold-deep border border-gold' : 'text-ink-mute border border-line'}`}>
          {TAG_EN[slot.tag]}
        </span>
        <div className="font-ko text-[15px] font-bold">{slot.label}</div>
      </div>
      <div className="font-en text-[15px] text-gold-deep [font-variant-numeric:tabular-nums] tracking-[0.02em] text-right shrink-0">
        {formatTime(slot.time)}
        <small className="block font-ko text-ink-mute text-[11px] mt-0.5">{slot.time}</small>
      </div>
    </div>
  );
}
