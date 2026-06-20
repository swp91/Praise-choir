import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getAdminLeadershipData, type AdminLeaderPersonOption } from '@/lib/admin/leadership';
import {
  createOfficerAction,
  reorderOfficersAction,
  setOfficerActiveAction,
  updateOfficerAction,
} from './actions';
import SortableOfficerTable from './SortableOfficerTable';
import AdminNotification from '../main/AdminNotification';

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

function ErrorMessage({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="border border-red-200 bg-red-50 px-4 py-3 font-ko text-[13px] text-red-800">
      {error}
    </div>
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
      <AdminNotification />
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-line pb-6 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <div>
            <p className="mb-3 font-en text-[10px] tracking-[0.34em] uppercase text-gold-deep">
              Praise Choir Admin
            </p>
            <h1 className="font-ko text-[clamp(26px,4vw,42px)] font-bold leading-tight text-ink">
              임원 관리
            </h1>
            <p className="mt-3 max-w-2xl font-ko text-[14px] leading-relaxed text-ink-soft">
              임원을 추가하거나 삭제, 직무를 변경할수 있습니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
            >
              대시보드로
            </Link>
          </div>
        </header>

        <div id="leaders-message" className="mt-6 space-y-6">
          <ErrorMessage error={params?.error} />

          {!data.configured ? (
            <section className="border border-red-200 bg-red-50 px-5 py-4 font-ko text-[13px] leading-relaxed text-red-800">
              관리자 쓰기 기능을 사용하려면 환경변수 SUPABASE_SERVICE_ROLE_KEY를 설정해야 합니다.
            </section>
          ) : null}



          <section id="officers" className="scroll-mt-6 border border-line bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-card-head px-5 py-4">
              <h2 className="font-ko text-[22px] font-bold text-ink">임원진</h2>
              <Link
                href="/admin/leaders?addOfficer=1#officers"
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
