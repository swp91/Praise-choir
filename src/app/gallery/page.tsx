import type { Metadata } from 'next';
import MobileHeader from '@/components/MobileHeader';
import HeroBlock from '@/components/HeroBlock';
import SectionCap from '@/components/SectionCap';
import Gallery from '@/components/Gallery';
import Footer from '@/components/Footer';
import { getGalleryData } from '@/lib/supabase/choir';

export const metadata: Metadata = { title: 'Archive · 프레이즈찬양대' };

export default async function GalleryPage() {
  const photos = await getGalleryData();

  return (
    <main className="min-h-screen p-8 pb-15 ml-62 max-[880px]:ml-0 max-[880px]:p-0 max-[880px]:pb-20">
      <MobileHeader />

      <HeroBlock
        eyebrow="Photo Archive"
        title="The Archive"
        titleKo="갤러리 · 함께한 순간들"
        watermark="ARCHIVUM · MEMORIA"
      />

      <SectionCap label="Albums" note="— Filter by Category" />

      <Gallery photos={photos} />

      <Footer />
    </main>
  );
}
