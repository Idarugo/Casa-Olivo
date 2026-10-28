import type { APIRoute } from 'astro';
import { exportAll } from '../../../lib/backup';
import { can } from '../../../lib/permissions';
import { one } from '../../../lib/db';

// Descarga el contenido actual, o el estado anterior a una restauración (?antes=<id del historial>)
export const GET: APIRoute = async ({ locals, url }) => {
  if (!can(locals.user, 'configuracion')) return Response.json({ error: 'Solo un administrador puede descargar respaldos.' }, { status: 403 });
  const antes = Number(url.searchParams.get('antes') ?? 0);
  let data: unknown;
  let nombre: string;
  if (antes) {
    const row = await one<{ before: unknown; at: string }>(`select before, at from audit where id = $1 and action = 'backup_import'`, [antes]);
    if (!row) return Response.json({ error: 'Ese respaldo ya no existe.' }, { status: 404 });
    data = row.before;
    nombre = `casa-olivo-antes-de-restaurar-${row.at.slice(0, 10)}.json`;
  } else {
    data = await exportAll();
    nombre = `casa-olivo-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  }
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nombre}"`,
      'Cache-Control': 'no-store',
    },
  });
};
