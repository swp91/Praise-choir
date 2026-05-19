import type { Member } from '@/lib/types';

const maskPhone = (p: string) => p.replace(/(\d{3,4})-(\d{3,4})-(\d{4})/, '$1-••••-$3');
const maskBirth = (b: string) => b.replace(/\([\d.]+\)/, '(••••)');

type Props = { member: Member; isLeader?: boolean };

export default function MemberCard({ member, isLeader }: Props) {
  const phoneDigits = member.phone.replace(/-/g, '');
  return (
    <div className={`grid grid-cols-[64px_1fr] gap-4 px-5 py-4.5 border-b border-line-soft items-center odd:border-r odd:border-line-soft max-[880px]:px-4 max-[880px]:py-3.5 max-[880px]:odd:border-r-0 ${isLeader ? 'bg-gold/8' : ''}`}>
      <div className="w-16 h-16 rounded-full border border-gold bg-[repeating-linear-gradient(45deg,#ebe0c4_0_5px,#ddd0ad_5px_10px)] flex items-center justify-center font-en italic font-semibold text-2xl text-gold-deep relative after:content-[''] after:absolute after:inset-1 after:border after:border-white/70 after:rounded-full">
        {member.name.charAt(0)}
      </div>
      <div>
        {member.role && (
          <span className="inline-block font-en text-[9px] tracking-[0.24em] uppercase text-gold-deep px-1.5 py-0.5 border border-gold mb-1.5">
            {member.role}
          </span>
        )}
        <h4 className="font-ko text-base font-bold mb-1.5 leading-[1.2]">{member.name}</h4>
        <dl className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-0.5 text-[12px]">
          <dt className="font-en text-[9px] tracking-[0.16em] text-ink-mute uppercase self-baseline">BIRTH</dt>
          <dd className="text-ink font-ko [font-variant-numeric:tabular-nums] m-0">{maskBirth(member.birth) || '—'}</dd>
          <dt className="font-en text-[9px] tracking-[0.16em] text-ink-mute uppercase self-baseline">TEL.</dt>
          <dd className="m-0">
            <a className="border-b border-dotted border-gold pb-px font-ko [font-variant-numeric:tabular-nums]" href={`tel:${phoneDigits}`}>
              {maskPhone(member.phone)}
            </a>
          </dd>
        </dl>
      </div>
    </div>
  );
}
