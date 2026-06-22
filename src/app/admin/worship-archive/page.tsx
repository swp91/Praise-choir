import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getWorshipVideos, type WorshipVideo } from '@/lib/worship-archive';
import WorshipArchiveAdminClient from './WorshipArchiveAdminClient';

type Props = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function ErrorMessage({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="border border-red-200 bg-red-50 px-4 py-3 font-ko text-[13px] text-red-800">
      {error}
    </div>
  );
}

export default async function AdminWorshipArchivePage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect('/admin');

  const params = await searchParams;
  let items: WorshipVideo[] = [];
  let dbConfigured = true;

  try {
    items = await getWorshipVideos();
  } catch (error) {
    console.error('Failed to get worship videos in page:', error);
    dbConfigured = false;
  }

  return (
    <main className="min-h-screen bg-cream px-5 py-8 min-[881px]:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-line pb-6 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <div>
            <p className="font-en text-[10px] tracking-[0.34em] uppercase text-gold-deep mb-3">
              Praise Choir Admin
            </p>
            <h1 className="font-ko text-[clamp(26px,4vw,42px)] font-bold leading-tight text-ink">
              찬양 아카이브 관리
            </h1>
            <p className="mt-3 max-w-2xl font-ko text-[14px] leading-relaxed text-ink-soft">
              매주 주일 드려진 찬양대 영상을 등록하고 가사를 편집할 수 있습니다. 
              유튜브 링크와 찬양일자를 입력하면 자동으로 연도/월/일순으로 정렬됩니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/worship-archive"
              className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
            >
              아카이브 보기
            </Link>
            <Link
              href="/admin"
              className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
            >
              대시보드로
            </Link>
          </div>
        </header>

        <div className="mt-6 space-y-5">
          <ErrorMessage error={params?.error} />

          {!dbConfigured ? (
            <section className="border border-red-200 bg-red-50 px-5 py-4 font-ko text-[13px] leading-relaxed text-red-800">
              찬양 아카이브 데이터베이스를 불러오지 못했습니다. `worship_videos` 테이블이 생성되었는지 확인해 주세요.
            </section>
          ) : null}

          {dbConfigured ? (
            <WorshipArchiveAdminClient initialItems={items} />
          ) : (
            <p className="font-ko text-[13px] text-red-700">
              Supabase 데이터베이스 연동 에러가 있습니다. 관리자 설정을 점검해 주세요.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
