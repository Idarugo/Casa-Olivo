import type { APIRoute } from 'astro';
import { collections, singletons } from '../../../lib/schema';
import { query } from '../../../lib/db';
import { categoriasMap } from '../../../lib/repo';
import { can } from '../../../lib/permissions';

const adminPages = [
  { t: 'Historial', s: 'Administración', href: '/admin/historial', icon: 'clock-counter-clockwise', area: 'historial' },
  { t: 'Papelera', s: 'Administración', href: '/admin/papelera', icon: 'trash', area: 'historial' },
  { t: 'Estado de servicios', s: 'Administración', href: '/admin/estado', icon: 'pulse', area: 'estado' },
  { t: 'Configuración', s: 'Administración', href: '/admin/configuracion', icon: 'gear-six', area: 'configuracion' },
  { t: 'Usuarios', s: 'Administración', href: '/admin/usuarios', icon: 'users-three', area: 'usuarios' },
];

// Índice para la paleta ⌘K: lo que el rol de cada persona puede abrir
export const GET: APIRoute = async ({ locals }) => {
  const ok = (area: string) => can(locals.user, area);
  const [rows, categorias] = await Promise.all([query<{ id: number; collection: string; data: any }>('select id, collection, data from entries where deleted_at is null'), categoriasMap()]);

  const items = [
    { t: 'Resumen', s: 'Panel', href: '/admin', icon: 'squares-four' },
    ...collections.filter((c) => ok(c.key)).map((c) => ({ t: c.label, s: c.group, href: `/admin/${c.key}`, icon: c.icon })),
    ...collections.filter((c) => ok(c.key)).map((c) => ({ t: `Agregar ${c.singular}`, s: c.label, href: `/admin/${c.key}/nuevo`, icon: 'plus' })),
    ...singletons.filter((s) => ok(s.key)).map((s) => ({ t: s.label, s: s.group, href: `/admin/ajustes/${s.key}`, icon: s.icon })),
    ...adminPages.filter((p) => ok(p.area)).map(({ area, ...p }) => p),
    ...rows.map((r) => {
      const c = collections.find((x) => x.key === r.collection);
      if (!c || !ok(c.key)) return null;
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
