import type { Metadata } from 'next';
import HeroBlock from '@/components/HeroBlock';
import SectionCap from '@/components/SectionCap';
import YearToggle from '@/components/YearToggle';
import Footer from '@/components/Footer';
import { getEventsData } from '@/lib/supabase/choir';

export const metadata: Metadata = { title: 'Calendar · 프레이즈찬양대' };

export default async function EventsPage() {
  const events = await getEventsData();

  return (
    <main className="main-content min-h-screen">
      <HeroBlock
        eyebrow="A Year in Praise"
        title="The Calendar"
        titleKo={`${events.scheduleYear} 일정 · ${events.reportYear} 활동 보고`}
        watermark="CALENDARIUM"
      />

      <SectionCap label="Annual Schedule" note="— Toggle Year" />

      <YearToggle {...events} />

      <Footer />
    </main>
  );
}
