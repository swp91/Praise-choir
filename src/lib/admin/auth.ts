import { timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
} from './session';

export const ADMIN_SESSION_COOKIE = 'praise_admin_session';
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? '';
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || getAdminPassword();
}

function safeTextEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminAuthConfigured() {
  return Boolean(getAdminPassword());
}

export async function isAdminAuthenticated() {
  const secret = getAdminSessionSecret();
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return verifyAdminSessionToken(token, secret);
}

export async function signInAdmin(password: string) {
  const expectedPassword = getAdminPassword();
  const secret = getAdminSessionSecret();

  if (!expectedPassword || !secret || !safeTextEqual(password, expectedPassword)) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(secret, ADMIN_SESSION_TTL_SECONDS), {
    httpOnly: true,
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return true;
}

export async function signOutAdmin() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
