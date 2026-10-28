import type { APIRoute } from 'astro';
import { getCollection } from '../../../lib/schema';
import { reorder } from '../../../lib/repo';
import { sameOrigin } from '../../../lib/admin';

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const col = getCollection(String(body?.collection ?? ''));
  const ids = Array.isArray(body?.ids) ? body.ids.map(Number).filter(Number.isInteger) : [];
  if (!col || col.sortBy || !ids.length) return Response.json({ error: 'Orden no válido.' }, { status: 400 });
  await reorder(col.key, ids);
  return Response.json({ ok: true });
};
