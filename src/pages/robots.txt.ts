import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ locals, url }) => {
  const sitio = locals.content!.sitio;
  const origin = sitio.url_sitio ? new URL(sitio.url_sitio).origin : url.origin;
  const body = sitio.indexar
    ? `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${origin}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
