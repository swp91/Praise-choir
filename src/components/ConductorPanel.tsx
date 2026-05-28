import { Fragment } from 'react';
import Image from 'next/image';
import type { Conductor } from '@/lib/types';
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

const ROLE_EN: Record<string, string> = {
  '지휘': 'Conductor',
  '반주 (Piano)': 'Pianist',
  '편곡': 'Arranger',
  '반주 (Piano · 임시)': 'Interim Pianist',
};

type Props = { conductors: readonly Conductor[] };

export default function ConductorPanel({ conductors }: Props) {
  return (
    <div className="bg-card border border-gold/50">
      <div className="flex items-center justify-between px-5.5 py-3.5 bg-card-head border-b border-gold/30">
        <h3 className="font-en text-[11px] tracking-[0.26em] uppercase text-gold-deep font-semibold m-0">지휘 · 반주 · 편곡</h3>
        <div><span className="block w-1.5 h-1.5 bg-gold rounded-full" /></div>
      </div>

      <div className="flex max-[880px]:flex-col">
        {conductors.map((c, i) => (
          <Fragment key={c.name}>
            {i > 0 && (
              <>
                <div className="w-px bg-gold/25 self-center h-28 max-[880px]:hidden" />
                <div className="hidden max-[880px]:block h-px bg-gold/25 mx-6" />
              </>
            )}
          <div className="flex-1 flex items-center gap-6 px-6 py-7 max-[880px]:px-5 max-[880px]:py-5">
            <div className="w-28 h-28 rounded-full border-2 border-gold overflow-hidden relative shrink-0">
              {c.photo ? (
                <Image src={imageUrl(c.photo, { width: 240, height: 240, crop: 'fill', gravity: 'face' })} alt={c.name} fill sizes="112px" className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#ebe0c4_0_5px,#ddd0ad_5px_10px)] flex items-center justify-center font-en italic font-semibold text-[36px] text-gold-deep">
                  {c.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="text-gold text-[13px] leading-none mb-1.5">♪</div>
              <div className="font-en text-[8px] tracking-[0.28em] uppercase text-gold-deep mb-1">{ROLE_EN[c.role] ?? ''}</div>
              <h3 className="font-ko text-[15px] font-bold text-ink leading-tight mb-0.5">{c.name}</h3>
              <div className="font-ko text-[11px] text-ink-mute mb-3">{c.role}</div>
              <div className="h-px w-8 bg-gold/40 mb-3" />
              <div className="flex flex-col gap-1">
                <div>
                  <span className="font-en text-[8px] tracking-[0.18em] text-ink-mute uppercase mr-2">BIRTH</span>
                  <span className="font-ko text-[11px] text-ink-soft [font-variant-numeric:tabular-nums]"><BirthDisplay birth={c.birth} /></span>
                </div>
                <div className="flex items-center">
                  <span className="font-en text-[8px] tracking-[0.18em] text-ink-mute uppercase mr-2 max-[880px]:hidden">TEL.</span>
                  <a href={`tel:${c.phone.replace(/-/g, '')}`} className="font-ko text-[11px] text-ink-soft [font-variant-numeric:tabular-nums]">
                    <span className="border-b border-dotted border-gold pb-px max-[880px]:hidden">{c.phone}</span>
                    <span className="hidden max-[880px]:flex items-center justify-center w-6 h-6 rounded-full border border-gold/60 text-gold-deep">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
