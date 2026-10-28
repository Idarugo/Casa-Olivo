import type { APIRoute } from 'astro';
import { saveImage, UploadError } from '../../../lib/storage';
import { sameOrigin } from '../../../lib/admin';

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File) || file.size === 0) return Response.json({ error: 'No llegó ninguna foto.' }, { status: 400 });
  try {
    return Response.json(await saveImage(file));
  } catch (e) {
    if (e instanceof UploadError) return Response.json({ error: e.message }, { status: 400 });
    console.error(e);
    return Response.json({ error: 'No pudimos guardar la foto. Inténtalo otra vez.' }, { status: 500 });
  }
};
