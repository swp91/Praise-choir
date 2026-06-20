import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getAdminMembersData, type AdminMember, type AdminMemberOption } from '@/lib/admin/members';
import { updateMemberAction, reorderSectionMembersAction, setMemberActiveAction } from './actions';
import { MemberForm } from './MemberForm';
import SortableMemberTable from './SortableMemberTable';
import AdminNotification from '../main/AdminNotification';

type Props = {
  searchParams?: Promise<{
    edit?: string;
    error?: string;
    section?: string;
  }>;
};

function SectionTabs({
  sections,
  members,
  activeSection,
}: {
  sections: AdminMemberOption[];
  members: AdminMember[];
  activeSection?: string;
}) {
  const totalActive = members.filter((m) => m.isActive).length;

  function countForSection(sectionId: string) {
    return members.filter((m) => m.sectionId === sectionId && m.isActive).length;
  }

  const tabBase =
    'border px-3 py-1.5 font-ko text-[12px] transition whitespace-nowrap';
  const tabActive = 'border-gold-deep bg-gold-deep text-cream';
  const tabInactive = 'border-line bg-card text-ink-soft hover:border-gold hover:text-ink';

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/admin/members"
        className={`${tabBase} ${!activeSection ? tabActive : tabInactive}`}
      >
        전체 ({totalActive})
      </Link>
      {sections.map((section) => (
        <Link
          key={section.id}
          href={`/admin/members?section=${section.id}`}
          className={`${tabBase} ${activeSection === section.id ? tabActive : tabInactive}`}
        >
          {section.label} ({countForSection(section.id)})
        </Link>
      ))}
    </div>
  );
}

function ErrorMessage({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="border border-red-200 bg-red-50 px-4 py-3 font-ko text-[13px] text-red-800">
      {error}
    </div>
  );
}

export default async function AdminMembersPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin');
  }

  const params = await searchParams;
  const data = await getAdminMembersData();

  const activeSection = params?.section;
  const editingMember = params?.edit
    ? data.members.find((m) => m.id === params.edit)
    : undefined;

  const visibleMembers = activeSection
    ? data.members.filter((m) => m.sectionId === activeSection)
    : data.members;

  const activeCount = visibleMembers.filter((m) => m.isActive).length;

  return (
    <main className="min-h-screen bg-cream px-5 py-8 min-[881px]:px-10">
      <AdminNotification />
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-line pb-6 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <div>
            <p className="font-en text-[10px] tracking-[0.34em] uppercase text-gold-deep mb-3">
              Praise Choir Admin
            </p>
            <h1 className="font-ko text-[clamp(26px,4vw,42px)] font-bold leading-tight text-ink">
              대원 관리
            </h1>
            <p className="mt-3 max-w-2xl font-ko text-[14px] leading-relaxed text-ink-soft">
              대원의 정보를 추가하거나 삭제, 수정할수있으며 상태를 변경할수 있습니다 각 파트별로 사진을 드래그하여 순번을 변경할 수 있습니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/members/new"
              className="border border-gold-deep bg-gold-deep px-4 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
            >
              + 대원 추가
            </Link>
            <Link
              href="/admin"
              className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
            >
              대시보드로
            </Link>
          </div>
        </header>

        <div className="mt-6 space-y-4">
          <ErrorMessage error={params?.error} />

          {!data.configured ? (
            <section className="border border-red-200 bg-red-50 px-5 py-4 font-ko text-[13px] leading-relaxed text-red-800">
              관리자 쓰기 기능을 사용하려면 환경변수 SUPABASE_SERVICE_ROLE_KEY를 설정해야 합니다.
              이 키는 브라우저에 노출되지 않고 서버 액션에서만 사용됩니다.
            </section>
          ) : null}

          {editingMember ? (
            <MemberForm
              member={editingMember}
              sections={data.sections}
              instruments={data.instruments}
              action={updateMemberAction}
              title="대원 정보 수정"
              submitLabel="수정 저장"
              cancelHref={activeSection ? `/admin/members?section=${activeSection}` : '/admin/members'}
            />
          ) : null}

          <section className="border border-line bg-card">
            <div className="border-b border-line bg-card-head px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-ko text-[18px] font-bold text-ink">대원 목록</h2>
                <span className="font-en text-[12px] italic text-gold-deep">
                  {activeCount} active
                </span>
              </div>
              <SectionTabs
                sections={data.sections}
                members={data.members}
                activeSection={activeSection}
              />
            </div>

            <SortableMemberTable
              key={activeSection ?? 'all'}
              members={visibleMembers}
              sectionId={activeSection}
              reorderAction={activeSection ? reorderSectionMembersAction : undefined}
              toggleAction={setMemberActiveAction}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
