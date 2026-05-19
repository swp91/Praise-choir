import type { Metadata } from 'next';
import MobileHeader from '@/components/MobileHeader';
import HeroBlock from '@/components/HeroBlock';
import SectionCap from '@/components/SectionCap';
import ScheduleRow from '@/components/ScheduleRow';
import GoalItem from '@/components/GoalItem';
import Footer from '@/components/Footer';
import { CHOIR_DATA } from '@/lib/data';

export const metadata: Metadata = { title: 'Hours & Aims · 프레이즈찬양대' };

export default function PracticePage() {
  return (
    <main className="min-h-screen p-8 pb-15 ml-62 max-[880px]:ml-0 max-[880px]:p-0 max-[880px]:pb-20">
      <MobileHeader />

      <HeroBlock
        eyebrow="Hours of Devotion"
        title="Hours &amp; Aims"
        titleKo="연습 시간 · 2026 목표"
        watermark="HORAE · ORATIO"
      />

      <SectionCap label="Sunday Schedule" note="— Service & Rehearsal" />

      <div className="grid grid-cols-2 gap-4 max-[880px]:grid-cols-1 max-[880px]:gap-3">
        {/* 오전 예배 · 연습 */}
        <div className="bg-card border border-line">
          <div className="flex items-center justify-between px-5.5 py-3.5 bg-card-head border-b border-line">
            <h3 className="font-en text-[11px] tracking-[0.26em] uppercase text-gold-deep font-semibold m-0">예배 · 연습 시간</h3>
            <div><span className="block w-1.5 h-1.5 bg-gold rounded-full" /></div>
          </div>
          <div>
            {[CHOIR_DATA.practice[1], CHOIR_DATA.practice[0], CHOIR_DATA.practice[2]].map((slot, i) => (
              <ScheduleRow key={i} slot={slot} />
            ))}
          </div>
        </div>

        {/* 저녁 예배 · 연습 */}
        <div className="bg-card border border-line">
          <div className="flex items-center justify-between px-5.5 py-3.5 bg-card-head border-b border-line">
            <h3 className="font-en text-[11px] tracking-[0.26em] uppercase text-gold-deep font-semibold m-0">저녁 예배 · 연습 시간</h3>
            <div><span className="block w-1.5 h-1.5 bg-gold rounded-full" /></div>
          </div>
          <div>
            {[CHOIR_DATA.practice[4], CHOIR_DATA.practice[3]].map((slot, i) => (
              <ScheduleRow key={i} slot={slot} />
            ))}
          </div>
        </div>
      </div>

      <SectionCap label="Annual Aims" note="— Seven Aims for MMXXVI" />

      {/* Theme banner */}
      <div className="px-7 py-9 text-center bg-card-head border-t border-b border-gold my-7">
        <div className="font-en text-[11px] tracking-[0.4em] text-gold-deep uppercase mb-3">2026 Theme</div>
        <p className="font-ko font-bold text-[clamp(22px,3vw,30px)] leading-[1.4] max-w-160 mx-auto">
          오직 하나님을 기뻐함으로<br />승리하는 프레이즈
        </p>
      </div>

      <div className="bg-card border border-line">
        <div className="flex items-center justify-between px-5.5 py-3.5 bg-card-head border-b border-line">
          <h3 className="font-en text-[11px] tracking-[0.26em] uppercase text-gold-deep font-semibold m-0">VII Aims · 일곱 가지 목표</h3>
          <div><span className="block w-1.5 h-1.5 bg-gold rounded-full" /></div>
        </div>
        <div className="grid grid-cols-2 max-[880px]:grid-cols-1">
          {CHOIR_DATA.goals.map((g, i) => (
            <GoalItem key={i} index={i} text={g} />
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
