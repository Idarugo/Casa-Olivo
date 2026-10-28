/*
  Roles del panel. Cada sección del panel es un "área"; cada rol tiene
  una lista de áreas permitidas. El control se hace en el servidor (middleware
  y endpoints); la barra lateral solo refleja lo mismo.
*/

export type Role = 'admin' | 'editor' | 'carta';

export const AREAS_CARTA = ['carta_platos', 'happy_hour', 'menu_ejecutivo', 'happy_hour_info'];

const CONTENIDO = [
  'carta_platos',
  'carta_categorias',
  'happy_hour',
  'menu_ejecutivo',
  'happy_hour_info',
  'shows',
  'karaoke',
  'karaoke_jornadas',
  'karaoke_premios',
  'karaoke_bases',
  'escenas',
  'inicio',
  'general',
  'faqs',
];

export const roles: Record<Role, { label: string; description: string; areas: string[] }> = {
  admin: {
    label: 'Administrador',
    description: 'Todo el panel: contenido, usuarios, configuración, historial y estado.',
    areas: ['*'],
  },
  editor: {
    label: 'Editor',
    description: 'Todo el contenido del sitio, su historial y el estado de servicios. Sin usuarios ni configuración.',
    areas: [...CONTENIDO, 'historial', 'estado'],
  },
  carta: {
    label: 'Carta',
    description: 'Solo platos, precios, happy hour y menú ejecutivo.',
    areas: [...AREAS_CARTA, 'historial'],
  },
};

export const roleKeys = Object.keys(roles) as Role[];

export function isRole(r: unknown): r is Role {
  return typeof r === 'string' && r in roles;
}

export function can(user: { role?: string } | undefined, area: string) {
  if (!user || !isRole(user.role)) return false;
  const a = roles[user.role].areas;
  return a.includes('*') || a.includes(area);
}

/** Área a la que pertenece una ruta del panel, o null si basta con tener sesión. */
export function areaForPath(path: string): string | null {
  const parts = path.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  if (parts.length === 0) return null; // resumen
  const [first, second] = parts;
  if (first === 'api') return null; // cada endpoint valida lo suyo
  if (first === 'ajustes') return second ?? null;
  if (first === 'papelera') return 'historial';
  if (['usuarios', 'historial', 'estado', 'configuracion'].includes(first)) return first;
  if (['login', 'logout', 'setup', 'sin-permiso'].includes(first)) return null;
  return first; // colección
}
