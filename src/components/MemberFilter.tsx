'use client';
import { useState } from 'react';
import MemberCard from './MemberCard';
import type { Part } from '@/lib/types';

type Props = { parts: readonly Part[] };

export default function MemberFilter({ parts }: Props) {
  const [active, setActive] = useState(parts[0].key);
  const part = parts.find(p => p.key === active)!;
  const idx = parts.findIndex(p => p.key === active);
  const num = String(idx + 1).padStart(2, '0');

  return (
    <>
      {/* Part tabs */}
      <div className="flex flex-wrap gap-2 mb-4 max-[880px]:grid max-[880px]:grid-cols-3 max-[880px]:gap-1.5 max-[880px]:mx-4">
        {parts.map(p => (
          <button
            key={p.key}
            type="button"
            aria-pressed={active === p.key}
            onClick={() => setActive(p.key)}
            className={`font-ko text-[13px] px-4 py-2 border transition-colors duration-150 max-[880px]:text-[12px] max-[880px]:px-2 max-[880px]:py-2.5 max-[880px]:text-center ${
              active === p.key
                ? 'bg-ink text-cream border-ink'
                : 'bg-transparent text-ink-soft border-line hover:border-gold hover:text-ink'
            }`}
          >
            {p.name}
            <small className="block font-en text-[9px] tracking-[0.14em] uppercase opacity-70 mt-0.5 max-[880px]:text-[8px] max-[880px]:tracking-[0.08em]">
              {p.nameEn}
            </small>
          </button>
        ))}
      </div>

      {/* Selected part card */}
      <div className="bg-card border border-line">
        <div className="flex items-center justify-between px-5.5 py-3.5 bg-card-head border-b border-line">
          <h3 className="font-en text-[11px] tracking-[0.26em] uppercase text-gold-deep font-semibold m-0">
            {part.name}
            {part.leader && (
              <small className="font-en italic text-[12px] tracking-[0.04em] text-ink-mute ml-2.5 normal-case font-medium">
                파트장 · {part.leader}
              </small>
            )}
          </h3>
          <span className="font-en italic text-gold text-[13px]">{num} / {part.members.length} voices</span>
        </div>
        <div className="grid grid-cols-2 max-[880px]:grid-cols-1">
          {part.members.map((m, i) => {
            const isLeader = i === 0 && (m.role === '파트장' || m.role === '악단장');
            return <MemberCard key={m.name} member={m} isLeader={isLeader} />;
          })}
        </div>
      </div>
    </>
  );
}
