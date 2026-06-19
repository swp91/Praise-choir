import HeroBlock from '@/components/HeroBlock';
import SectionCap from '@/components/SectionCap';
import Gallery from '@/components/Gallery';
import { getGalleryData } from '@/lib/supabase/choir';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function GalleryPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['gallery'],
    queryFn: getGalleryData,
  });

  return (
    <main className="main-content h-[100dvh] overflow-hidden p-0 max-[880px]:min-h-[100dvh] max-[880px]:h-auto max-[880px]:overflow-visible">
      <div className="min-[881px]:hidden">
        <HeroBlock
          eyebrow="Photo Gallery"
          title="The Gallery"
          titleKo="갤러리 · 함께한 순간들"
          watermark="GALLERIA · MEMORIA"
        />

        <SectionCap label="Albums" note="Photo Gallery" />
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Gallery />
      </HydrationBoundary>
    </main>
  );
}
