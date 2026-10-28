import { defineMiddleware } from 'astro:middleware';
import { currentUser } from './lib/auth';
import { areaForPath, can } from './lib/permissions';
import { loadContent } from './lib/content';
import { sameOrigin } from './lib/admin';

const PUBLIC_ADMIN = ['/admin/login', '/admin/setup'];

// Cabeceras de seguridad para toda respuesta del servidor
function harden(res: Response, admin: boolean) {
  const h = res.headers;
  if (import.meta.env.PROD) h.set('Strict-Transport-Security', 'max-age=31536000');
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()');
  h.set('Cross-Origin-Opener-Policy', 'same-origin');
  h.set('X-Frame-Options', admin ? 'DENY' : 'SAMEORIGIN');
  // frame-ancestors no se puede declarar en la etiqueta meta de Astro: va como cabecera
  h.append('Content-Security-Policy', `frame-ancestors ${admin ? "'none'" : "'self'"}; object-src 'none'; base-uri 'self'`);
  return res;
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const path = ctx.url.pathname.replace(/\/$/, '') || '/';

  // Panel: todo exige sesión, salvo el ingreso y la creación del primer usuario
  if (path === '/admin' || path.startsWith('/admin/')) {
    if (ctx.isPrerendered) return next();
    // Todo lo que cambia datos debe venir del propio panel, nunca de otro sitio
    if (!['GET', 'HEAD'].includes(ctx.request.method) && !sameOrigin(ctx.request)) {
      return harden(Response.json({ error: 'Origen no permitido.' }, { status: 403 }), true);
    }
    ctx.locals.user = await currentUser(ctx.cookies);
    if (!ctx.locals.user && !PUBLIC_ADMIN.includes(path)) {
      if (path.startsWith('/admin/api/')) return Response.json({ error: 'Tu sesión expiró. Vuelve a ingresar.' }, { status: 401 });
      return ctx.redirect(`/admin/login?next=${encodeURIComponent(ctx.url.pathname + ctx.url.search)}`);
    }
    // Permisos por rol: cada ruta pertenece a un área
    const area = areaForPath(path);
    if (ctx.locals.user && area && !can(ctx.locals.user, area)) {
      return ctx.rewrite('/admin/sin-permiso');
    }
    const res = await next();
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return harden(res, true);
  }

  // Sitio público: el contenido sale de la base de datos en cada visita
  if (!ctx.isPrerendered && !path.startsWith('/api/')) {
    ctx.locals.content = await loadContent();
    const res = await next();
    if (ctx.request.method === 'GET' && res.status === 200 && !res.headers.has('Cache-Control')) {
      // Sin caché intermedia: cada visita ve lo último que se guardó en el panel
      res.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    return harden(res, false);
  }
  return harden(await next(), false);
});
