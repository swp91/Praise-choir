import type { Metadata } from 'next';
import MemberGrid from '@/components/MemberGrid';
import { getMembersData } from '@/lib/supabase/choir';

export const metadata: Metadata = { title: 'Choristers · 프레이즈찬양대' };

export default async function MembersPage() {
  const rawParts = await getMembersData();

  // Combine s1 and s2 into Soprano
  const s1 = rawParts.find((p) => p.key === 's1');
  const s2 = rawParts.find((p) => p.key === 's2');
  const alto = rawParts.find((p) => p.key === 'a');
  const tenor = rawParts.find((p) => p.key === 't');
  const bass = rawParts.find((p) => p.key === 'b');
  const band = rawParts.find((p) => p.key === 'h');
  const staff = rawParts.find((p) => p.key === 'staff');

  const sopranoMembers = [
    ...(s1?.members.map((m) => ({ ...m, subPart: '소프라노 1' })) || []),
    ...(s2?.members.map((m) => ({ ...m, subPart: '소프라노 2' })) || []),
  ];

  const parts = [
    {
      key: 'soprano',
      name: '소프라노',
      nameEn: 'Soprano',
      leader: s1?.leader || s2?.leader || '',
      members: sopranoMembers,
    },
    {
      key: 'alto',
      name: alto?.name || '알토',
      nameEn: alto?.nameEn || 'Alto',
      leader: alto?.leader || '',
      members: alto?.members || [],
    },
    {
      key: 'tenor',
      name: tenor?.name || '테너',
      nameEn: tenor?.nameEn || 'Tenor',
      leader: tenor?.leader || '',
      members: tenor?.members || [],
    },
    {
      key: 'bass',
      name: bass?.name || '베이스',
      nameEn: bass?.nameEn || 'Bass',
      leader: bass?.leader || '',
      members: bass?.members || [],
    },
    {
      key: 'band',
      name: '악단',
      nameEn: 'Hagios Ensemble',
      leader: band?.leader || '',
      members: band?.members || [],
    },
    {
      key: 'staff',
      name: staff?.name || '스태프',
      nameEn: staff?.nameEn || 'Staff',
      leader: staff?.leader || '',
      members: staff?.members || [],
    },
  ];

  return (
    <main className="main-content min-h-screen p-0 overflow-hidden bg-ink">
      <MemberGrid parts={parts} />
    </main>
  );
}

