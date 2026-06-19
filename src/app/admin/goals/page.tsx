import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getAdminGoalsData } from '@/lib/admin/goals';
import {
  createGoalAction,
  setGoalActiveAction,
  reorderGoalsAction,
  updateGoalTextAction,
} from './actions';
import SortableGoalList from './SortableGoalList';
import AnnualProfileEditor from './AnnualProfileEditor';

const inputClass =
  'w-full border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep resize-none';
const labelClass = 'block font-ko text-[12px] font-bold text-ink mb-1.5';

export default async function AdminGoalsPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin');

  const data = await getAdminGoalsData();

  const actions = {
    toggleActive: setGoalActiveAction,
    reorder: reorderGoalsAction,
    updateText: updateGoalTextAction,
  };

  return (
    <main className="min-h-screen bg-cream px-5 py-8 min-[881px]:px-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-col gap-5 border-b border-line pb-6 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <div>
            <p className="font-en text-[10px] tracking-[0.34em] uppercase text-gold-deep mb-3">
              Praise Choir Admin
            </p>
            <h1 className="font-ko text-[clamp(26px,4vw,42px)] font-bold leading-tight text-ink">
              표어, 비전관리
            </h1>
            <p className="mt-3 font-ko text-[14px] leading-relaxed text-ink-soft">
              연도별 표어와 비전 항목을 관리합니다.
            </p>
          </div>
          <Link
            href="/admin"
            className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
          >
            대시보드로
          </Link>
        </header>

        <div className="mt-6 space-y-4">
          {/* 연간 프로필 편집 */}
          <section className="border border-line bg-card">
            <div className="border-b border-line bg-card-head px-5 py-4">
              <h2 className="font-ko text-[22px] font-bold text-ink">표어</h2>
            </div>
            <AnnualProfileEditor
              year={data.year}
              themeKo={data.themeKo}
              goalTitleKo={data.goalTitleKo}
            />
          </section>

          {/* 비전 목록 */}
          <section className="border border-line bg-card">
            <div className="border-b border-line bg-card-head px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-ko text-[22px] font-bold text-ink">{data.goalTitleKo}</h2>
                <p className="mt-1 font-ko text-[12px] text-ink-mute">
                  번호를 드래그해서 순서를 변경합니다.
                </p>
              </div>
              <span className="font-en text-[12px] italic text-gold-deep">
                {data.goals.filter((g) => g.isActive).length} active
              </span>
            </div>

            {data.configured ? (
              <SortableGoalList goals={data.goals} actions={actions} />
            ) : (
              <p className="px-5 py-6 font-ko text-[13px] text-red-700">
                SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.
              </p>
            )}
          </section>

          {/* 비전 추가 */}
          <section className="border border-line bg-card">
            <div className="border-b border-line bg-card-head px-5 py-4">
              <h2 className="font-ko text-[18px] font-bold text-ink">비전 추가</h2>
            </div>
            <form action={createGoalAction} className="px-5 py-5">
              <input type="hidden" name="year" value={data.year} />
              <label className={labelClass} htmlFor="new_goal_text">비전 내용</label>
              <textarea
                id="new_goal_text"
                name="text"
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder="예: 찬양을 통해 하나님의 사랑을 함께 누리는 프레이즈"
                required
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
                >
                  + 비전 추가
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
