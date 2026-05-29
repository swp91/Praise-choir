import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import {
  getAdminLeadershipData,
  type AdminLeaderPersonOption,
  type AdminMusicStaff,
} from '@/lib/admin/leadership';
import {
  createOfficerAction,
  reorderOfficersAction,
  setOfficerActiveAction,
  updateMusicStaffAction,
  updateOfficerAction,
} from './actions';
import SortableOfficerTable from './SortableOfficerTable';

type Props = {
  searchParams?: Promise<{
    error?: string;
    editStaff?: string;
    editOfficer?: string;
    addOfficer?: string;
  }>;
};

const inputClass =
  'w-full border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep';
const labelClass = 'mb-1.5 block font-ko text-[12px] font-bold text-ink';

function ErrorMessage({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="border border-red-200 bg-red-50 px-4 py-3 font-ko text-[13px] text-red-800">
      {error}
    </div>
  );
}

function PhotoPreview({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return <img src={src} alt={name} className="h-16 w-16 rounded-full border border-line object-cover" />;
  }

  return (
    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-cream font-ko text-[18px] text-ink-mute">
      {name.charAt(0) || '?'}
    </span>
  );
}

function MusicStaffCard({ staff, editing }: { staff: AdminMusicStaff; editing: boolean }) {
  if (editing) {
    return (
      <form action={updateMusicStaffAction} encType="multipart/form-data" className="border border-line bg-card">
        <input type="hidden" name="id" value={staff.id} />
        <div className="flex items-center gap-4 border-b border-line bg-card-head px-5 py-4">
          <PhotoPreview src={staff.photoUrl} name={staff.name} />
          <div>
            <h3 className="font-ko text-[17px] font-bold text-ink">{staff.roleText}</h3>
            <p className="mt-1 font-ko text-[12px] text-ink-soft">{staff.name || '이름 미입력'}</p>
          </div>
        </div>

        <div className="grid gap-4 px-5 py-5 min-[760px]:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor={`role-${staff.id}`}>직무</label>
            <input id={`role-${staff.id}`} name="role_text" className={inputClass} defaultValue={staff.roleText} />
          </div>
          <div>
            <label className={labelClass} htmlFor={`name-${staff.id}`}>이름</label>
            <input id={`name-${staff.id}`} name="name" className={inputClass} defaultValue={staff.name} />
          </div>
          <div>
            <label className={labelClass} htmlFor={`since-${staff.id}`}>섬김 기간</label>
            <input id={`since-${staff.id}`} name="since_text" className={inputClass} defaultValue={staff.sinceText} />
          </div>
          <div>
            <label className={labelClass} htmlFor={`birth-${staff.id}`}>생일</label>
            <input id={`birth-${staff.id}`} name="birth_label" className={inputClass} defaultValue={staff.birthLabel} />
          </div>
          <div>
            <label className={labelClass} htmlFor={`phone-${staff.id}`}>전화번호</label>
            <input id={`phone-${staff.id}`} name="phone_label" className={inputClass} defaultValue={staff.phoneLabel} />
          </div>
          <div>
            <label className={labelClass} htmlFor={`photo-${staff.id}`}>사진 변경</label>
            <input
              id={`photo-${staff.id}`}
              name="photo_file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={inputClass}
            />
          </div>
          <div className="min-[760px]:col-span-2">
            <label className={labelClass} htmlFor={`note-${staff.id}`}>메모</label>
            <input id={`note-${staff.id}`} name="note" className={inputClass} defaultValue={staff.note} />
          </div>
          <label className="flex items-center gap-2 font-ko text-[13px] text-ink">
            <input type="checkbox" name="is_active" defaultChecked={staff.isActive} />
            공개
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
          <Link
            href="/admin/leaders"
            className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
          >
            취소
          </Link>
          <button
            type="submit"
            className="border border-gold-deep bg-gold-deep px-4 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
          >
            저장
          </button>
        </div>
      </form>
    );
  }

  return (
    <article className={`border border-line bg-card ${!staff.isActive ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4 border-b border-line bg-card-head px-5 py-4">
        <PhotoPreview src={staff.photoUrl} name={staff.name} />
        <div>
          <h3 className="font-ko text-[17px] font-bold text-ink">{staff.roleText}</h3>
          <p className="mt-1 font-ko text-[12px] text-ink-soft">{staff.name || '이름 미입력'}</p>
        </div>
      </div>
      <dl className="grid gap-3 px-5 py-5 font-ko text-[13px]">
        <div>
          <dt className="text-[12px] font-bold text-ink-mute">섬김 기간</dt>
          <dd className="mt-1 text-ink-soft">{staff.sinceText || '-'}</dd>
        </div>
        <div>
          <dt className="text-[12px] font-bold text-ink-mute">생일</dt>
          <dd className="mt-1 text-ink-soft">{staff.birthLabel || '-'}</dd>
        </div>
        <div>
          <dt className="text-[12px] font-bold text-ink-mute">전화번호</dt>
          <dd className="mt-1 text-ink-soft">{staff.phoneLabel || '-'}</dd>
        </div>
        <div>
          <dt className="text-[12px] font-bold text-ink-mute">메모</dt>
          <dd className="mt-1 text-ink-soft">{staff.note || '-'}</dd>
        </div>
      </dl>
      <div className="flex items-center justify-between border-t border-line px-5 py-4">
        <span
          className={`border px-3 py-1 font-ko text-[11px] ${
            staff.isActive
              ? 'border-green-400 bg-green-50 text-green-700'
              : 'border-red-300 bg-red-50 text-red-600'
          }`}
        >
          {staff.isActive ? '공개' : '비공개'}
        </span>
        <Link
          href={`/admin/leaders?editStaff=${staff.id}`}
          className="border border-line bg-cream px-3 py-2 font-ko text-[12px] text-ink transition hover:border-gold"
        >
          수정
        </Link>
      </div>
    </article>
  );
}

function PeopleSelect({ people }: { people: AdminLeaderPersonOption[] }) {
  return (
    <select name="person_id" className={inputClass} defaultValue="">
      <option value="">대원 선택</option>
      {people.map((person) => (
        <option key={person.id} value={person.id}>
          {person.sectionName} · {person.label}
        </option>
      ))}
    </select>
  );
}

function AddOfficerForm({ people }: { people: AdminLeaderPersonOption[] }) {
  return (
    <form action={createOfficerAction} className="grid gap-3 border-b border-line bg-card-head px-5 py-4 min-[760px]:grid-cols-[1.4fr_1fr_auto]">
      <PeopleSelect people={people} />
      <input name="role_text" className={inputClass} placeholder="직무 예: 총무" />
      <input type="hidden" name="is_active" value="on" />
      <button
        type="submit"
        className="border border-gold-deep bg-gold-deep px-4 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
      >
        + 임원 추가
      </button>
    </form>
  );
}

export default async function AdminLeadersPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin');
  }

  const params = await searchParams;
  const data = await getAdminLeadershipData();

  const officerActions = {
    reorder: reorderOfficersAction,
    setActive: setOfficerActiveAction,
    update: updateOfficerAction,
  };

  return (
    <main className="min-h-screen bg-cream px-5 py-8 min-[881px]:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-line pb-6 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <div>
            <p className="mb-3 font-en text-[10px] tracking-[0.34em] uppercase text-gold-deep">
              Praise Choir Admin
            </p>
            <h1 className="font-ko text-[clamp(26px,4vw,42px)] font-bold leading-tight text-ink">
              임원 관리
            </h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/leaders"
              className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
            >
              홈페이지 보기
            </Link>
            <Link
              href="/admin"
              className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
            >
              대시보드로
            </Link>
          </div>
        </header>

        <div className="mt-6 space-y-6">
          <ErrorMessage error={params?.error} />

          {!data.configured ? (
            <section className="border border-red-200 bg-red-50 px-5 py-4 font-ko text-[13px] leading-relaxed text-red-800">
              관리자 쓰기 기능을 사용하려면 환경변수 SUPABASE_SERVICE_ROLE_KEY를 설정해야 합니다.
            </section>
          ) : null}

          <section className="space-y-4">
            <div className="border-b border-line pb-2">
              <h2 className="font-ko text-[22px] font-bold text-ink">지휘 · 반주 · 편곡</h2>
            </div>
            <div className="grid gap-4 min-[1000px]:grid-cols-3">
              {data.musicStaff.map((staff) => (
                <MusicStaffCard key={staff.id} staff={staff} editing={params?.editStaff === staff.id} />
              ))}
            </div>
          </section>

          <section className="border border-line bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-card-head px-5 py-4">
              <h2 className="font-ko text-[22px] font-bold text-ink">임원진</h2>
              <Link
                href="/admin/leaders?addOfficer=1"
                className="border border-gold-deep bg-gold-deep px-4 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
              >
                + 임원 추가
              </Link>
            </div>

            {params?.addOfficer === '1' ? <AddOfficerForm people={data.people} /> : null}

            <SortableOfficerTable
              key={params?.editOfficer ?? 'officers'}
              officers={data.officers}
              editId={params?.editOfficer}
              actions={officerActions}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
