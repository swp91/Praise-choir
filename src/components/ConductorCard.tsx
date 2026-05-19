import type { Conductor } from '@/lib/types';

const maskPhone = (p: string) => p.replace(/(\d{3,4})-(\d{3,4})-(\d{4})/, '$1-••••-$3');
const maskBirth = (b: string) => b.replace(/\([\d.]+\)/, '(••••)');

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
    <article className="grid grid-cols-[88px_1fr] gap-5 p-6 items-start max-[880px]:grid-cols-[70px_1fr] max-[880px]:gap-4 max-[880px]:p-4.5">
      <div className="w-22 h-22 rounded-full border border-gold bg-[repeating-linear-gradient(45deg,#ebe0c4_0_6px,#ddd0ad_6px_12px)] flex items-center justify-center font-en italic font-semibold text-[32px] text-gold-deep relative after:content-[''] after:absolute after:inset-1.25 after:border after:border-white/70 after:rounded-full max-[880px]:w-17.5 max-[880px]:h-17.5 max-[880px]:text-[26px]">
        {c.name.charAt(0)}
      </div>
      <div>
        <div className="font-en text-[10px] tracking-[0.3em] text-gold-deep uppercase mb-1">{ROLE_EN[c.role] ?? ''}</div>
        <div className="font-ko text-[13px] text-ink-mute mb-2.5">{c.role}</div>
        <h3 className="font-ko text-[22px] font-bold mb-1">{c.name}</h3>
        <div className="font-en italic text-[12px] text-ink-mute mb-3">Since {c.since}</div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px] pt-2.5 border-t border-line-soft">
          <dt className="font-en text-[9px] tracking-[0.18em] text-ink-mute uppercase m-0">BIRTH</dt>
          <dd className="m-0 font-ko [font-variant-numeric:tabular-nums]">{maskBirth(c.birth)}</dd>
          <dt className="font-en text-[9px] tracking-[0.18em] text-ink-mute uppercase m-0">TEL.</dt>
          <dd className="m-0 font-ko [font-variant-numeric:tabular-nums]">
            <a className="border-b border-dotted border-gold pb-px" href={`tel:${phoneDigits}`}>{maskPhone(c.phone)}</a>
          </dd>
        </dl>
        {c.note && <p className="mt-2 font-en italic text-[11px] text-ink-mute">— {c.note}</p>}
      </div>
    </article>
  );
}
