/*
  Contenido inicial. La primera vez que el sitio se conecta a una base vacía,
  carga aquí todo lo que tenía la versión estática, para no partir de cero.
*/
import type { Row } from './db';
import { cocina, bar, happyHour } from './seed/carta';
import { shows, karaoke, bases, artistas } from './seed/eventos';
import { scenes, horario } from './seed/site';
import { faqs } from './seed/faqs';

type Driver = { query(text: string, params?: unknown[]): Promise<Row[]> };

const img = (name: string, sm = true) => ({ src: `/img/${name}.webp`, ...(sm ? { sm: `/img/${name}-sm.webp` } : {}) });

const categoriaImg: Record<string, { imagen: ReturnType<typeof img>; recorte?: boolean }> = {
  entrantes: { imagen: img('ceviche') },
  tablas: { imagen: img('mesa') },
  autor: { imagen: img('salon') },
  tradiciones: { imagen: img('pastel', false), recorte: true },
  aperitivos: { imagen: img('terraza-2') },
};

export const settingsSeed: Record<string, unknown> = {
  sitio: {
    aviso_activo: false,
    aviso_texto: '',
    aviso_link: '',
    aviso_link_texto: '',
    aviso_hasta: '',
    seo_titulo: 'Casa Olivo · Cocina chilena en Olivar',
    seo_descripcion:
      'Restaurante de cocina chilena en una casona de más de cien años en Olivar, a minutos de Rancagua. Menú ejecutivo, celebraciones y reservas.',
    og_imagen: null,
    paginas: [],
    url_sitio: '',
    indexar: true,
  },
  general: {
    whatsapp: '56958785050',
    instagram: 'casaolivorestaurante',
    lugar: 'Espacio Santa Julia',
    direccion: 'Av. Julio Silva 597, Olivar',
    maps: 'https://maps.app.goo.gl/enW6uzUFeeBVgfN79',
    tableo: 'https://app.tableo.com/r/_PG13BP',
    tableo_slug: 'casa-olivo-restaurante-chile',
    horario,
  },
  inicio: {
    tagline: 'Comida honesta,\ntragos con carácter\ny una atención que te abraza.',
    tagline_nota: 'Creemos que la experiencia no está solo en lo que comes, sino en cómo te hacen sentir.',
    valores: ['Tradición', 'Producto de estación', 'Identidad chilena', 'Hecho al momento', 'Recetas de casa'],
    cocina_titulo: 'Sabores que van a deleitar todos tus sentidos',
    cocina_texto:
      'Rescatamos el valor de la cocina chilena, esa que nace en las casas, en los campos y en los encuentros familiares. Un espacio donde tradición y creatividad se encuentran para dar vida a una carta que emociona.',
    cocina_cita: 'Cada comida es una invitación a recordar lo que somos.',
    menu_texto: 'Un almuerzo completo de cocina chilena para tu semana, preparado al momento con productos frescos.',
    celebra_titulo: 'Celebraciones con sabor local',
    celebra_intro: '¿Buscas un espacio auténtico para celebrar? En Casa Olivo te ofrecemos:',
    celebra_items: [
      { titulo: 'Menús especiales', texto: 'Para grupos y ocasiones, pensados junto a ti.' },
      { titulo: 'Cenas temáticas', texto: 'Con productos de estación y lo mejor de nuestra carta.' },
    ],
    equipo_titulo: 'Y lo más importante, nuestro equipo',
    equipo_texto:
      'Personas cercanas, comprometidas, alegres y atentas, que entienden que comer bien también es sentirse bien recibido.',
    visita_titulo: 'Te esperamos con\nlo mejor de lo nuestro',
    visita_texto: 'En un espacio único, lleno de tradición y calidez, en el corazón de la sexta región.',
  },
  menu_ejecutivo: {
    precio: 9900,
    dias: 'Miércoles a viernes',
    horas: '12:30 a 17:00',
    tiempos: ['Entrada', 'Fondo', 'Postre', 'Infusión o café'],
    nota: 'Consulta por las opciones disponibles cada día.',
  },
  happy_hour_info: {
    dias: happyHour.dias,
    horas: happyHour.horas,
    nota: happyHour.nota,
    pie: 'Precio por dos tragos.',
  },
  karaoke: {
    activo: true,
    edicion: karaoke.edicion,
    nombre: karaoke.nombre,
    lema: karaoke.lema,
    form: karaoke.form,
    datos: karaoke.datos,
  },
};

export async function seedIfEmpty(db: Driver) {
  const [{ n }] = await db.query('select (select count(*) from entries) + (select count(*) from settings) as n');
  if (Number(n) > 0) return;

  for (const [key, data] of Object.entries(settingsSeed)) {
    await db.query('insert into settings (key, data) values ($1, $2) on conflict (key) do nothing', [key, JSON.stringify(data)]);
  }

  const insert = async (collection: string, data: unknown, position: number) => {
    const [row] = await db.query('insert into entries (collection, data, position) values ($1, $2, $3) returning id', [
      collection,
      JSON.stringify(data),
      position,
    ]);
    return String(row.id);
  };

  // Carta: categorías y platos
  let catPos = 0;
  let platoPos = 0;
  for (const seccion of [cocina, bar]) {
    for (const c of seccion.categorias) {
      const extra = categoriaImg[c.id] ?? {};
      const catId = await insert(
        'carta_categorias',
        {
          titulo: c.titulo,
          seccion: seccion.id,
          bajada: c.bajada ?? '',
          layout: c.layout ?? 'lista',
          columnas: c.columnas ?? [],
          imagen: extra.imagen ?? null,
          recorte: extra.recorte ?? false,
        },
        catPos++,
      );
      for (const g of c.grupos ?? []) {
        let first = true;
        for (const p of g.platos) {
          const montos = Array.isArray(p.precio) ? p.precio : [p.precio];
          const notas = Array.isArray(p.nota) ? p.nota : p.nota ? [p.nota] : [];
          const porPorcion = montos.length > 1 && notas.length === montos.length;
          const precios = montos
            .map((monto, k) => ({ etiqueta: porPorcion ? notas[k] : (c.columnas?.[k] ?? ''), monto }))
            .filter((x) => x.monto > 0);
          await insert(
            'carta_platos',
            {
              nombre: p.nombre,
              categoria: catId,
              grupo: g.titulo ?? '',
              grupo_bajada: first ? (g.bajada ?? '') : '',
              precios,
              desc: p.desc ?? '',
              nota: porPorcion ? '' : (notas[0] ?? ''),
              vegano: p.tags?.includes('vegano') ?? false,
              sin_gluten: p.tags?.includes('sin gluten') ?? false,
              compartir: p.tags?.includes('para compartir') ?? false,
              oculto: false,
            },
            platoPos++,
          );
          first = false;
        }
      }
    }
  }

  await Promise.all(happyHour.tragos.map((t, i) => insert('happy_hour', t, i)));

  await Promise.all(
    shows.map((s, i) =>
      insert(
        'shows',
        {
          artista: s.artista,
          subtitulo: s.subtitulo ?? '',
          fecha: s.fecha,
          poster: { src: s.poster },
          entradas: s.entradas,
          desde: s.desde ?? null,
        },
        i,
      ),
    ),
  );

  await Promise.all(artistas.map((a, i) => insert('artistas', { nombre: a.nombre, que: '', cuando: '', foto: null, link: a.link }, i)));

  await Promise.all(karaoke.jornadas.map((j, i) => insert('karaoke_jornadas', j, i)));
  await Promise.all(karaoke.premios.map((p, i) => insert('karaoke_premios', p, i)));
  await Promise.all(bases.map((b, i) => insert('karaoke_bases', { t: b.t, p: b.p ?? [], li: b.li ?? [] }, i)));

  await Promise.all(
    scenes.map((s, i) =>
      insert(
        'escenas',
        {
          img: img(s.img),
          focal: { x: s.focal[0], y: s.focal[1] },
          alt: s.alt,
          label: s.label,
          eyebrow: s.eyebrow,
          title: i === 0 ? 'Cocina chilena\nen una casona\ncon más de cien años' : s.title,
          body: s.body,
        },
        i,
      ),
    ),
  );

  await Promise.all(faqs.map((f, i) => insert('faqs', f, i)));
}

/** Bases ya creadas antes de existir "Artistas invitados": se cargan una sola vez */
export async function seedArtistas(db: Driver) {
  const nueva = await db.query(`insert into cargas (key) values ('artistas') on conflict (key) do nothing returning key`);
  if (!nueva.length) return;
  const [{ n }] = await db.query(`select count(*) as n from entries where collection = 'artistas'`);
  if (Number(n) > 0) return;
  for (const [i, a] of artistas.entries())
    await db.query('insert into entries (collection, data, position) values ($1, $2, $3)', [
      'artistas',
      JSON.stringify({ nombre: a.nombre, que: '', cuando: '', foto: null, link: a.link }),
      i,
    ]);
}
