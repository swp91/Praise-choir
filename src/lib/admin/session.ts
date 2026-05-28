import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_VERSION = 'v1';

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createAdminSessionToken(secret: string, ttlSeconds: number, now = Date.now()) {
  const expiresAt = now + ttlSeconds * 1000;
  const payload = `${TOKEN_VERSION}.${expiresAt}`;
  const signature = sign(payload, secret);

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined, secret: string, now = Date.now()) {
  if (!token || !secret) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [version, expiresAtValue, signature] = parts;
  if (version !== TOKEN_VERSION) return false;

  const expiresAt = Number(expiresAtValue);
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return false;

  const expected = sign(`${version}.${expiresAtValue}`, secret);
  return safeEqual(signature, expected);
}
