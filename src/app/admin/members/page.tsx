import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getAdminMembersData, type AdminMember, type AdminMemberOption } from '@/lib/admin/members';
import { createMemberAction, updateMemberAction } from './actions';
import DeleteMemberButton from './DeleteMemberButton';

type Props = {
  searchParams?: Promise<{
    edit?: string;
    saved?: string;
    error?: string;
  }>;
};

const inputClass =
  'w-full border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep';
const labelClass = 'block font-ko text-[12px] font-bold text-ink mb-1.5';

function optionLabel(option: AdminMemberOption) {
  return option.label;
}

function MemberForm({
  member,
  sections,
  instruments,
}: {
  member?: AdminMember;
  sections: AdminMemberOption[];
  instruments: AdminMemberOption[];
}) {
  const action = member ? updateMemberAction : createMemberAction;

  return (
    <form action={action} className="border border-line bg-card">
      {member ? <input type="hidden" name="id" value={member.id} /> : null}

      <div className="border-b border-line bg-card-head px-5 py-4">
        <h2 className="font-ko text-[18px] font-bold text-ink">
          {member ? '대원 정보 수정' : '신규 대원 추가'}
        </h2>
      </div>

      <div className="grid gap-4 px-5 py-5 min-[760px]:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="display_name">이름</label>
          <input
            id="display_name"
            name="display_name"
            className={inputClass}
            defaultValue={member?.displayName ?? ''}
            placeholder="예: 홍길동 집사"
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="section_id">소속 파트</label>
          <select
            id="section_id"
            name="section_id"
            className={inputClass}
            defaultValue={member?.sectionId ?? ''}
            required
          >
            <option value="">선택</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>{optionLabel(section)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="role_text">직분/역할</label>
          <input
            id="role_text"
            name="role_text"
            className={inputClass}
            defaultValue={member?.roleText ?? ''}
            placeholder="예: 파트장, 악단장"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="instrument_id">악기</label>
          <select
            id="instrument_id"
            name="instrument_id"
            className={inputClass}
            defaultValue={member?.instrumentId ?? ''}
          >
            <option value="">해당 없음</option>
            {instruments.map((instrument) => (
              <option key={instrument.id} value={instrument.id}>{optionLabel(instrument)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="birth_label">생일 표시</label>
          <input
            id="birth_label"
            name="birth_label"
            className={inputClass}
            defaultValue={member?.birthLabel ?? ''}
            placeholder="예: 1. 2"
          />
          <label className="mt-2 flex items-center gap-2 font-ko text-[12px] text-ink-soft">
            <input type="checkbox" name="birth_is_lunar" defaultChecked={member?.birthIsLunar ?? false} />
            음력
          </label>
          <label className="mt-2 flex items-center gap-2 font-ko text-[12px] text-ink-soft">
            <input type="checkbox" name="show_birth" defaultChecked={member?.showBirth ?? true} />
            홈페이지에 생일 표시
          </label>
        </div>

        <div>
          <label className={labelClass} htmlFor="phone_label">전화번호</label>
          <input
            id="phone_label"
            name="phone_label"
            className={inputClass}
            defaultValue={member?.phoneLabel ?? ''}
            placeholder="예: 010-0000-0000"
          />
          <label className="mt-2 flex items-center gap-2 font-ko text-[12px] text-ink-soft">
            <input type="checkbox" name="show_phone" defaultChecked={member?.showPhone ?? true} />
            홈페이지에 전화번호 표시
          </label>
        </div>

        <div>
          <label className={labelClass} htmlFor="sort_order">정렬 순서</label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            className={inputClass}
            defaultValue={member?.sortOrder ?? 0}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="photo_url">사진 URL</label>
          <input
            id="photo_url"
            name="photo_url"
            className={inputClass}
            defaultValue={member?.photoUrl ?? ''}
            placeholder="Storage 업로드 전까지 임시 URL 사용"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
        {member ? (
          <Link
            href="/admin/members"
            className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
          >
            수정 취소
          </Link>
        ) : null}
        <button
          type="submit"
          className="border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
        >
          {member ? '수정 저장' : '대원 추가'}
        </button>
      </div>
    </form>
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
  const editingMember = params?.edit ? data.members.find((member) => member.id === params.edit) : undefined;

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
          <Link
            href="/admin"
            className="w-fit border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
          >
            대시보드로
          </Link>
        </header>

        <div className="mt-6 space-y-4">
          <StatusMessage saved={params?.saved} error={params?.error} />

          {!data.configured ? (
            <section className="border border-red-200 bg-red-50 px-5 py-4 font-ko text-[13px] leading-relaxed text-red-800">
              관리자 쓰기 기능을 사용하려면 환경변수 SUPABASE_SERVICE_ROLE_KEY를 설정해야 합니다.
              이 키는 브라우저에 노출되지 않고 서버 액션에서만 사용됩니다.
            </section>
          ) : null}

          <MemberForm member={editingMember} sections={data.sections} instruments={data.instruments} />

          <section className="border border-line bg-card">
            <div className="flex items-center justify-between border-b border-line bg-card-head px-5 py-4">
              <h2 className="font-ko text-[18px] font-bold text-ink">대원 목록</h2>
              <span className="font-en text-[12px] italic text-gold-deep">
                {data.members.filter((member) => member.isActive).length} active
              </span>
            </div>

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
                  {data.members.map((member) => (
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
                        <span className={`border px-2 py-1 font-ko text-[11px] ${
                          member.isActive
                            ? 'border-gold/60 text-gold-deep'
                            : 'border-line text-ink-mute'
                        }`}>
                          {member.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/members?edit=${member.id}`}
                            className="border border-line bg-cream px-3 py-2 font-ko text-[12px] text-ink transition hover:border-gold"
                          >
                            수정
                          </Link>
                          {member.isActive ? (
                            <DeleteMemberButton id={member.id} name={member.displayName} />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!data.members.length ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center font-ko text-[13px] text-ink-soft">
                        표시할 대원 데이터가 없습니다.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
