'use server';

import { redirect } from 'next/navigation';
import { signInAdmin, signOutAdmin } from '@/lib/admin/auth';

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const signedIn = await signInAdmin(password);

  if (!signedIn) {
    redirect('/admin?error=1');
  }

  redirect('/admin');
}

export async function logoutAdmin() {
  await signOutAdmin();
  redirect('/admin');
}
