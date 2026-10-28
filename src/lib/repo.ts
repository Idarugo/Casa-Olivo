// Lectura y escritura del contenido editable desde el panel.
import { query, one } from './db';
import { settingsSeed } from './seed';

export type Entry = { id: number; collection: string; data: any; position: number; updated_at: string };

export async function listEntries(collection: string) {
  return query<Entry>('select id, collection, data, position, updated_at from entries where collection = $1 order by position, id', [collection]);
}

export async function getEntry(collection: string, id: number) {
  return one<Entry>('select id, collection, data, position, updated_at from entries where collection = $1 and id = $2', [collection, id]);
}

export async function createEntry(collection: string, data: unknown) {
  const row = await one<{ id: number }>(
    `insert into entries (collection, data, position)
     values ($1, $2, coalesce((select max(position) + 1 from entries where collection = $1), 0))
     returning id`,
    [collection, JSON.stringify(data)],
  );
  return row!.id;
}

export async function updateEntry(collection: string, id: number, data: unknown) {
  await query('update entries set data = $3, updated_at = now() where collection = $1 and id = $2', [collection, id, JSON.stringify(data)]);
}

export async function deleteEntry(collection: string, id: number) {
  await query('delete from entries where collection = $1 and id = $2', [collection, id]);
}

export async function duplicateEntry(collection: string, id: number) {
  const e = await getEntry(collection, id);
  if (!e) return;
  return createEntry(collection, e.data);
}

/** Guarda el nuevo orden: el índice en la lista pasa a ser la posición. */
export async function reorder(collection: string, ids: number[]) {
  if (!ids.length) return;
  await query(
    `update entries set position = o.pos
     from (select unnest($2::int[]) as id, generate_series(0, $3) as pos) o
     where entries.id = o.id and entries.collection = $1`,
    [collection, ids, ids.length - 1],
  );
}

export async function getSetting(key: string) {
  const row = await one<{ data: any; updated_at: string }>('select data, updated_at from settings where key = $1', [key]);
  return { data: { ...(settingsSeed[key] as object), ...(row?.data ?? {}) } as Record<string, any>, updated_at: row?.updated_at };
}

export async function saveSetting(key: string, data: unknown) {
  await query(
    `insert into settings (key, data) values ($1, $2)
     on conflict (key) do update set data = excluded.data, updated_at = now()`,
    [key, JSON.stringify(data)],
  );
}

export async function counts() {
  const rows = await query<{ collection: string; n: string }>('select collection, count(*) as n from entries group by collection');
  return Object.fromEntries(rows.map((r) => [r.collection, Number(r.n)])) as Record<string, number>;
}

export async function recent(limit = 6) {
  return query<Entry>('select id, collection, data, position, updated_at from entries order by updated_at desc limit $1', [limit]);
}

export async function categoriasMap() {
  const rows = await listEntries('carta_categorias');
  return Object.fromEntries(rows.map((r) => [String(r.id), r.data.titulo as string])) as Record<string, string>;
}
