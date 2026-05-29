import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getAdminGalleryData } from '@/lib/admin/gallery';
import { createGalleryItemAction, reorderGalleryItemsAction } from './actions';
import GalleryPhotoPicker from './GalleryPhotoPicker';
import SortableGalleryGrid from './SortableGalleryGrid';

type Props = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const inputClass =
  'w-full border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep';
const labelClass = 'block font-ko text-[12px] font-bold text-ink mb-1.5';

function ErrorMessage({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="border border-red-200 bg-red-50 px-4 py-3 font-ko text-[13px] text-red-800">
      {error}
    </div>
  );
}

function UploadForm() {
  return (
    <section className="border border-line bg-card">
      <div className="border-b border-line bg-card-head px-5 py-4">
        <h2 className="font-ko text-[18px] font-bold text-ink">사진 등록</h2>
      </div>
      <form action={createGalleryItemAction} className="grid gap-5 px-5 py-5 min-[860px]:grid-cols-[minmax(280px,420px)_1fr]">
        <GalleryPhotoPicker />
        <div className="flex flex-col justify-between gap-4">
          <div>
            <label className={labelClass} htmlFor="title">사진 제목</label>
            <input
              id="title"
              name="title"
              className={inputClass}
              placeholder="예: 2026 부활절 찬양"
              required
            />
            <p className="mt-2 font-ko text-[12px] leading-relaxed text-ink-soft">
              사진은 한 번에 1장씩 등록합니다. 설명 없이 제목만 공개 갤러리에 표시됩니다.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
            >
              사진 등록
            </button>
          </div>
        </div>
      </form>
    </section>
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
