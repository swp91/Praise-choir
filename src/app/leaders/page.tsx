import type { Metadata } from 'next';
import { getLeadersData } from '@/lib/supabase/choir';
import LeadersGalleryClient from './LeadersGalleryClient';

export const metadata: Metadata = { title: 'Officers · 프레이즈찬양대' };

export default async function LeadersPage() {
  const { officers } = await getLeadersData();

  return <LeadersGalleryClient officers={officers} />;
}
