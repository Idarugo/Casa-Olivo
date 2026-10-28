// Utilidades del panel.

/** Página del sitio donde se ve cada colección o bloque. */
export function publicHref(key: string) {
  const map: Record<string, string> = {
    carta_platos: '/carta',
    carta_categorias: '/carta',
    happy_hour: '/carta#bar',
    menu_ejecutivo: '/#menu',
    happy_hour_info: '/carta#bar',
    shows: '/eventos',
    karaoke: '/karaoke',
    karaoke_jornadas: '/karaoke',
    karaoke_premios: '/karaoke',
    karaoke_bases: '/karaoke#bases',
    escenas: '/',
    inicio: '/',
    general: '/#visita',
    faqs: '/reserva',
  };
  return map[key];
}

/** Rechaza peticiones que no vienen del propio sitio. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  return new URL(origin).host === new URL(request.url).host;
}
