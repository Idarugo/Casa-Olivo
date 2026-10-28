import type { APIRoute } from 'astro';
import { collections, singletons } from '../../../lib/schema';
import { query } from '../../../lib/db';
import { categoriasMap } from '../../../lib/repo';

// Índice para la paleta ⌘K: secciones del panel y todo lo editable
export const GET: APIRoute = async () => {
  const [rows, categorias] = await Promise.all([query<{ id: number; collection: string; data: any }>('select id, collection, data from entries'), categoriasMap()]);

  const items = [
    { t: 'Resumen', s: 'Panel', href: '/admin', icon: 'squares-four' },
    ...collections.map((c) => ({ t: c.label, s: c.group, href: `/admin/${c.key}`, icon: c.icon })),
    ...collections.map((c) => ({ t: `Agregar ${c.singular}`, s: c.label, href: `/admin/${c.key}/nuevo`, icon: 'plus' })),
    ...singletons.map((s) => ({ t: s.label, s: s.group, href: `/admin/ajustes/${s.key}`, icon: s.icon })),
    { t: 'Usuarios', s: 'Cuenta', href: '/admin/usuarios', icon: 'users-three' },
    ...rows.map((r) => {
      const c = collections.find((x) => x.key === r.collection);
      if (!c) return null;
      return {
        t: String(r.data[c.title] ?? '').split('\n')[0] || 'Sin título',
        s: [c.label, c.meta?.(r.data, { categorias })].filter(Boolean).join(' · '),
        href: `/admin/${c.key}/${r.id}`,
        icon: c.icon,
      };
    }),
  ].filter(Boolean);

  return Response.json(items, { headers: { 'Cache-Control': 'no-store' } });
};
