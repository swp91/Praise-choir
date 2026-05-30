import type { Metadata } from 'next';
import HeroBlock from '@/components/HeroBlock';
import SectionCap from '@/components/SectionCap';
import Gallery from '@/components/Gallery';
import { getGalleryData } from '@/lib/supabase/choir';

export const metadata: Metadata = { title: 'Archive · 프레이즈찬양대' };

export default async function GalleryPage() {
  const photos = await getGalleryData();

  return (
    <main className="h-screen overflow-hidden p-0 ml-62 max-[880px]:ml-0 max-[880px]:min-h-screen max-[880px]:h-auto max-[880px]:overflow-visible max-[880px]:pb-20">
      <div className="min-[881px]:hidden">
        <HeroBlock
          eyebrow="Photo Archive"
          title="The Archive"
          titleKo="갤러리 · 함께한 순간들"
          watermark="ARCHIVUM · MEMORIA"
        />

        <SectionCap label="Albums" note="Photo Archive" />
      </div>

      <Gallery photos={photos} />
    </main>
  );
}
