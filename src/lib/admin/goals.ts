import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';

type DbError = { message?: string };

function must<T>(result: { data: T | null; error: DbError | null }, label: string) {
  if (result.error) throw new Error(`${label}: ${result.error.message ?? 'unknown error'}`);
  return result.data as T;
}

export type AdminGoal = {
  id: string;
  year: number;
  text: string;
  sortOrder: number;
  isActive: boolean;
};

export type AdminGoalsData = {
  configured: boolean;
  year: number;
  themeKo: string;
  goalTitleKo: string;
  goals: AdminGoal[];
};

export async function getAdminGoalsData(): Promise<AdminGoalsData> {
  const currentYear = new Date().getFullYear();

  if (!isSupabaseAdminConfigured()) {
    return { configured: false, year: currentYear, themeKo: '', goalTitleKo: '', goals: [] };
  }

  const supabase = getSupabaseAdmin();

  const [profileResult, goalsResult] = await Promise.all([
    supabase.from('annual_profiles').select('year,theme_ko,goal_title_ko').eq('year', currentYear).maybeSingle(),
    supabase.from('goal_items').select('*').eq('year', currentYear).order('sort_order').order('created_at'),
  ]);

  const profile = profileResult.data;
  const goals = must<Record<string, unknown>[]>(goalsResult, '목표 조회 실패') ?? [];

  return {
    configured: true,
    year: currentYear,
    themeKo: profile ? String(profile.theme_ko) : '',
    goalTitleKo: profile ? String(profile.goal_title_ko) : '일곱 가지 목표',
    goals: goals.map((g) => ({
      id: String(g.id),
      year: Number(g.year),
      text: String(g.text),
      sortOrder: Number(g.sort_order ?? 0),
      isActive: g.is_active !== false,
    })),
  };
}

export async function createGoal(text: string, year: number) {
  const supabase = getSupabaseAdmin();
  const maxResult = await supabase
    .from('goal_items')
    .select('sort_order')
    .eq('year', year)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (Number(maxResult.data?.sort_order ?? -1)) + 1;

  must(
    await supabase.from('goal_items').insert({ year, text: text.trim(), sort_order: nextOrder, is_active: true }),
    '목표 추가 실패',
  );
}

export async function updateGoalText(id: string, text: string) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase.from('goal_items').update({ text: text.trim() }).eq('id', id),
    '목표 수정 실패',
  );
}

export async function setGoalActive(id: string, active: boolean) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase.from('goal_items').update({ is_active: active }).eq('id', id),
    '목표 상태 변경 실패',
  );
}

export async function reorderGoals(orderedIds: string[]) {
  const supabase = getSupabaseAdmin();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('goal_items').update({ sort_order: index }).eq('id', id),
    ),
  );
}

export async function deleteGoal(id: string) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase.from('goal_items').delete().eq('id', id),
    '목표 삭제 실패',
  );
}

export async function updateAnnualProfile(year: number, themeKo: string, goalTitleKo: string) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase
      .from('annual_profiles')
      .update({ theme_ko: themeKo.trim(), goal_title_ko: goalTitleKo.trim() })
      .eq('year', year),
    '연간 프로필 수정 실패',
  );
}
