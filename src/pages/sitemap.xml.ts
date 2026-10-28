import type { APIRoute } from 'astro';
import { query } from '../lib/db';

// Mapa del sitio para buscadores. La fecha es la del último cambio de contenido.
export const GET: APIRoute = async ({ locals, url }) => {
  const { sitio, karaoke } = locals.content!;
  const origin = sitio.url_sitio ? new URL(sitio.url_sitio).origin : url.origin;
  const [row] = await query<{ at: string }>(
    'select greatest((select max(updated_at) from entries), (select max(updated_at) from settings)) as at',
  );
  const lastmod = new Date(row?.at ?? Date.now()).toISOString().slice(0, 10);
  const paginas = [
    { ruta: '/', prioridad: '1.0' },
    { ruta: '/carta', prioridad: '0.9' },
    { ruta: '/reserva', prioridad: '0.9' },
    { ruta: '/eventos', prioridad: '0.7' },
    ...(karaoke.activo ? [{ ruta: '/karaoke', prioridad: '0.5' }] : []),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paginas.map((p) => `  <url><loc>${origin}${p.ruta}</loc><lastmod>${lastmod}</lastmod><priority>${p.prioridad}</priority></url>`).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
