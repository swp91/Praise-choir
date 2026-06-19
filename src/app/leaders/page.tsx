import { getLeadersData } from '@/lib/supabase/choir';
import LeadersGalleryClient from './LeadersGalleryClient';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function LeadersPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['leaders'],
    queryFn: getLeadersData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LeadersGalleryClient />
    </HydrationBoundary>
  );
}
