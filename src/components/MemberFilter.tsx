'use client';
import { useState } from 'react';
import Image from 'next/image';
import type { Part } from '@/lib/types';
import { imageUrl } from '@/lib/media';

function BirthDisplay({ birth }: { birth: string }) {
  if (!birth || birth === '—') return <span>—</span>;
  const lunar = birth.startsWith('음');
  const date = lunar ? birth.slice(1) : birth;
  return (
    <span>
      {date}
      {lunar && <span className="ml-1 text-[13px]">🌙</span>}
    </span>
  );
}

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
              <small className="font-en italic text-[12px] tracking-[0.04em] text-ink-soft ml-2.5 normal-case font-medium">
                파트장 · {part.leader}
              </small>
            )}
          </h3>
          <span className="font-en italic text-gold text-[13px]">{num} / {part.members.length} voices</span>
        </div>
        <div className="px-6 pt-5 pb-7 max-[880px]:px-4">
          <div className="grid grid-cols-5 gap-x-4 gap-y-7 max-[880px]:grid-cols-3 max-[880px]:gap-x-3 max-[880px]:gap-y-6">
            {part.members.map((m, i) => (
              <div key={`${m.name}-${i}`} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full border-2 border-gold overflow-hidden relative mb-3 max-[880px]:w-16 max-[880px]:h-16">
                  {m.photo ? (
                    <Image src={imageUrl(m.photo, { width: 160, height: 160, crop: 'fill', gravity: 'face' })} alt={m.name} fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#ebe0c4_0_5px,#ddd0ad_5px_10px)]" />
                  )}
                </div>
                {m.role && (
                  <span className="font-ko text-[9px] text-gold-deep border border-gold/60 px-1.5 py-px mb-1 max-[880px]:text-[8px]">
                    {m.role}
                  </span>
                )}
                <div className="font-ko text-[13px] font-bold leading-snug max-[880px]:text-[12px]">{m.name}</div>
                <div className="mt-1.5 flex flex-col items-start gap-0.5 font-ko text-[11px] text-ink-soft [font-variant-numeric:tabular-nums] max-[880px]:text-[10px] max-[880px]:items-center">
                  <div className="flex items-center gap-1">
                    <span>🎂</span>
                    <BirthDisplay birth={m.birth} />
                  </div>
                  <a href={`tel:${m.phone.replace(/-/g, '')}`} className="flex items-center gap-1">
                    <span className="max-[880px]:hidden">📞</span>
                    <span className="max-[880px]:hidden">{m.phone}</span>
                    <span className="hidden max-[880px]:flex items-center justify-center w-6 h-6 rounded-full border border-gold/60 text-gold-deep">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
