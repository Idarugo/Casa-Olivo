import type { APIRoute } from 'astro';
import { getCollection } from '../../../lib/schema';
import { reorder } from '../../../lib/repo';
import { sameOrigin } from '../../../lib/admin';
import { can } from '../../../lib/permissions';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!sameOrigin(request)) return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const col = getCollection(String(body?.collection ?? ''));
  const ids = Array.isArray(body?.ids) ? body.ids.map(Number).filter(Number.isInteger) : [];
  if (col && !can(locals.user, col.key)) return Response.json({ error: 'Tu rol no puede ordenar esta sección.' }, { status: 403 });
  if (!col || col.sortBy || !ids.length) return Response.json({ error: 'Orden no válido.' }, { status: 400 });
  await reorder(col.key, ids, locals.user);
  return Response.json({ ok: true });
};
