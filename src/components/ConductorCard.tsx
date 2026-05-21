import Image from 'next/image';
import type { Conductor } from '@/lib/types';

const maskPhone = (p: string) => p.replace(/(\d{3,4})-(\d{3,4})-(\d{4})/, '$1-••••-$3');

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

const cldUrl = (id: string) =>
  `https://res.cloudinary.com/dmbiqatia/image/upload/w_320,h_320,c_fill,g_face,f_auto,q_auto/${id}`;

const ROLE_EN: Record<string, string> = {
  '지휘': 'Conductor',
  '반주 (Piano)': 'Pianist',
  '편곡': 'Arranger',
  '반주 (Piano · 임시)': 'Interim Pianist',
};

type Props = { conductor: Conductor };

export default function ConductorCard({ conductor: c }: Props) {
  const phoneDigits = c.phone.replace(/-/g, '');
  return (
    <article className="relative bg-card border border-gold/50 rounded-2xl flex flex-col items-center text-center px-6 pt-8 pb-6"
      style={{ boxShadow: 'inset 0 0 0 6px rgba(253,249,240,1), inset 0 0 0 7px rgba(184,154,90,0.45)' }}>


      {/* Circular photo */}
      <div className="w-40 h-40 rounded-full border-2 border-gold overflow-hidden relative mb-5 shrink-0 shadow-[0_0_0_5px_#fdf9f0,0_0_0_8px_rgba(184,154,90,0.3)]">
        {c.photo ? (
          <Image src={cldUrl(c.photo)} alt={c.name} fill sizes="160px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#ebe0c4_0_6px,#ddd0ad_6px_12px)] flex items-center justify-center font-en italic font-semibold text-[40px] text-gold-deep">
            {c.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Name & role */}
      <h3 className="font-ko text-[17px] font-bold text-ink leading-tight mb-1">{c.name}</h3>
      <div className="font-en text-[9px] tracking-[0.3em] uppercase text-gold-deep mb-0.5">{ROLE_EN[c.role] ?? ''}</div>
      <div className="font-ko text-[12px] text-ink-mute mb-5">{c.role}</div>

      {/* Divider */}
      <div className="w-10 h-px bg-gold/50 mb-4" />

      {/* Details */}
      <div className="flex flex-col items-center gap-1.5 text-[11px]">
        <div>
          <span className="font-en text-[9px] tracking-[0.18em] text-ink-mute uppercase mr-2">BIRTH</span>
          <span className="font-ko text-ink-soft [font-variant-numeric:tabular-nums]"><BirthDisplay birth={c.birth} /></span>
        </div>
        <div>
          <span className="font-en text-[9px] tracking-[0.18em] text-ink-mute uppercase mr-2">TEL.</span>
          <a className="font-ko text-ink-soft border-b border-dotted border-gold pb-px [font-variant-numeric:tabular-nums]" href={`tel:${phoneDigits}`}>{maskPhone(c.phone)}</a>
        </div>
      </div>
    </article>
  );
}
