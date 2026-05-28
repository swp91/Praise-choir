import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getAdminMembersData } from '@/lib/admin/members';
import { createMemberAction } from '../actions';
import { MemberForm } from '../MemberForm';

export default async function NewMemberPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin');
  }

  const data = await getAdminMembersData();

  return (
    <main className="min-h-screen bg-cream px-5 py-8 min-[881px]:px-10">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-line pb-6 mb-6">
          <p className="font-en text-[10px] tracking-[0.34em] uppercase text-gold-deep mb-3">
            Praise Choir Admin
          </p>
          <h1 className="font-ko text-[clamp(24px,4vw,36px)] font-bold leading-tight text-ink">
            신규 대원 추가
          </h1>
        </header>

        {!data.configured ? (
          <section className="mb-6 border border-red-200 bg-red-50 px-5 py-4 font-ko text-[13px] leading-relaxed text-red-800">
            관리자 쓰기 기능을 사용하려면 환경변수 SUPABASE_SERVICE_ROLE_KEY를 설정해야 합니다.
          </section>
        ) : null}

        <MemberForm
          sections={data.sections}
          instruments={data.instruments}
          action={createMemberAction}
          title="대원 정보 입력"
          submitLabel="대원 추가"
          cancelHref="/admin/members"
        />
      </div>
    </main>
  );
}
