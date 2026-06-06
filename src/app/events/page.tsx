import type { Metadata } from 'next';
import { getEventsData } from '@/lib/supabase/choir';
import EventsSplitClient from './EventsSplitClient';

export const metadata: Metadata = { title: 'Calendar · 프레이즈찬양대' };

export default async function EventsPage() {
  const events = await getEventsData();

  return <EventsSplitClient {...events} />;
}
