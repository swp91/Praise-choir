import { Fragment } from 'react';
import Image from 'next/image';
import type { Conductor } from '@/lib/types';

const cldUrl = (id: string) =>
  `https://res.cloudinary.com/dmbiqatia/image/upload/w_240,h_240,c_fill,g_face,f_auto,q_auto/${id}`;

const maskPhone = (p: string) => p.replace(/(\d{3,4})-(\d{3,4})-(\d{4})/, '$1-••••-$3');

function BirthDisplay({ birth }: { birth: string }) {
  if (!birth || birth === '—') return <span>—</span>;
  const lunar = birth.startsWith('음');
  const date = lunar ? birth.slice(1) : birth;
  return (
    <span>
      {lunar && <span className="mr-1 text-[12px]">☽</span>}
      {date}
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
                <Image src={cldUrl(c.photo)} alt={c.name} fill sizes="112px" className="object-cover" />
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
                <div>
                  <span className="font-en text-[8px] tracking-[0.18em] text-ink-mute uppercase mr-2">TEL.</span>
                  <a className="font-ko text-[11px] text-ink-soft border-b border-dotted border-gold pb-px [font-variant-numeric:tabular-nums]" href={`tel:${c.phone.replace(/-/g, '')}`}>{maskPhone(c.phone)}</a>
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
