import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getAdminEventsData, type AdminEvent, type AdminEventYear } from '@/lib/admin/events';
import {
  createEventAction,
  createEventYearAction,
  reorderEventsAction,
  setEventHighlightAction,
  setEventPublishedAction,
  updateEventAction,
} from './actions';
import SortableEventList from './SortableEventList';

type Props = {
  searchParams?: Promise<{
    year?: string;
    edit?: string;
    addYear?: string;
    error?: string;
  }>;
};

const inputClass =
  'w-full border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep';
const labelClass = 'block font-ko text-[12px] font-bold text-ink mb-1.5';

const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

function ErrorMessage({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="border border-red-200 bg-red-50 px-4 py-3 font-ko text-[13px] text-red-800">
      {error}
    </div>
  );
}

function YearTabs({
  years,
  selectedYear,
}: {
  years: AdminEventYear[];
  selectedYear: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {years.map((option) => {
        const active = option.year === selectedYear;
        const label = `${option.year} ${option.displayType === 'schedule' ? '일정' : '보고'}`;
        return (
          <Link
            key={option.year}
            href={`/admin/events?year=${option.year}`}
            className={`border px-3 py-1.5 font-ko text-[12px] transition ${
              active
                ? 'border-gold-deep bg-gold-deep text-cream'
                : 'border-line bg-card text-ink-soft hover:border-gold hover:text-ink'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

function EventForm({
  year,
  years,
  event,
}: {
  year: number;
  years: AdminEventYear[];
  event?: AdminEvent;
}) {
  const action = event ? updateEventAction : createEventAction;
  const title = event ? '일정 수정' : '일정 추가';
  const submitLabel = event ? '수정 저장' : '+ 일정 추가';

  return (
    <section className="border border-line bg-card">
      <div className="border-b border-line bg-card-head px-5 py-4">
        <h2 className="font-ko text-[18px] font-bold text-ink">{title}</h2>
      </div>
      <form action={action} className="grid gap-4 px-5 py-5 min-[780px]:grid-cols-2">
        {event ? <input type="hidden" name="id" value={event.id} /> : null}

        <div>
          <label className={labelClass} htmlFor="year">연도</label>
          <select
            id="year"
            name="year"
            className={inputClass}
            defaultValue={event?.year ?? year}
            required
          >
            {years.map((option) => (
              <option key={option.year} value={option.year}>
                {option.year} {option.displayType === 'schedule' ? '일정' : '보고'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="event_date">정확한 날짜</label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            className={inputClass}
            defaultValue={event?.eventDate ?? ''}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="month">월만 알 때</label>
          <select
            id="month"
            name="month"
            className={inputClass}
            defaultValue={event?.eventDate ? '' : event?.month ?? ''}
          >
            <option value="">날짜가 있거나 미정이면 비워둠</option>
            {monthOptions.map((month) => (
              <option key={month} value={month}>{month}월</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="category">분류</label>
          <input
            id="category"
            name="category"
            className={inputClass}
            defaultValue={event?.category ?? ''}
            placeholder="예: 예배, 찬양제, 부흥회"
          />
        </div>

        <div className="min-[780px]:col-span-2">
          <label className={labelClass} htmlFor="title">일정 제목</label>
          <input
            id="title"
            name="title"
            className={inputClass}
            defaultValue={event?.title ?? ''}
            placeholder="예: 제27회 광진찬양제"
            required
          />
        </div>

        <div className="min-[780px]:col-span-2">
          <label className={labelClass} htmlFor="detail">세부 설명</label>
          <textarea
            id="detail"
            name="detail"
            rows={2}
            className={`${inputClass} resize-none`}
            defaultValue={event?.detail ?? ''}
            placeholder="예: 2026.07.05 예정, 내영혼이 은총입어 · 대상 수상"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 min-[780px]:col-span-2">
          <label className="flex items-center gap-2 font-ko text-[13px] text-ink">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={event?.isPublished ?? true}
              className="h-4 w-4 accent-gold-deep"
            />
            홈페이지 공개
          </label>
          <label className="flex items-center gap-2 font-ko text-[13px] text-ink">
            <input
              type="checkbox"
              name="is_highlight"
              defaultChecked={event?.isHighlight ?? false}
              className="h-4 w-4 accent-gold-deep"
            />
            강조 표시
          </label>
        </div>

        <div className="flex justify-end gap-2 min-[780px]:col-span-2">
          {event ? (
            <Link
              href={`/admin/events?year=${year}`}
              className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
            >
              취소
            </Link>
          ) : null}
          <button
            type="submit"
            className="border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}

function YearCreateForm({
  currentYear,
  candidateYears,
}: {
  currentYear: number;
  candidateYears: number[];
}) {
  return (
    <section className="border border-line bg-card">
      <div className="border-b border-line bg-card-head px-5 py-4">
        <h2 className="font-ko text-[18px] font-bold text-ink">년도 추가</h2>
      </div>
      <form action={createEventYearAction} className="grid gap-4 px-5 py-5 min-[720px]:grid-cols-[1fr_1fr_auto] min-[720px]:items-end">
        <div>
          <label className={labelClass} htmlFor="new_event_year">년도</label>
          <select id="new_event_year" name="year" className={inputClass} defaultValue={candidateYears[0] ?? currentYear + 1}>
            {candidateYears.length ? (
              candidateYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))
            ) : (
              <option value="">추가 가능한 년도가 없습니다</option>
            )}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="display_type">표시 방식</label>
          <select id="display_type" name="display_type" className={inputClass} defaultValue="schedule">
            <option value="schedule">일정</option>
            <option value="report">보고</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Link
            href="/admin/events"
            className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={!candidateYears.length}
            className="border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink disabled:cursor-not-allowed disabled:border-line disabled:bg-ink-mute"
          >
            추가
          </button>
        </div>
      </form>
    </section>
  );
}

export default async function AdminEventsPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect('/admin');

  const params = await searchParams;
  const data = await getAdminEventsData(params?.year);
  const editingEvent = params?.edit ? data.events.find((event) => event.id === params.edit) : undefined;
  const showYearCreate = params?.addYear === '1';

  const actions = {
    reorder: reorderEventsAction,
    setPublished: setEventPublishedAction,
    setHighlight: setEventHighlightAction,
  };

  return (
    <main className="min-h-screen bg-cream px-5 py-8 min-[881px]:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-line pb-6 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <div>
            <p className="font-en text-[10px] tracking-[0.34em] uppercase text-gold-deep mb-3">
              Praise Choir Admin
            </p>
            <h1 className="font-ko text-[clamp(26px,4vw,42px)] font-bold leading-tight text-ink">
              일정 관리
            </h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/events?addYear=1"
              className="border border-gold-deep bg-gold-deep px-4 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
            >
              + 년도추가
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
            </section>
          ) : null}

          {showYearCreate ? (
            <YearCreateForm currentYear={data.currentYear} candidateYears={data.candidateYears} />
          ) : null}

          <section className="border border-line bg-card">
            <div className="space-y-3 border-b border-line bg-card-head px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-ko text-[18px] font-bold text-ink">{data.selectedYear}년 일정</h2>
                <span className="font-en text-[12px] italic text-gold-deep">
                  {data.events.filter((event) => event.isPublished).length} published
                </span>
              </div>
              <YearTabs
                years={data.yearOptions}
                selectedYear={data.selectedYear}
              />
            </div>
            {data.configured ? (
              <SortableEventList events={data.events} year={data.selectedYear} actions={actions} />
            ) : (
              <p className="px-5 py-6 font-ko text-[13px] text-red-700">
                SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.
              </p>
            )}
          </section>

          <EventForm year={data.selectedYear} years={data.yearOptions} event={editingEvent} />
        </div>
      </div>
    </main>
  );
}
