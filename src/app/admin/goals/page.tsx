import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getAdminGoalsData } from '@/lib/admin/goals';
import {
  createGoalAction,
  setGoalActiveAction,
  reorderGoalsAction,
  updateGoalTextAction,
  deleteGoalAction,
  updateAnnualProfileAction,
} from './actions';
import SortableGoalList from './SortableGoalList';

const inputClass =
  'w-full border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep';
const labelClass = 'block font-ko text-[12px] font-bold text-ink mb-1.5';

type Props = {
  searchParams?: Promise<{ saved?: string }>;
};

function StatusMessage({ saved }: { saved?: string }) {
  const message =
    saved === 'created' ? '목표를 추가했습니다.' :
    saved === 'deleted' ? '목표를 삭제했습니다.' :
    saved === 'profile' ? '연간 프로필을 수정했습니다.' : '';

  if (!message) return null;

  return (
    <div className="border border-gold/50 bg-gold/10 px-4 py-3 font-ko text-[13px] text-gold-deep">
      {message}
    </div>
  );
}

export default async function AdminGoalsPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect('/admin');

  const params = await searchParams;
  const data = await getAdminGoalsData();

  const actions = {
    toggleActive: setGoalActiveAction,
    reorder: reorderGoalsAction,
    updateText: updateGoalTextAction,
    deleteGoal: deleteGoalAction,
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
              목표 관리
            </h1>
            <p className="mt-3 font-ko text-[14px] leading-relaxed text-ink-soft">
              연도별 표어와 목표 항목을 관리합니다.
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
          <StatusMessage saved={params?.saved} />

          {/* 연간 프로필 편집 */}
          <section className="border border-line bg-card">
            <div className="border-b border-line bg-card-head px-5 py-4">
              <h2 className="font-ko text-[18px] font-bold text-ink">{data.year}년 표어</h2>
            </div>
            <form action={updateAnnualProfileAction} className="px-5 py-5 space-y-4">
              <input type="hidden" name="year" value={data.year} />
              <div>
                <label className={labelClass} htmlFor="theme_ko">표어 (큰 제목)</label>
                <input
                  id="theme_ko"
                  name="theme_ko"
                  className={inputClass}
                  defaultValue={data.themeKo}
                  placeholder="예: 오직 하나님을 기뻐함으로 승리하는 프레이즈"
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="goal_title_ko">목표 섹션 제목</label>
                <input
                  id="goal_title_ko"
                  name="goal_title_ko"
                  className={inputClass}
                  defaultValue={data.goalTitleKo}
                  placeholder="예: 일곱 가지 목표, 다섯 가지 목표"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
                >
                  표어 저장
                </button>
              </div>
            </form>
          </section>

          {/* 목표 목록 */}
          <section className="border border-line bg-card">
            <div className="border-b border-line bg-card-head px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-ko text-[18px] font-bold text-ink">{data.goalTitleKo}</h2>
                <p className="mt-1 font-ko text-[12px] text-ink-mute">
                  번호를 드래그해서 순서를 변경하고, 텍스트를 클릭해서 수정합니다.
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

          {/* 목표 추가 */}
          <section className="border border-line bg-card">
            <div className="border-b border-line bg-card-head px-5 py-4">
              <h2 className="font-ko text-[18px] font-bold text-ink">목표 추가</h2>
            </div>
            <form action={createGoalAction} className="px-5 py-5">
              <input type="hidden" name="year" value={data.year} />
              <label className={labelClass} htmlFor="new_goal_text">목표 내용</label>
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
                  + 목표 추가
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
