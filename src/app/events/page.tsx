import type { Metadata } from 'next';
import { getEventsData } from '@/lib/supabase/choir';
import EventsGalleryClient from './EventsGalleryClient';

export const metadata: Metadata = { title: 'Calendar · 프레이즈찬양대' };

export default async function EventsPage() {
  const events = await getEventsData();

  return <EventsGalleryClient {...events} />;
}
