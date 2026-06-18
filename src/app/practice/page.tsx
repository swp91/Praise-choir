import type { Metadata } from 'next';
import { getPracticeData } from '@/lib/supabase/choir';
import PracticeClient from '@/components/PracticeClient';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';

export const metadata: Metadata = { title: 'Schedule & Vision · 프레이즈찬양대' };

export default async function PracticePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['practice'],
    queryFn: getPracticeData,
  });

  return (
    <main className="main-content h-screen overflow-hidden p-0 max-[880px]:min-h-screen max-[880px]:h-auto max-[880px]:overflow-visible">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PracticeClient />
      </HydrationBoundary>
    </main>
  );
}

