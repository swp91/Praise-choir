import { getEventsData } from '@/lib/supabase/choir';
import EventsSplitClient from './EventsSplitClient';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function EventsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['events'],
    queryFn: getEventsData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventsSplitClient />
    </HydrationBoundary>
  );
}
