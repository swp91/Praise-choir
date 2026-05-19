'use client';
import { useMemo } from 'react';
import type { ChoirEvent } from '@/lib/types';

function parseSpecificDate(event: ChoirEvent): Date | null {
  if (!event.detail) return null;
  const m1 = event.detail.match(/20(\d{2})\.(\d{2})\.(\d{2})/);
  if (m1) return new Date(2000 + parseInt(m1[1]), parseInt(m1[2]) - 1, parseInt(m1[3]));
  const m2 = event.detail.match(/^(\d{2})\/(\d{2})/);
  if (m2) {
    const ym = event.when.match(/^(\d{2})\./);
    return new Date(ym ? 2000 + parseInt(ym[1]) : 2026, parseInt(m2[1]) - 1, parseInt(m2[2]));
  }
  return null;
}

type Status = { kind: 'done' } | { kind: 'tbd' } | { kind: 'upcoming'; days: number };

function computeStatus(event: ChoirEvent, today: Date): Status {
  if (event.when === '미정') return { kind: 'tbd' };

  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const specific = parseSpecificDate(event);

  if (specific) {
    const d = new Date(specific.getFullYear(), specific.getMonth(), specific.getDate()).getTime();
    if (d < todayMs) return { kind: 'done' };
    return { kind: 'upcoming', days: Math.ceil((d - todayMs) / 86400000) };
  }

  const m = event.when.match(/^(\d{2})\.(\d{2})$/);
  if (!m) return { kind: 'tbd' };
  const yr = 2000 + parseInt(m[1]);
  const mo = parseInt(m[2]) - 1;
  const endMs = new Date(yr, mo + 1, 0).getTime();
  if (endMs < todayMs) return { kind: 'done' };
  const firstMs = new Date(yr, mo, 1).getTime();
  if (firstMs <= todayMs) return { kind: 'upcoming', days: 0 };
  return { kind: 'upcoming', days: Math.ceil((firstMs - todayMs) / 86400000) };
}

function formatDateLabel(event: ChoirEvent): string {
  if (event.when === '미정') return '';
  const specific = parseSpecificDate(event);
  if (specific) return `${specific.getMonth() + 1}월 ${specific.getDate()}일`;
  const m = event.when.match(/^(\d{2})\.(\d{2})$/);
  if (!m) return '';
  return `${parseInt(m[2])}월`;
}

type Props = { events: ChoirEvent[] };

export default function Timeline2026({ events }: Props) {
  const today = useMemo(() => new Date(), []);
  const items = useMemo(
    () => events.map(e => ({ event: e, status: computeStatus(e, today) })),
    [events, today],
  );

  return (
    <div className="py-5 px-6 max-[880px]:px-4">
      {items.map(({ event, status }, i) => {
        const isDone = status.kind === 'done';
        const isTbd = status.kind === 'tbd';
        const isLast = i === items.length - 1;

        return (
          <div key={i} className="flex gap-4">
            {/* Dot + connector line column */}
            <div className="flex flex-col items-center" style={{ width: '16px', minWidth: '16px' }}>
              <div className={`w-3 h-3 rounded-full border-2 shrink-0 mt-1.5 ${
                isDone
                  ? 'border-line bg-cream'
                  : isTbd
                  ? 'border-ink-mute/40 bg-cream'
                  : 'border-gold bg-gold'
              }`} />
              {!isLast && <div className="w-px flex-1 bg-line mt-1.5 mb-1.5" />}
            </div>

            {/* Event card */}
            <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-4'}`}>
              <div className={`border px-4 py-3.5 ${
                isDone
                  ? 'border-line-soft'
                  : event.highlight
                  ? 'border-gold bg-card'
                  : 'border-line bg-card'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className={`font-ko font-bold text-[15px] leading-none mb-1.5 ${
                      isDone ? 'text-ink-mute/60' : 'text-gold-deep'
                    }`}>
                      {formatDateLabel(event) || '—'}
                    </div>
                    <h4 className={`font-ko font-bold text-[15px] leading-snug ${
                      isDone ? 'text-ink-mute' : event.highlight ? 'text-gold-deep' : 'text-ink'
                    }`}>
                      {event.title}
                    </h4>
                  </div>

                  {/* Status badge */}
                  <div className="shrink-0 mt-0.5">
                    {isDone && (
                      <span className="font-ko text-[11px] text-ink-mute border border-line px-2 py-0.5 whitespace-nowrap">
                        완료
                      </span>
                    )}
                    {isTbd && (
                      <span className="font-ko text-[11px] text-ink-mute border border-line-soft px-2 py-0.5 whitespace-nowrap">
                        날짜 미정
                      </span>
                    )}
                    {status.kind === 'upcoming' && (
                      <span className={`font-en text-[11px] font-semibold border px-2 py-0.5 whitespace-nowrap ${
                        status.days === 0
                          ? 'text-gold-deep border-gold bg-gold/10'
                          : status.days <= 60
                          ? 'text-gold-deep border-gold'
                          : 'text-gold border-gold/50'
                      }`}>
                        {status.days === 0 ? 'D-Day' : `D-${status.days}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
