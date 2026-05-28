'use server';

import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import {
  createGoal,
  updateGoalText,
  setGoalActive,
  reorderGoals,
  deleteGoal,
  updateAnnualProfile,
} from '@/lib/admin/goals';

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect('/admin');
}

export async function createGoalAction(formData: FormData) {
  await requireAdmin();
  const text = String(formData.get('text') ?? '').trim();
  const year = Number(formData.get('year'));
  if (!text || !year) return;
  await createGoal(text, year);
  redirect('/admin/goals?saved=created');
}

export async function updateGoalTextAction(id: string, text: string) {
  await requireAdmin();
  await updateGoalText(id, text);
}

export async function setGoalActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await setGoalActive(id, active);
}

export async function reorderGoalsAction(orderedIds: string[]) {
  await requireAdmin();
  await reorderGoals(orderedIds);
}

export async function deleteGoalAction(id: string) {
  await requireAdmin();
  await deleteGoal(id);
  redirect('/admin/goals?saved=deleted');
}

export async function updateAnnualProfileAction(formData: FormData) {
  await requireAdmin();
  const year = Number(formData.get('year'));
  const themeKo = String(formData.get('theme_ko') ?? '').trim();
  const goalTitleKo = String(formData.get('goal_title_ko') ?? '').trim();
  if (!year || !themeKo || !goalTitleKo) return;
  await updateAnnualProfile(year, themeKo, goalTitleKo);
  redirect('/admin/goals?saved=profile');
}
