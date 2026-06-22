import Link from 'next/link';
import { isAdminAuthConfigured, isAdminAuthenticated } from '@/lib/admin/auth';
import { loginAdmin, logoutAdmin } from './actions';

type AdminSection = {
  title: string;
  description: string;
  status: string;
  href?: string;
};

const ADMIN_SECTIONS: AdminSection[] = [
  {
    title: '메인 관리',
    description: '메인페이지의 구성을 관리합니다',
    status: '관리하기',
    href: '/admin/main',
  },
  {
    title: '대원 관리',
    description: '성가대원 정보와 사진, 파트, 악기 구성을 추가하거나 수정합니다.',
    status: '관리하기',
    href: '/admin/members',
  },
  {
    title: '임원 관리',
    description: '임원 멤버를 관리합니다.',
    status: '관리하기',
    href: '/admin/leaders',
  },
  {
    title: '표어, 비전관리',
    description: '성가대의 한해 표어와 비전등을 관리합니다',
    status: '관리하기',
    href: '/admin/goals',
  },
  {
    title: '일정 관리',
    description: '연도별로 일정을 관리합니다.',
    status: '관리하기',
    href: '/admin/events',
  },
  {
    title: '갤러리 관리',
    description: '갤러리 사진을 관리합니다.',
    status: '관리하기',
    href: '/admin/gallery',
  },
  {
    title: '아카이브 관리',
    description: '매주 올라오는 찬양 영상과 가사를 아카이브에 등록하고 편집합니다.',
    status: '관리하기',
    href: '/admin/archive',
  },
];

type Props = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function LoginPanel({ hasError, configured }: { hasError: boolean; configured: boolean }) {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-5 py-10">
      <section className="w-full max-w-[420px] border border-line bg-card shadow-[0_24px_70px_rgba(42,38,32,0.12)]">
        <div className="border-b border-line bg-card-head px-6 py-5">
          <p className="font-en text-[10px] tracking-[0.34em] uppercase text-gold-deep mb-2">
            Praise Choir Admin
          </p>
          <h1 className="font-ko text-[22px] font-bold text-ink">관리자 접근</h1>
        </div>

        <form action={loginAdmin} className="px-6 py-6">
          <label className="block font-ko text-[13px] font-bold text-ink mb-2" htmlFor="admin-password">
            비밀번호
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            disabled={!configured}
            className="w-full border border-line bg-cream px-4 py-3 font-ko text-[15px] text-ink outline-none transition focus:border-gold-deep disabled:opacity-60"
            placeholder={configured ? '관리자 비밀번호 입력' : 'ADMIN_PASSWORD 설정 필요'}
          />

          {hasError ? (
            <p className="mt-3 font-ko text-[12px] text-red-700">
              비밀번호가 올바르지 않습니다.
            </p>
          ) : null}

          {!configured ? (
            <p className="mt-3 font-ko text-[12px] leading-relaxed text-ink-soft">
              로컬 또는 Vercel 환경변수에 ADMIN_PASSWORD를 설정하면 로그인할 수 있습니다.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!configured}
            className="mt-5 w-full border border-gold-deep bg-gold-deep px-4 py-3 font-ko text-[14px] font-bold text-cream transition hover:bg-ink disabled:cursor-not-allowed disabled:border-line disabled:bg-ink-mute"
          >
            입장하기
          </button>
        </form>
      </section>
    </main>
  );
}

function Dashboard() {
  return (
    <main className="min-h-screen bg-cream px-5 py-8 min-[881px]:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-line pb-6 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <div>
            <p className="font-en text-[10px] tracking-[0.34em] uppercase text-gold-deep mb-3">
              Praise Choir Admin
            </p>
            <h1 className="font-ko text-[clamp(26px,4vw,42px)] font-bold leading-tight text-ink">
              프레이즈 관리
            </h1>
            <p className="mt-3 max-w-2xl font-ko text-[14px] leading-relaxed text-ink-soft">
              프레이즈 홈페이지를 관리하는 관리자 페이지 입니다.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
            >
              홈페이지 보기
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="border border-gold-deep bg-gold-deep px-4 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
              >
                로그아웃
              </button>
            </form>
          </div>
        </header>

        <section className="mt-7 grid gap-4 min-[720px]:grid-cols-2 min-[1120px]:grid-cols-3">
          {ADMIN_SECTIONS.map((section) => (
            <article key={section.title} className="border border-line bg-card">
              {section.href ? (
                <Link href={section.href} className="block transition hover:bg-gold/5">
                  <div className="flex items-center justify-between border-b border-line bg-card-head px-5 py-3.5">
                    <h2 className="font-ko text-[16px] font-bold text-ink">{section.title}</h2>
                    <span className="border border-gold/60 px-2 py-1 font-ko text-[11px] text-gold-deep">
                      {section.status}
                    </span>
                  </div>
                  <p className="min-h-24 px-5 py-4 font-ko text-[13px] leading-relaxed text-ink-soft">
                    {section.description}
                  </p>
                </Link>
              ) : (
                <>
              <div className="flex items-center justify-between border-b border-line bg-card-head px-5 py-3.5">
                <h2 className="font-ko text-[16px] font-bold text-ink">{section.title}</h2>
                <span className="border border-gold/60 px-2 py-1 font-ko text-[11px] text-gold-deep">
                  {section.status}
                </span>
              </div>
              <p className="min-h-24 px-5 py-4 font-ko text-[13px] leading-relaxed text-ink-soft">
                {section.description}
              </p>
                </>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

export default async function AdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <LoginPanel configured={isAdminAuthConfigured()} hasError={params?.error === '1'} />;
  }

  return <Dashboard />;
}
