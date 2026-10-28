/*
  Estado de servicios: revisa en vivo todo aquello de lo que depende el sitio.
  Cada revisión tiene tiempo límite y nunca lanza: devuelve ok, aviso o error.
*/
import { query, one } from './db';
import { loadContent } from './content';
import { termina } from './format';

export type Level = 'ok' | 'warn' | 'error' | 'info';
export type Check = { key: string; group: string; label: string; level: Level; detail: string; ms?: number; href?: string };

const TIMEOUT = 6000;

async function timed<T>(fn: () => Promise<T>) {
  const t = performance.now();
  const value = await fn();
  return { value, ms: Math.round(performance.now() - t) };
}

async function probe(url: string) {
  try {
    const { value: res, ms } = await timed(() =>
      fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT), headers: { 'User-Agent': 'CasaOlivo-Estado/1.0' } }),
    );
    return { ok: res.status < 400, status: res.status, ms };
  } catch (e) {
    return { ok: false, status: 0, ms: TIMEOUT, error: (e as Error).name === 'TimeoutError' ? 'No respondió a tiempo' : 'No se pudo conectar' };
  }
}

const fmtBytes = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`);

export async function runChecks(): Promise<Check[]> {
  const checks: Check[] = [];
  const add = (c: Check) => checks.push(c);

  // Base de datos
  try {
    const { ms } = await timed(() => query('select 1'));
    let size = '';
    try {
      const r = await one<{ s: string }>('select pg_database_size(current_database()) as s');
      size = r ? ` · ${fmtBytes(Number(r.s))} usados` : '';
    } catch {
      /* algunos motores no lo informan */
    }
    const local = !(process.env.DATABASE_URL ?? import.meta.env.DATABASE_URL);
    add({
      key: 'db',
      group: 'Servicios',
      label: local ? 'Base de datos local (PGlite)' : 'Base de datos (Neon)',
      level: ms > 1500 ? 'warn' : 'ok',
      detail: `Responde en ${ms} ms${size}`,
      ms,
    });
  } catch (e) {
    add({ key: 'db', group: 'Servicios', label: 'Base de datos', level: 'error', detail: `No responde: ${(e as Error).message}` });
    return checks; // sin base no hay nada más que revisar
  }

  const c = await loadContent();

  const tasks: Promise<void>[] = [];

  // Fotos
  tasks.push(
    (async () => {
      const token = process.env.BLOB_READ_WRITE_TOKEN ?? import.meta.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        add({
          key: 'blob',
          group: 'Servicios',
          label: 'Fotos',
          level: import.meta.env.DEV ? 'info' : 'error',
          detail: import.meta.env.DEV ? 'En desarrollo se guardan en .data/uploads' : 'Falta BLOB_READ_WRITE_TOKEN: no se pueden subir fotos',
        });
        return;
      }
      try {
        const { list } = await import('@vercel/blob');
        const { value, ms } = await timed(() => list({ token, limit: 1000, prefix: 'uploads/' }));
        const total = value.blobs.reduce((s, b) => s + b.size, 0);
        add({
          key: 'blob',
          group: 'Servicios',
          label: 'Fotos (Vercel Blob)',
          level: 'ok',
          detail: `Conectado en ${ms} ms · ${value.blobs.length} archivos subidos (${fmtBytes(total)})`,
          ms,
        });
      } catch (e) {
        add({ key: 'blob', group: 'Servicios', label: 'Fotos (Vercel Blob)', level: 'error', detail: `No responde: ${(e as Error).message}` });
      }
    })(),
  );

  // Reservas
  tasks.push(
    (async () => {
      const url = `https://app.tableo.com/widget/${encodeURIComponent(c.general.tableo_slug)}`;
      const r = await probe(url);
      add({
        key: 'tableo',
        group: 'Servicios externos',
        label: 'Reservas (Tableo)',
        level: r.ok ? (r.ms > 3000 ? 'warn' : 'ok') : 'error',
        detail: r.ok ? `El formulario de reservas carga en ${r.ms} ms` : `El widget no carga (${r.error ?? `error ${r.status}`}). Revisa el identificador en Datos del local.`,
        ms: r.ms,
        href: '/admin/ajustes/general',
      });
    })(),
  );

  // Mapa
  tasks.push(
    (async () => {
      const r = await probe(c.general.maps);
      add({
        key: 'maps',
        group: 'Servicios externos',
        label: 'Google Maps',
        level: r.ok ? 'ok' : 'warn',
        detail: r.ok ? 'El enlace "Cómo llegar" funciona' : `El enlace no responde (${r.error ?? `error ${r.status}`})`,
        ms: r.ms,
        href: '/admin/ajustes/general',
      });
    })(),
  );

  // Karaoke
  const futuras = c.karaoke.jornadas.filter((j) => termina(j.fecha) > Date.now());
  if (c.karaoke.activo && futuras.length) {
    tasks.push(
      (async () => {
        const r = await probe(c.karaoke.form);
        add({
          key: 'form',
          group: 'Servicios externos',
          label: 'Inscripción al karaoke (Google Forms)',
          level: r.ok ? 'ok' : 'error',
          detail: r.ok ? 'El formulario está disponible' : `El formulario no responde (${r.error ?? `error ${r.status}`})`,
          ms: r.ms,
          href: '/admin/ajustes/karaoke',
        });
      })(),
    );
  }

  // Entradas de cada show próximo
  const proximos = c.shows.filter((s) => termina(s.fecha) > Date.now());
  for (const s of proximos) {
    tasks.push(
      (async () => {
        const r = await probe(s.entradas);
        add({
          key: `show-${s.id}`,
          group: 'Servicios externos',
          label: `Entradas: ${s.artista}`,
          level: r.ok ? 'ok' : 'error',
          detail: r.ok ? 'La página de venta está disponible' : `La página de entradas no responde (${r.error ?? `error ${r.status}`})`,
          ms: r.ms,
          href: `/admin/shows/${s.id}`,
        });
      })(),
    );
  }

  await Promise.all(tasks);

  // Contenido
  const sinAfiche = proximos.filter((s) => !s.poster);
  if (sinAfiche.length) add({ key: 'c-afiche', group: 'Contenido', label: 'Shows sin afiche', level: 'warn', detail: sinAfiche.map((s) => s.artista).join(', '), href: '/admin/shows' });
  const sinAlt = c.scenes.filter((s) => !s.alt.trim());
  if (sinAlt.length) add({ key: 'c-alt', group: 'Contenido', label: 'Fotos del inicio sin descripción', level: 'warn', detail: `${sinAlt.map((s) => s.label).join(', ')}. La descripción ayuda en Google y a lectores de pantalla.`, href: '/admin/escenas' });
  const vacias = [...c.cocina, ...c.bar].filter((cat) => cat.grupos.length === 0);
  if (vacias.length) add({ key: 'c-vacias', group: 'Contenido', label: 'Categorías sin platos visibles', level: 'warn', detail: `${vacias.map((x) => x.titulo).join(', ')} no aparecen en la carta.`, href: '/admin/carta_categorias' });
  if (c.karaoke.activo && c.karaoke.jornadas.length && !futuras.length)
    add({ key: 'c-karaoke', group: 'Contenido', label: 'Concurso de karaoke terminado', level: 'info', detail: 'Ya pasaron todas las jornadas, así que el concurso no se muestra en el inicio.', href: '/admin/ajustes/karaoke' });
  if (!proximos.length) add({ key: 'c-shows', group: 'Contenido', label: 'Sin shows próximos', level: 'info', detail: 'La agenda muestra "Pronto anunciaremos nuevos shows".', href: '/admin/shows/nuevo' });
  if (!checks.some((x) => x.group === 'Contenido' && x.level === 'warn'))
    add({ key: 'c-ok', group: 'Contenido', label: 'Contenido revisado', level: 'ok', detail: 'Afiches, descripciones de fotos y categorías en orden.' });

  // Seguridad
  const [usuarios, sesiones, fallidos] = await Promise.all([
    one<{ n: string }>('select count(*) as n from users'),
    one<{ n: string }>('select count(*) as n from sessions where expires_at > now()'),
    one<{ n: string }>(`select count(*) as n from login_attempts where not ok and at > now() - interval '24 hours'`),
  ]);
  const hayUsuarios = Number(usuarios?.n ?? 0) > 0;
  if (hayUsuarios && (process.env.SETUP_KEY ?? import.meta.env.SETUP_KEY) && import.meta.env.PROD)
    add({
      key: 's-setup',
      group: 'Seguridad',
      label: 'SETUP_KEY ya no es necesaria',
      level: 'warn',
      detail: 'Ya existe una cuenta de administrador. Borra SETUP_KEY en Vercel → Settings → Environment Variables.',
    });
  const nFallidos = Number(fallidos?.n ?? 0);
  add({
    key: 's-logins',
    group: 'Seguridad',
    label: 'Ingresos fallidos en 24 horas',
    level: nFallidos >= 10 ? 'warn' : 'ok',
    detail: nFallidos ? `${nFallidos} intentos fallidos. Tras 5 seguidos, la cuenta se bloquea 15 minutos.` : 'Ninguno',
  });
  add({ key: 's-sesiones', group: 'Seguridad', label: 'Sesiones abiertas', level: 'info', detail: `${sesiones?.n ?? 0} en total, de ${usuarios?.n ?? 0} usuarios` });

  return checks;
}

export function deployInfo() {
  const env = process.env;
  return {
    entorno: env.VERCEL_ENV ?? (import.meta.env.DEV ? 'desarrollo' : 'producción'),
    commit: env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
    mensaje: env.VERCEL_GIT_COMMIT_MESSAGE?.split('\n')[0],
    autor: env.VERCEL_GIT_COMMIT_AUTHOR_NAME,
    rama: env.VERCEL_GIT_COMMIT_REF,
    region: env.VERCEL_REGION,
    url: env.VERCEL_PROJECT_PRODUCTION_URL ?? env.VERCEL_URL,
    node: process.version,
    repo: env.VERCEL_GIT_REPO_OWNER && env.VERCEL_GIT_REPO_SLUG ? `${env.VERCEL_GIT_REPO_OWNER}/${env.VERCEL_GIT_REPO_SLUG}` : undefined,
  };
}
