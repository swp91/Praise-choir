import type { Metadata } from 'next';
import { getPracticeData } from '@/lib/supabase/choir';
import PracticeClient from '@/components/PracticeClient';

export const metadata: Metadata = { title: 'Hours & Aims · 프레이즈찬양대' };

export default async function PracticePage() {
  const data = await getPracticeData();

  return (
    <main className="main-content h-screen overflow-hidden p-0 max-[880px]:min-h-screen max-[880px]:h-auto max-[880px]:overflow-visible">
      <PracticeClient data={data} />
    </main>
  );
}

