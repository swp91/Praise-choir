import type { Metadata } from 'next';
import MobileHeader from '@/components/MobileHeader';
import HeroBlock from '@/components/HeroBlock';
import SectionCap from '@/components/SectionCap';
import MemberFilter from '@/components/MemberFilter';
import Footer from '@/components/Footer';
import { getMembersData } from '@/lib/supabase/choir';

export const metadata: Metadata = { title: 'Choristers · 프레이즈찬양대' };

export default async function MembersPage() {
  const parts = await getMembersData();

  return (
    <main className="min-h-screen p-8 pb-15 ml-62 max-[880px]:ml-0 max-[880px]:p-0 max-[880px]:pb-20">
      <MobileHeader />

      <HeroBlock
        eyebrow="Member Archive"
        title="The Choristers"
        titleKo="대원 소개 · 파트별 명부"
        watermark="CHORISTERS · CANTORES"
      />

      <SectionCap label="Part Roster" note="— 파트별 대원 명부" />

      <MemberFilter parts={parts} />

      <Footer />
    </main>
  );
}
