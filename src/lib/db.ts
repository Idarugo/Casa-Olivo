/*
  Base de datos.
  En producción: Postgres de Neon (variable DATABASE_URL, la crea Vercel).
  En desarrollo sin DATABASE_URL: PGlite, un Postgres embebido guardado en .data/.
  Ambos hablan el mismo SQL, así que el resto del código no distingue.
*/

export type Row = Record<string, any>;
type Driver = { query(text: string, params?: unknown[]): Promise<Row[]> };

const SCHEMA = [
  `create table if not exists users (
    id serial primary key,
    email text unique not null,
    name text not null,
    password_hash text not null,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists sessions (
    token_hash text primary key,
    user_id integer not null references users(id) on delete cascade,
    expires_at timestamptz not null
  )`,
  `create table if not exists login_attempts (
    id serial primary key,
    email text not null,
    ok boolean not null,
    at timestamptz not null default now()
  )`,
  // Colecciones con varios elementos: platos, shows, escenas…
  `create table if not exists entries (
    id serial primary key,
    collection text not null,
    data jsonb not null,
    position integer not null default 0,
    updated_at timestamptz not null default now()
  )`,
  `create index if not exists entries_collection_idx on entries (collection, position)`,
  // Bloques únicos: datos generales, textos del inicio, menú ejecutivo…
  `create table if not exists settings (
    key text primary key,
    data jsonb not null,
    updated_at timestamptz not null default now()
  )`,
];

let ready: Promise<Driver> | null = null;

async function connect(): Promise<Driver> {
  const url = process.env.DATABASE_URL ?? import.meta.env.DATABASE_URL;
  let driver: Driver;
  if (url) {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(url);
    driver = { query: (text, params = []) => sql.query(text, params) as Promise<Row[]> };
  } else if (import.meta.env.DEV) {
    const { PGlite } = await import('@electric-sql/pglite');
    const { mkdirSync } = await import('node:fs');
    mkdirSync('./.data', { recursive: true });
    const pg = new PGlite('./.data/pglite');
    driver = { query: async (text, params = []) => (await pg.query<Row>(text, params)).rows };
  } else {
    throw new Error('Falta la variable DATABASE_URL. Conecta la base de datos en Vercel.');
  }

  for (const stmt of SCHEMA) await driver.query(stmt);
  const { seedIfEmpty } = await import('./seed');
  await seedIfEmpty(driver);
  return driver;
}

function db() {
  ready ??= connect().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

export async function query<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  const d = await db();
  return (await d.query(text, params)) as T[];
}

export async function one<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T | undefined> {
  return (await query<T>(text, params))[0];
}
