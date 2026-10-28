/*
  Lee todo el contenido publicado en una sola pasada y lo entrega con la forma
  que usan las páginas. Se carga una vez por visita (ver middleware).
*/
import { query } from './db';
import type { Image } from './schema';
import { settingsSeed } from './seed';

export type Precio = { etiqueta?: string; monto: number };
export type Plato = {
  nombre: string;
  precios: Precio[];
  desc?: string;
  nota?: string;
  tags: string[];
};
export type Categoria = {
  id: string;
  titulo: string;
  bajada?: string;
  layout: 'lista' | 'compacta' | 'dos-columnas';
  columnas: string[];
  imagen?: Image | null;
  recorte?: boolean;
  grupos: { titulo?: string; bajada?: string; platos: Plato[] }[];
};
export type Scene = {
  id: string;
  /** Ancla del capítulo, a partir de su nombre */
  anchor: string;
  img: Image;
  alt: string;
  focal: [number, number];
  label: string;
  eyebrow: string;
  title: string;
  body: string;
};
export type Show = {
  id: string;
  artista: string;
  subtitulo?: string;
  fecha: string;
  poster: string;
  entradas: string;
  desde?: number | null;
};
export type Jornada = { tipo: string; fecha: string };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Cada cambio del panel queda en el historial: su último número sirve de versión del contenido */
export async function contentVersion() {
  const [row] = await query<{ v: number }>('select coalesce(max(id), 0)::int as v from audit');
  return Number(row?.v ?? 0);
}

export async function loadContent() {
  const [rows, settingRows, version] = await Promise.all([
    query<{ id: number; collection: string; data: any }>('select id, collection, data from entries where deleted_at is null order by collection, position, id'),
    query<{ key: string; data: any }>('select key, data from settings'),
    contentVersion(),
  ]);

  const by = (c: string) => rows.filter((r) => r.collection === c).map((r) => ({ id: String(r.id), ...r.data }));
  const s = Object.fromEntries(settingRows.map((r) => [r.key, r.data])) as Record<string, any>;
  const setting = (k: string) => ({ ...(settingsSeed[k] as object), ...(s[k] ?? {}) }) as any;

  const general = setting('general');
  const inicio = setting('inicio');
  const menuEjecutivo = setting('menu_ejecutivo');
  const hh = setting('happy_hour_info');
  const kara = setting('karaoke');
  const sitio = setting('sitio');

  const links = {
    reserva: '/reserva',
    carta: '/carta',
    tableo: general.tableo as string,
    maps: general.maps as string,
    whatsapp: `https://wa.me/${String(general.whatsapp).replace(/\D/g, '')}`,
    instagram: `https://www.instagram.com/${String(general.instagram).replace(/^@/, '')}`,
  };

  // Carta
  const platos = by('carta_platos').filter((p) => !p.oculto);
  const usados = new Set<string>();
  const categorias: (Categoria & { seccion: string })[] = by('carta_categorias').map((c) => {
    let id = slugify(c.titulo) || `categoria-${c.id}`;
    if (id === 'bar' || id === 'cocina' || usados.has(id)) id = `${id}-${c.id}`;
    usados.add(id);
    const propios = platos.filter((p) => p.categoria === c.id);
    const grupos: Categoria['grupos'] = [];
    for (const p of propios) {
      const titulo = p.grupo?.trim() || undefined;
      let g = grupos.find((x) => x.titulo === titulo);
      if (!g) grupos.push((g = { titulo, bajada: p.grupo_bajada || undefined, platos: [] }));
      else if (!g.bajada && p.grupo_bajada) g.bajada = p.grupo_bajada;
      g.platos.push({
        nombre: p.nombre,
        precios: (p.precios ?? []).filter((x: Precio) => Number(x.monto) > 0).map((x: Precio) => ({ etiqueta: x.etiqueta || undefined, monto: Number(x.monto) })),
        desc: p.desc || undefined,
        nota: p.nota || undefined,
        tags: [p.vegano && 'vegano', p.sin_gluten && 'sin gluten', p.compartir && 'para compartir'].filter(Boolean) as string[],
      });
    }
    return {
      id,
      seccion: c.seccion,
      titulo: c.titulo,
      bajada: c.bajada || undefined,
      layout: c.layout || 'lista',
      columnas: (c.columnas ?? []).filter(Boolean),
      imagen: c.imagen?.src ? c.imagen : null,
      recorte: !!c.recorte,
      grupos,
    };
  });

  const scenes: Scene[] = by('escenas').map((e) => ({
    id: e.id,
    anchor: slugify(e.label ?? '') || `escena-${e.id}`,
    img: e.img,
    alt: e.alt ?? '',
    focal: [Number(e.focal?.x ?? 50), Number(e.focal?.y ?? 50)],
    label: e.label ?? '',
    eyebrow: e.eyebrow ?? '',
    title: e.title ?? '',
    body: e.body ?? '',
  }));

  const shows: Show[] = by('shows')
    .filter((x) => x.fecha)
    .map((x) => ({
      id: x.id,
      artista: x.artista,
      subtitulo: x.subtitulo || undefined,
      fecha: x.fecha,
      poster: x.poster?.src ?? '',
      entradas: x.entradas,
      desde: x.desde ? Number(x.desde) : null,
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const jornadas: Jornada[] = by('karaoke_jornadas')
    .filter((j) => j.fecha)
    .map((j) => ({ tipo: j.tipo, fecha: j.fecha }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  return {
    version,
    sitio,
    general,
    inicio,
    links,
    horario: (general.horario ?? []) as { dias: string; horas: string }[],
    scenes,
    cocina: categorias.filter((c) => c.seccion !== 'bar'),
    bar: categorias.filter((c) => c.seccion === 'bar'),
    menuEjecutivo,
    happyHour: { ...hh, tragos: by('happy_hour').map((t) => ({ nombre: t.nombre, precio: Number(t.precio) })) },
    shows,
    karaoke: {
      ...kara,
      activo: kara.activo !== false,
      datos: (kara.datos ?? []) as { t: string; d: string }[],
      jornadas,
      premios: by('karaoke_premios').map((p) => ({ lugar: p.lugar, monto: Number(p.monto) })),
    },
    artistas: by('artistas').map((a) => ({
      nombre: a.nombre as string,
      que: (a.que || undefined) as string | undefined,
      cuando: (a.cuando || undefined) as string | undefined,
      foto: (a.foto?.sm || a.foto?.src || undefined) as string | undefined,
      link: (a.link || undefined) as string | undefined,
    })),
    bases: by('karaoke_bases').map((b) => ({ t: b.t, p: (b.p ?? []).filter(Boolean), li: (b.li ?? []).filter(Boolean) })),
    faqs: by('faqs') as { q: string; a: string }[],
  };
}

export type Content = Awaited<ReturnType<typeof loadContent>>;
