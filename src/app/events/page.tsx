import type { Metadata } from 'next';
import { getEventsData } from '@/lib/supabase/choir';
import EventsSplitClient from './EventsSplitClient';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';

export const metadata: Metadata = { title: 'Calendar · 프레이즈찬양대' };

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
