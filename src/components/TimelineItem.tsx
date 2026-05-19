import type { ChoirEvent } from '@/lib/types';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function parseWhen(when: string) {
  const m = when.match(/^(\d{2})\.(\d{2})$/);
  if (!m) return { main: 'TBD', sub: '미정' };
  return { main: MONTHS[parseInt(m[2], 10) - 1], sub: '20' + m[1] };
}

type Props = { event: ChoirEvent };

export default function TimelineItem({ event }: Props) {
  const { main, sub } = parseWhen(event.when);
  return (
    <div className={`grid grid-cols-[96px_1fr] px-6 py-4.5 border-b border-line-soft items-start last:border-b-0 max-[880px]:grid-cols-[70px_1fr] max-[880px]:px-4 max-[880px]:py-3.5 ${event.highlight ? 'bg-gold/9' : ''}`}>
      <div className="font-en italic text-sm text-gold-deep tracking-[0.06em]">
        {main}
        <small className="block not-italic text-[10px] text-ink-mute tracking-[0.16em] mt-0.5 uppercase">{sub}</small>
      </div>
      <div>
        <h4 className={`font-ko text-base font-bold mb-1 ${event.highlight ? 'text-gold-deep' : ''}`}>{event.title}</h4>
        {event.detail && (
          <div className="text-[13px] text-ink-soft">
            <i className="font-en text-gold-deep not-italic">—</i> {event.detail}
          </div>
        )}
      </div>
    </div>
  );
}
