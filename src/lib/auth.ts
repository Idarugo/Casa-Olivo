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

// En producción el prefijo __Secure- obliga al navegador a enviarla solo por https
export const COOKIE = import.meta.env.PROD ? '__Secure-co_session' : 'co_session';
const COOKIE_PATH = '/admin';
const SESSION_DAYS = 7;
const MAX_FAILS = 5; // por correo
const MAX_FAILS_IP = 20; // por dirección IP, sumando todos los correos
const WINDOW_MIN = 15;

// Hash de referencia: si el correo no existe se verifica igual, para que la
// demora no revele qué correos tienen cuenta
const DUMMY = 'scrypt$AAAAAAAAAAAAAAAAAAAAAA==$' + Buffer.alloc(64).toString('base64');

// Contraseñas que se adivinan en segundos
const COMUNES = ['1234567890', '0123456789', '1111111111', 'qwertyuiop', 'contraseña', 'contrasena', 'password', 'casaolivo', 'restaurante', 'olivar'];

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

export function validatePassword(pw: string, email = '') {
  if (pw.length < 10) return 'La contraseña debe tener al menos 10 caracteres.';
  if (pw.length > 200) return 'La contraseña es demasiado larga.';
  const p = pw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const usuario = email.split('@')[0]?.toLowerCase();
  if (new Set(p).size < 4 || COMUNES.some((c) => p.includes(c)) || (usuario && usuario.length > 3 && p.includes(usuario))) {
    return 'Esa contraseña es muy fácil de adivinar. Usa una frase con palabras que no tengan que ver con el restaurante ni con tu correo.';
  }
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

/** Confirma la contraseña actual de alguien que ya tiene sesión (para acciones delicadas). */
export async function checkPassword(userId: number, password: string) {
  const row = await one<{ password_hash: string }>('select password_hash from users where id = $1', [userId]);
  return verifyPassword(password.slice(0, 200), row?.password_hash ?? DUMMY).then((ok) => ok && !!row);
}

export async function setPassword(userId: number, password: string) {
  await query('update users set password_hash = $1 where id = $2', [await hashPassword(password), userId]);
  // Cerrar las demás sesiones al cambiar la contraseña
  await query('delete from sessions where user_id = $1', [userId]);
}

export async function login(email: string, password: string, ip = ''): Promise<{ user?: User; error?: string }> {
  const e = email.trim().toLowerCase().slice(0, 200);
  const fails = await one<{ porCorreo: string; porIp: string }>(
    `select count(*) filter (where email = $1) as "porCorreo", count(*) filter (where ip = $2) as "porIp"
     from login_attempts where not ok and at > now() - interval '${WINDOW_MIN} minutes'`,
    [e, ip],
  );
  if (Number(fails?.porCorreo ?? 0) >= MAX_FAILS || (ip && Number(fails?.porIp ?? 0) >= MAX_FAILS_IP)) {
    return { error: `Demasiados intentos fallidos. Espera ${WINDOW_MIN} minutos e inténtalo otra vez.` };
  }

  const row = await one<User & { password_hash: string }>('select id, email, name, role, password_hash from users where email = $1', [e]);
  const valid = await verifyPassword(password.slice(0, 200), row?.password_hash ?? DUMMY);
  const ok = !!row && valid;
  await query('insert into login_attempts (email, ok, ip) values ($1, $2, $3)', [e, ok, ip || null]);
  // Limpieza: los intentos y sesiones viejas no se guardan para siempre
  if (Math.random() < 0.05) {
    await query(`delete from login_attempts where at < now() - interval '30 days'`);
    await query('delete from sessions where expires_at < now()');
  }
  if (!ok) return { error: 'El correo o la contraseña no coinciden.' };
  return { user: { id: row!.id, email: row!.email, name: row!.name, role: row!.role } };
}

export async function startSession(cookies: AstroCookies, userId: number) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await query('insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)', [sha(token), userId, expires.toISOString()]);
  cookies.set(COOKIE, token, {
    path: COOKIE_PATH,
    httpOnly: true,
    sameSite: 'strict',
    secure: import.meta.env.PROD,
    expires,
  });
}

export async function endSession(cookies: AstroCookies) {
  const token = cookies.get(COOKIE)?.value;
  if (token) await query('delete from sessions where token_hash = $1', [sha(token)]);
  cookies.delete(COOKIE, { path: COOKIE_PATH });
  cookies.delete('co_session', { path: '/' }); // cookie de versiones anteriores
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
