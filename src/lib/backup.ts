// Respaldo: todo el contenido del sitio en un solo archivo JSON. No incluye usuarios ni contraseñas.
import { query } from './db';
import { log } from './audit';
import type { User } from './auth';
import { collections, singletons } from './schema';

export type Backup = {
  formato: 'casa-olivo-respaldo';
  version: 1;
  exportado: string;
  entries: { id: number; collection: string; data: unknown; position: number }[];
  settings: Record<string, unknown>;
};

export async function exportAll(): Promise<Backup> {
  const [entries, settings] = await Promise.all([
    query<{ id: number; collection: string; data: unknown; position: number }>(
      'select id, collection, data, position from entries where deleted_at is null order by collection, position, id',
    ),
    query<{ key: string; data: unknown }>('select key, data from settings'),
  ]);
  return {
    formato: 'casa-olivo-respaldo',
    version: 1,
    exportado: new Date().toISOString(),
    entries,
    settings: Object.fromEntries(settings.map((s) => [s.key, s.data])),
  };
}

/** Revisa que el archivo sea un respaldo válido. Devuelve un mensaje de error o null. */
export function checkBackup(b: any): string | null {
  if (!b || b.formato !== 'casa-olivo-respaldo' || b.version !== 1) return 'El archivo no es un respaldo de Casa Olivo.';
  if (!Array.isArray(b.entries) || typeof b.settings !== 'object') return 'El respaldo está incompleto.';
  const conocidas = new Set(collections.map((c) => c.key));
  const bloques = new Set(singletons.map((s) => s.key));
  if (b.entries.some((e: any) => !conocidas.has(e?.collection) || typeof e?.data !== 'object' || !Number.isInteger(e?.id))) return 'El respaldo tiene secciones que este sitio no reconoce.';
  if (new Set(b.entries.map((e: any) => e.id)).size !== b.entries.length) return 'El respaldo tiene elementos repetidos.';
  if (Object.keys(b.settings).some((k) => !bloques.has(k))) return 'El respaldo tiene ajustes que este sitio no reconoce.';
  if (!b.entries.length) return 'El respaldo no tiene contenido.';
  return null;
}

/** Reemplaza todo el contenido por el del respaldo. Antes guarda el estado actual en el historial. */
export async function importAll(b: Backup, actor?: Pick<User, 'id' | 'name'>) {
  const anterior = await exportAll();
  await log(actor, 'backup_import', {
    title: `Respaldo del ${new Date(b.exportado).toLocaleDateString('es-CL')}`,
    before: anterior,
    after: { entradas: b.entries.length, ajustes: Object.keys(b.settings).length },
  });
  await query('delete from entries');
  await query('delete from settings');
  // Se conservan los identificadores: los platos apuntan a su categoría por id
  for (const e of b.entries) {
    await query('insert into entries (id, collection, data, position) values ($1, $2, $3, $4)', [e.id, e.collection, JSON.stringify(e.data), Number(e.position) || 0]);
  }
  await query(`select setval(pg_get_serial_sequence('entries', 'id'), (select coalesce(max(id), 1) from entries))`);
  for (const [key, data] of Object.entries(b.settings)) {
    await query('insert into settings (key, data) values ($1, $2)', [key, JSON.stringify(data)]);
  }
}
