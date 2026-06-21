import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getAdminGalleryData } from '@/lib/admin/gallery';
import { reorderGalleryItemsAction } from './actions';
import SortableGalleryGrid from './SortableGalleryGrid';
import UploadForm from './UploadForm';

type Props = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const labelClass = 'block font-ko text-[12px] font-bold text-ink mb-1.5';

function ErrorMessage({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="border border-red-200 bg-red-50 px-4 py-3 font-ko text-[13px] text-red-800">
      {error}
    </div>
  );
}

export default async function AdminGalleryPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect('/admin');

  const params = await searchParams;
  const data = await getAdminGalleryData();

  return (
    <main className="min-h-screen bg-cream px-5 py-8 min-[881px]:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-line pb-6 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <div>
            <p className="font-en text-[10px] tracking-[0.34em] uppercase text-gold-deep mb-3">
              Praise Choir Admin
            </p>
            <h1 className="font-ko text-[clamp(26px,4vw,42px)] font-bold leading-tight text-ink">
              갤러리 관리
            </h1>
            <p className="mt-3 max-w-2xl font-ko text-[14px] leading-relaxed text-ink-soft">
              갤러리에 사진을 추가하거나 삭제, 순번을 드래그해서 변경할수 있습니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/gallery"
              className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
            >
              갤러리 보기
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

          {!data.configured ? (
            <section className="border border-red-200 bg-red-50 px-5 py-4 font-ko text-[13px] leading-relaxed text-red-800">
              관리자 갤러리 기능을 사용하려면 환경변수 SUPABASE_SERVICE_ROLE_KEY를 설정해야 합니다.
            </section>
          ) : null}

          {data.configured ? <UploadForm /> : null}

          <section className="border border-line bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-card-head px-5 py-4">
              <h2 className="font-ko text-[18px] font-bold text-ink">등록된 사진</h2>
              <span className="font-en text-[12px] italic text-gold-deep">
                {data.items.length} photos
              </span>
            </div>
            <div className="px-5 py-5">
              {data.configured ? (
                <SortableGalleryGrid items={data.items} reorderAction={reorderGalleryItemsAction} />
              ) : (
                <p className="font-ko text-[13px] text-red-700">
                  SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
