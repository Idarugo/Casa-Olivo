/*
  Usuarios y sesiones del panel.
  Contraseñas con scrypt y sal; la cookie lleva un token aleatorio y en la base
  solo se guarda su hash, así un respaldo filtrado no sirve para entrar.
*/
import { randomBytes, scrypt as _scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import type { AstroCookies } from 'astro';
import { query, one } from './db';

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const COOKIE = 'co_session';
const SESSION_DAYS = 30;
const MAX_FAILS = 5;
const WINDOW_MIN = 15;

export type User = { id: number; email: string; name: string; role: string };

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

async function verifyPassword(pw: string, stored: string) {
  const [alg, saltB64, hashB64] = stored.split('$');
  if (alg !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await scrypt(pw, Buffer.from(saltB64, 'base64'), expected.length);
  return timingSafeEqual(expected, actual);
}

const sha = (t: string) => createHash('sha256').update(t).digest('hex');

export function validatePassword(pw: string) {
  if (pw.length < 10) return 'La contraseña debe tener al menos 10 caracteres.';
  return null;
}

export async function countUsers() {
  const row = await one<{ n: string }>('select count(*) as n from users');
  return Number(row?.n ?? 0);
}

export async function createUser(email: string, name: string, password: string, role = 'admin') {
  const hash = await hashPassword(password);
  const row = await one<User>('insert into users (email, name, password_hash, role) values ($1, $2, $3, $4) returning id, email, name, role', [
    email.trim().toLowerCase(),
    name.trim(),
    hash,
    role,
  ]);
  return row!;
}

export async function setPassword(userId: number, password: string) {
  await query('update users set password_hash = $1 where id = $2', [await hashPassword(password), userId]);
  // Cerrar las demás sesiones al cambiar la contraseña
  await query('delete from sessions where user_id = $1', [userId]);
}

export async function login(email: string, password: string): Promise<{ user?: User; error?: string }> {
  const e = email.trim().toLowerCase();
  const fails = await one<{ n: string }>(
    `select count(*) as n from login_attempts where email = $1 and not ok and at > now() - interval '${WINDOW_MIN} minutes'`,
    [e],
  );
  if (Number(fails?.n ?? 0) >= MAX_FAILS) return { error: `Demasiados intentos fallidos. Espera ${WINDOW_MIN} minutos e inténtalo otra vez.` };

  const row = await one<User & { password_hash: string }>('select id, email, name, role, password_hash from users where email = $1', [e]);
  const ok = !!row && (await verifyPassword(password, row.password_hash));
  await query('insert into login_attempts (email, ok) values ($1, $2)', [e, ok]);
  if (!ok) return { error: 'El correo o la contraseña no coinciden.' };
  return { user: { id: row!.id, email: row!.email, name: row!.name, role: row!.role } };
}

export async function startSession(cookies: AstroCookies, userId: number) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await query('insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)', [sha(token), userId, expires.toISOString()]);
  cookies.set(COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    expires,
  });
}

export async function endSession(cookies: AstroCookies) {
  const token = cookies.get(COOKIE)?.value;
  if (token) await query('delete from sessions where token_hash = $1', [sha(token)]);
  cookies.delete(COOKIE, { path: '/' });
}

export async function currentUser(cookies: AstroCookies): Promise<User | undefined> {
  const token = cookies.get(COOKIE)?.value;
  if (!token) return;
  return one<User>(
    `select u.id, u.email, u.name, u.role from sessions s join users u on u.id = s.user_id
     where s.token_hash = $1 and s.expires_at > now()`,
    [sha(token)],
  );
}

/** En producción, crear el primer usuario exige la clave SETUP_KEY definida en Vercel. */
export function setupKeyRequired() {
  return import.meta.env.PROD;
}
export function checkSetupKey(given: string) {
  const expected = process.env.SETUP_KEY ?? import.meta.env.SETUP_KEY;
  if (!setupKeyRequired()) return true;
  if (!expected || !given) return false;
  const a = Buffer.from(sha(given));
  const b = Buffer.from(sha(expected));
  return timingSafeEqual(a, b);
}
