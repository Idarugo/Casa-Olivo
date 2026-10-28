// Lectura y escritura del contenido editable desde el panel. Todo cambio pasa por el historial.
import { query, one } from './db';
import { settingsSeed } from './seed';
import { log } from './audit';
import type { User } from './auth';
import { getCollection, getSingleton } from './schema';

export type Entry = { id: number; collection: string; data: any; position: number; updated_at: string; deleted_at?: string | null; deleted_by?: string | null };
type Actor = Pick<User, 'id' | 'name'> | undefined;

/** Días que lo eliminado se guarda en la papelera. */
export const TRASH_DAYS = 30;

const titleOf = (collection: string, data: any) => {
  const c = getCollection(collection);
  return String((c && data?.[c.title]) || 'Sin título').split('\n')[0];
};

export async function listEntries(collection: string) {
  return query<Entry>(
    'select id, collection, data, position, updated_at from entries where collection = $1 and deleted_at is null order by position, id',
    [collection],
  );
}

export async function getEntry(collection: string, id: number) {
  return one<Entry>('select id, collection, data, position, updated_at from entries where collection = $1 and id = $2 and deleted_at is null', [
    collection,
    id,
  ]);
}

export async function createEntry(collection: string, data: unknown, actor?: Actor) {
  const row = await one<{ id: number }>(
    `insert into entries (collection, data, position)
     values ($1, $2, coalesce((select max(position) + 1 from entries where collection = $1), 0))
     returning id`,
    [collection, JSON.stringify(data)],
  );
  await log(actor, 'create', { collection, entryId: row!.id, title: titleOf(collection, data), after: data });
  return row!.id;
}

export async function updateEntry(collection: string, id: number, data: unknown, actor?: Actor) {
  const prev = await getEntry(collection, id);
  await query('update entries set data = $3, updated_at = now() where collection = $1 and id = $2', [collection, id, JSON.stringify(data)]);
  if (JSON.stringify(prev?.data) !== JSON.stringify(data)) {
    await log(actor, 'update', { collection, entryId: id, title: titleOf(collection, data), before: prev?.data, after: data });
  }
}

/** Envía a la papelera: deja de verse en el sitio y se puede recuperar. */
export async function deleteEntry(collection: string, id: number, actor?: Actor) {
  const prev = await getEntry(collection, id);
  if (!prev) return;
  await query('update entries set deleted_at = now(), deleted_by = $3 where collection = $1 and id = $2', [collection, id, actor?.name ?? null]);
  await log(actor, 'delete', { collection, entryId: id, title: titleOf(collection, prev.data), before: prev.data });
}

export async function duplicateEntry(collection: string, id: number, actor?: Actor) {
  const e = await getEntry(collection, id);
  if (!e) return;
  return createEntry(collection, e.data, actor);
}

/** Saca un elemento de la papelera. */
export async function restoreEntry(id: number, actor?: Actor) {
  const e = await one<Entry>('select id, collection, data from entries where id = $1 and deleted_at is not null', [id]);
  if (!e) return;
  await query('update entries set deleted_at = null, deleted_by = null, updated_at = now() where id = $1', [id]);
  await log(actor, 'restore', { collection: e.collection, entryId: id, title: titleOf(e.collection, e.data), after: e.data });
  return e;
}

/** Vuelve un elemento a una versión anterior guardada en el historial. */
export async function restoreVersion(collection: string, id: number, data: unknown, actor?: Actor) {
  const exists = await one<{ deleted_at: string | null }>('select deleted_at from entries where collection = $1 and id = $2', [collection, id]);
  if (!exists) {
    // Ya no existe: se vuelve a crear
    return createEntry(collection, data, actor);
  }
  const prev = await one<Entry>('select data from entries where id = $1', [id]);
  await query('update entries set data = $3, deleted_at = null, deleted_by = null, updated_at = now() where collection = $1 and id = $2', [
    collection,
    id,
    JSON.stringify(data),
  ]);
  await log(actor, 'restore', { collection, entryId: id, title: titleOf(collection, data), before: prev?.data, after: data });
  return id;
}

export async function purgeEntry(id: number, actor?: Actor) {
  const e = await one<Entry>('select id, collection, data from entries where id = $1 and deleted_at is not null', [id]);
  if (!e) return;
  await query('delete from entries where id = $1', [id]);
  await log(actor, 'purge', { collection: e.collection, entryId: id, title: titleOf(e.collection, e.data), before: e.data });
}

export async function listTrash() {
  // Lo que lleva más de 30 días en la papelera se elimina definitivamente
  await query(`delete from entries where deleted_at is not null and deleted_at < now() - interval '${TRASH_DAYS} days'`);
  return query<Entry>('select id, collection, data, position, updated_at, deleted_at, deleted_by from entries where deleted_at is not null order by deleted_at desc');
}

/** Guarda el nuevo orden: el índice en la lista pasa a ser la posición. */
export async function reorder(collection: string, ids: number[], actor?: Actor) {
  if (!ids.length) return;
  await query(
    `update entries set position = o.pos
     from (select unnest($2::int[]) as id, generate_series(0, $3) as pos) o
     where entries.id = o.id and entries.collection = $1`,
    [collection, ids, ids.length - 1],
  );
  await log(actor, 'reorder', { collection, title: getCollection(collection)?.label });
}

export async function getSetting(key: string) {
  const row = await one<{ data: any; updated_at: string }>('select data, updated_at from settings where key = $1', [key]);
  return { data: { ...(settingsSeed[key] as object), ...(row?.data ?? {}) } as Record<string, any>, updated_at: row?.updated_at };
}

export async function saveSetting(key: string, data: unknown, actor?: Actor) {
  const prev = await getSetting(key);
  await query(
    `insert into settings (key, data) values ($1, $2)
     on conflict (key) do update set data = excluded.data, updated_at = now()`,
    [key, JSON.stringify(data)],
  );
  if (JSON.stringify(prev.data) !== JSON.stringify(data)) {
    await log(actor, 'settings', { collection: key, title: getSingleton(key)?.label ?? key, before: prev.data, after: data });
  }
}

export async function counts() {
  const rows = await query<{ collection: string; n: string }>('select collection, count(*) as n from entries where deleted_at is null group by collection');
  return Object.fromEntries(rows.map((r) => [r.collection, Number(r.n)])) as Record<string, number>;
}

export async function trashCount() {
  const row = await one<{ n: string }>('select count(*) as n from entries where deleted_at is not null');
  return Number(row?.n ?? 0);
}

export async function recent(limit = 6) {
  return query<Entry>('select id, collection, data, position, updated_at from entries where deleted_at is null order by updated_at desc limit $1', [limit]);
}

export async function categoriasMap() {
  const rows = await listEntries('carta_categorias');
  return Object.fromEntries(rows.map((r) => [String(r.id), r.data.titulo as string])) as Record<string, string>;
}
