import type { APIRoute } from 'astro';

// Solo en desarrollo: sirve las fotos subidas desde el panel, guardadas en .data/uploads.
// En producción las fotos viven en Vercel Blob y esta ruta no existe.
export const GET: APIRoute = async ({ params }) => {
  if (!import.meta.env.DEV) return new Response(null, { status: 404 });
  const name = String(params.path ?? '');
  if (!/^[a-z0-9-]+\.webp$/i.test(name)) return new Response(null, { status: 404 });
  const { readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  try {
    const data = await readFile(join(process.cwd(), '.data', 'uploads', name));
    return new Response(data, { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch {
    return new Response(null, { status: 404 });
  }
};
