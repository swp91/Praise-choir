import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getAdminMembersData, type AdminMember, type AdminMemberOption } from '@/lib/admin/members';
import { updateMemberAction, reorderSectionMembersAction, setMemberActiveAction } from './actions';
import { MemberForm } from './MemberForm';
import ToggleActiveButton from './ToggleActiveButton';
import DeleteMemberButton from './DeleteMemberButton';
import SortableMemberTable from './SortableMemberTable';

type Props = {
  searchParams?: Promise<{
    edit?: string;
    saved?: string;
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

function StatusMessage({ saved, error }: { saved?: string; error?: string }) {
  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 px-4 py-3 font-ko text-[13px] text-red-800">
        {error}
      </div>
    );
  }

  const message =
    saved === 'created'
      ? '대원을 추가했습니다.'
      : saved === 'updated'
        ? '대원 정보를 수정했습니다.'
        : saved === 'deleted'
          ? '대원을 비활성화했습니다.'
          : '';

  if (!message) return null;

  return (
    <div className="border border-gold/50 bg-gold/10 px-4 py-3 font-ko text-[13px] text-gold-deep">
      {message}
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
              성가대원 정보를 추가, 수정, 삭제합니다. 삭제는 실제 삭제가 아니라 비활성화로 처리됩니다.
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
          <StatusMessage saved={params?.saved} error={params?.error} />

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

            {activeSection ? (
              <SortableMemberTable
                key={activeSection}
                members={visibleMembers}
                sectionId={activeSection}
                reorderAction={reorderSectionMembersAction}
                toggleAction={setMemberActiveAction}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] border-collapse">
                  <thead>
                    <tr className="border-b border-line-soft bg-cream/70 text-left">
                      <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">이름</th>
                      <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">파트</th>
                      <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">역할/악기</th>
                      <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">생일</th>
                      <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">전화번호</th>
                      <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">상태</th>
                      <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleMembers.map((member) => (
                      <tr key={member.id} className="border-b border-line-soft last:border-b-0">
                        <td className="px-4 py-3 font-ko text-[13px] font-bold text-ink">{member.displayName}</td>
                        <td className="px-4 py-3 font-ko text-[13px] text-ink-soft">{member.sectionName}</td>
                        <td className="px-4 py-3 font-ko text-[13px] text-ink-soft">
                          {[member.roleText, member.instrumentName].filter(Boolean).join(' / ') || '-'}
                        </td>
                        <td className="px-4 py-3 font-ko text-[13px] text-ink-soft">
                          {member.showBirth ? member.birthLabel ?? '-' : '비공개'}
                        </td>
                        <td className="px-4 py-3 font-ko text-[13px] text-ink-soft">
                          {member.showPhone ? member.phoneLabel ?? '-' : '비공개'}
                        </td>
                        <td className="px-4 py-3">
                          <ToggleActiveButton
                            id={member.id}
                            isActive={member.isActive}
                            action={setMemberActiveAction}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/members?edit=${member.id}`}
                              className="border border-line bg-cream px-3 py-2 font-ko text-[12px] text-ink transition hover:border-gold"
                            >
                              수정
                            </Link>
                            <DeleteMemberButton id={member.id} name={member.displayName} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!visibleMembers.length ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center font-ko text-[13px] text-ink-soft">
                          표시할 대원 데이터가 없습니다.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
