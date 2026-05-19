import type { Metadata } from 'next';
import MobileHeader from '@/components/MobileHeader';
import HeroBlock from '@/components/HeroBlock';
import SectionCap from '@/components/SectionCap';
import YearToggle from '@/components/YearToggle';
import Footer from '@/components/Footer';

export const metadata: Metadata = { title: 'Calendar · 프레이즈찬양대' };

export default function EventsPage() {
  return (
    <main className="min-h-screen p-8 pb-15 ml-62 max-[880px]:ml-0 max-[880px]:p-0 max-[880px]:pb-20">
      <MobileHeader />

      <HeroBlock
        eyebrow="A Year in Praise"
        title="The Calendar"
        titleKo="2026 일정 · 2025 활동 보고"
        watermark="CALENDARIUM"
      />

      <SectionCap label="Annual Schedule" note="— Toggle Year" />

      <YearToggle />

      <Footer />
    </main>
  );
}
