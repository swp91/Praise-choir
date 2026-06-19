import { getPracticeData } from '@/lib/supabase/choir';
import PracticeClient from '@/components/PracticeClient';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function PracticePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['practice'],
    queryFn: getPracticeData,
  });

  return (
    <main className="main-content h-[100dvh] overflow-hidden p-0 max-[880px]:min-h-[100dvh] max-[880px]:h-auto max-[880px]:overflow-visible">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PracticeClient />
      </HydrationBoundary>
    </main>
  );
}

