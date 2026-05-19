import type { Metadata } from 'next';
import MobileHeader from '@/components/MobileHeader';
import HeroBlock from '@/components/HeroBlock';
import SectionCap from '@/components/SectionCap';
import ConductorCard from '@/components/ConductorCard';
import Footer from '@/components/Footer';
import { CHOIR_DATA } from '@/lib/data';

export const metadata: Metadata = { title: 'Serving Ministers · 프레이즈찬양대' };

const OFF_EN: Record<string, string> = {
  '대장': 'Choir Master',
  '총무': 'General Affairs',
  '회계': 'Treasurer',
  '서기': 'Secretary',
  '소1 파트장': 'Soprano I Lead',
  '소2 파트장': 'Soprano II Lead',
  '알토 파트장': 'Alto Lead',
  '테너·베이스 파트장': 'Tenor & Bass Lead',
  '자막': 'Subtitle',
};

export default function LeadersPage() {
  return (
    <main className="min-h-screen p-8 pb-15 ml-62 max-[880px]:ml-0 max-[880px]:p-0 max-[880px]:pb-20">
      <MobileHeader />

      <HeroBlock
        eyebrow="Organizational Hierarchy"
        title="Serving Ministers"
        titleKo="지휘 · 반주 · 임원진"
        watermark="MINISTRI"
      />

      <SectionCap label="Musical Directorate" note="— Conductor · Pianist · Arranger" />

      <div className="bg-card border border-line">
        <div className="flex items-center justify-between px-5.5 py-3.5 bg-card-head border-b border-line">
          <h3 className="font-en text-[11px] tracking-[0.26em] uppercase text-gold-deep font-semibold m-0">지휘 · 반주 · 편곡</h3>
          <div><span className="block w-1.5 h-1.5 bg-gold rounded-full" /></div>
        </div>
        <div className="p-6">
          <p className="font-en italic text-[13px] text-ink-mute mb-5">Custodians of the sacred musical tradition.</p>
          <div className="grid grid-cols-2 gap-6 max-[880px]:grid-cols-1 max-[880px]:gap-3.5">
            {CHOIR_DATA.conductors.map(c => (
              <ConductorCard key={c.name} conductor={c} />
            ))}
          </div>
        </div>
      </div>

      <SectionCap label="High Leadership" note="— Roster of Officers" />

      <div className="bg-card border border-line">
        <div className="flex items-center justify-between px-5.5 py-3.5 bg-card-head border-b border-line">
          <h3 className="font-en text-[11px] tracking-[0.26em] uppercase text-gold-deep font-semibold m-0">임원진 명부</h3>
          <div><span className="block w-1.5 h-1.5 bg-gold rounded-full" /></div>
        </div>
        <div className="px-6 pt-4.5 pb-6">
          <p className="font-en italic text-[13px] text-ink-mute mb-5">Governance and spiritual direction of the choral office.</p>
          <table className="w-full border-collapse">
            <caption className="sr-only">임원진 명부</caption>
            <thead>
              <tr>
                <th scope="col" className="sr-only">번호</th>
                <th scope="col" className="sr-only">직책</th>
                <th scope="col" className="sr-only">이름</th>
                <th scope="col" className="sr-only">파트</th>
              </tr>
            </thead>
            <tbody>
              {CHOIR_DATA.leadership.map((o, i) => {
                const num = String(i + 1).padStart(2, '0');
                return (
                  <tr key={i} className="border-b border-line-soft last:border-b-0">
                    <td className="py-3.5 px-2 w-11 font-en italic text-gold text-[16px] max-[880px]:hidden">{num}</td>
                    <td className="py-3.5 px-2 font-ko text-[15px] font-bold max-[880px]:text-sm">
                      {o.role}
                      <small className="block font-en text-[10px] tracking-[0.22em] text-gold-deep uppercase font-medium italic mt-0.5">
                        {OFF_EN[o.role] ?? ''}
                      </small>
                    </td>
                    <td className="py-3.5 px-2 font-ko text-[16px] font-bold text-right max-[880px]:text-sm">{o.name}</td>
                    <td className="py-3.5 pl-2 text-right text-ink-soft text-[12px] max-[880px]:hidden">{o.part}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </main>
  );
}
