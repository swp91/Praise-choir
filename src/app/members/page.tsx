import MemberGrid from '@/components/MemberGrid';
import { getMembersData } from '@/lib/supabase/choir';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function MembersPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['members'],
    queryFn: getMembersData,
  });

  return (
    <main className="main-content min-h-screen p-0 overflow-hidden bg-ink">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MemberGrid />
      </HydrationBoundary>
    </main>
  );
}

