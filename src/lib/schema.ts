/*
  Qué se puede editar desde el panel. Cada colección o bloque declara sus campos;
  el panel arma los formularios, valida y guarda a partir de esta definición.
*/

export type Field =
  | { name: string; label: string; type: 'text' | 'textarea' | 'url' | 'email'; required?: boolean; help?: string; placeholder?: string; wide?: boolean }
  | { name: string; label: string; type: 'money' | 'number'; required?: boolean; help?: string; min?: number; max?: number }
  | { name: string; label: string; type: 'datetime'; required?: boolean; help?: string }
  | { name: string; label: string; type: 'boolean'; help?: string }
  | { name: string; label: string; type: 'select'; options: { value: string; label: string }[] | 'categorias'; required?: boolean; help?: string }
  | { name: string; label: string; type: 'image'; required?: boolean; help?: string; aspect?: string }
  | { name: string; label: string; type: 'focal'; image: string; help?: string }
  | { name: string; label: string; type: 'strings'; help?: string; item?: string; multiline?: boolean }
  | { name: string; label: string; type: 'list'; fields: Field[]; help?: string; item?: string };

export type Image = { src: string; sm?: string };

export type Collection = {
  key: string;
  label: string;
  singular: string;
  group: string;
  icon: string;
  description: string;
  /** Campo que se muestra como título en la lista */
  title: string;
  /** Campos breves para la segunda línea de la lista */
  meta?: (d: any, ctx: { categorias: Record<string, string> }) => string;
  thumb?: string;
  /** Campo para filtrar la lista (ej. por categoría) */
  filter?: { field: string; label: string };
  fields: Field[];
  /** Orden fijo en vez de manual (ej. shows por fecha) */
  sortBy?: string;
};

export type Singleton = {
  key: string;
  label: string;
  group: string;
  icon: string;
  description: string;
  fields: Field[];
};


export const collections: Collection[] = [
  {
    key: 'carta_platos',
    label: 'Platos y tragos',
    singular: 'plato',
    group: 'Carta',
    icon: 'fork-knife',
    description: 'Todo lo que aparece en la carta: nombre, precio, descripción y en qué categoría va.',
    title: 'nombre',
    meta: (d, c) =>
      [c.categorias[d.categoria] ?? 'Sin categoría', d.grupo, (d.precios ?? []).map((p: any) => '$' + Number(p.monto || 0).toLocaleString('es-CL')).join(' · ')]
        .filter(Boolean)
        .join(' · '),
    filter: { field: 'categoria', label: 'Categoría' },
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'categoria', label: 'Categoría', type: 'select', options: 'categorias', required: true },
      { name: 'grupo', label: 'Subgrupo', type: 'text', help: 'Opcional. Agrupa dentro de la categoría, por ejemplo "Pisco" o "Carmenere".' },
      { name: 'grupo_bajada', label: 'Bajada del subgrupo', type: 'text', help: 'Opcional. Basta escribirla en el primer plato del subgrupo.' },
      {
        name: 'precios',
        label: 'Precios',
        type: 'list',
        item: 'precio',
        help: 'Uno o más. Usa la etiqueta para porciones ("3 uds.") o para botella y copa en los vinos.',
        fields: [
          { name: 'etiqueta', label: 'Etiqueta', type: 'text', placeholder: 'Opcional' },
          { name: 'monto', label: 'Monto', type: 'money', required: true },
        ],
      },
      { name: 'desc', label: 'Descripción', type: 'textarea', wide: true },
      { name: 'nota', label: 'Nota corta', type: 'text', help: 'Se muestra como etiqueta junto al nombre: "6 uds.", "2 personas", "500 ml".' },
      { name: 'vegano', label: 'Vegano', type: 'boolean' },
      { name: 'sin_gluten', label: 'Sin gluten', type: 'boolean' },
      { name: 'compartir', label: 'Para compartir', type: 'boolean' },
      { name: 'oculto', label: 'Ocultar de la carta', type: 'boolean', help: 'Útil cuando un plato se agota por temporada.' },
    ],
  },
  {
    key: 'carta_categorias',
    label: 'Categorías',
    singular: 'categoría',
    group: 'Carta',
    icon: 'list-bullets',
    description: 'Secciones de la carta, su orden y cómo se muestran.',
    title: 'titulo',
    meta: (d) => [d.seccion === 'bar' ? 'Oli bar' : 'Cocina', d.bajada].filter(Boolean).join(' · '),
    thumb: 'imagen',
    fields: [
      { name: 'titulo', label: 'Título', type: 'text', required: true },
      {
        name: 'seccion',
        label: 'Sección',
        type: 'select',
        required: true,
        options: [
          { value: 'cocina', label: 'Cocina' },
          { value: 'bar', label: 'Oli bar' },
        ],
      },
      { name: 'bajada', label: 'Bajada', type: 'text' },
      {
        name: 'layout',
        label: 'Formato',
        type: 'select',
        options: [
          { value: 'lista', label: 'Lista con descripciones' },
          { value: 'compacta', label: 'Compacta, solo nombre y precio' },
          { value: 'dos-columnas', label: 'Dos columnas' },
        ],
      },
      { name: 'columnas', label: 'Columnas de precio', type: 'strings', item: 'columna', help: 'Opcional. Por ejemplo "Botella" y "Copa".' },
      { name: 'imagen', label: 'Foto de la categoría', type: 'image', help: 'Opcional. Se muestra junto al título en pantallas grandes.' },
      { name: 'recorte', label: 'La foto no tiene fondo', type: 'boolean', help: 'Actívalo para fotos recortadas, como el pastel de choclo.' },
    ],
  },
  {
    key: 'happy_hour',
    label: 'Happy hour',
    singular: 'trago',
    group: 'Carta',
    icon: 'champagne',
    description: 'Tragos del 2x y su precio por dos.',
    title: 'nombre',
    meta: (d) => '$' + Number(d.precio || 0).toLocaleString('es-CL'),
    fields: [
      { name: 'nombre', label: 'Trago', type: 'text', required: true },
      { name: 'precio', label: 'Precio por dos', type: 'money', required: true },
    ],
  },
  {
    key: 'shows',
    label: 'Shows',
    singular: 'show',
    group: 'Eventos',
    icon: 'ticket',
    description: 'Shows en vivo. Se ocultan solos cuando pasa la fecha.',
    title: 'artista',
    sortBy: 'fecha',
    thumb: 'poster',
    meta: (d) => (d.fecha ? fechaCortaSafe(d.fecha) : 'Sin fecha') + (d.desde ? ' · desde $' + Number(d.desde).toLocaleString('es-CL') : ''),
    fields: [
      { name: 'artista', label: 'Artista', type: 'text', required: true },
      { name: 'subtitulo', label: 'Subtítulo', type: 'text', placeholder: 'Concierto íntimo' },
      { name: 'fecha', label: 'Fecha y hora', type: 'datetime', required: true },
      { name: 'poster', label: 'Afiche', type: 'image', required: true, aspect: '1 / 1', help: 'Cuadrado, idealmente 1080 × 1080.' },
      { name: 'entradas', label: 'Link de entradas', type: 'url', required: true, placeholder: 'https://ticketplus.cl/events/…' },
      { name: 'desde', label: 'Entradas desde', type: 'money' },
    ],
  },
  {
    key: 'artistas',
    label: 'Artistas invitados',
    singular: 'artista',
    group: 'Eventos',
    icon: 'star',
    description: 'Artistas que ya pasaron por la casona. Se muestran en Eventos junto a los shows que ya ocurrieron.',
    title: 'nombre',
    thumb: 'foto',
    meta: (d) => [d.que, d.cuando].filter(Boolean).join(' · '),
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'que', label: 'Qué hizo', type: 'text', placeholder: 'Show de humor', help: 'Opcional. Una frase corta: "Concierto íntimo", "Show de humor", "Nos visitó".' },
      { name: 'cuando', label: 'Cuándo', type: 'text', placeholder: 'Diciembre 2025', help: 'Opcional. Mes y año basta.' },
      { name: 'foto', label: 'Foto', type: 'image', aspect: '1 / 1', help: 'Opcional. Usa fotos propias o que el artista ya compartió con el restaurante.' },
      { name: 'link', label: 'Link a la historia o publicación', type: 'url', placeholder: 'https://www.instagram.com/…', help: 'Opcional. Al tocar el nombre se abre este enlace.' },
    ],
  },
  {
    key: 'karaoke_jornadas',
    label: 'Jornadas',
    singular: 'jornada',
    group: 'Karaoke',
    icon: 'calendar-dots',
    description: 'Noches del concurso. La inscripción cierra después de la última clasificatoria.',
    title: 'tipo',
    sortBy: 'fecha',
    meta: (d) => (d.fecha ? fechaCortaSafe(d.fecha) : ''),
    fields: [
      {
        name: 'tipo',
        label: 'Tipo',
        type: 'select',
        required: true,
        options: [
          { value: 'Clasificatoria', label: 'Clasificatoria' },
          { value: 'Gran final', label: 'Gran final' },
        ],
      },
      { name: 'fecha', label: 'Fecha y hora', type: 'datetime', required: true },
    ],
  },
  {
    key: 'karaoke_premios',
    label: 'Premios',
    singular: 'premio',
    group: 'Karaoke',
    icon: 'trophy',
    description: 'Premios en el orden del podio: primero, segundo, tercero.',
    title: 'lugar',
    meta: (d) => '$' + Number(d.monto || 0).toLocaleString('es-CL'),
    fields: [
      { name: 'lugar', label: 'Lugar', type: 'text', required: true, placeholder: '1er lugar' },
      { name: 'monto', label: 'Monto', type: 'money', required: true },
    ],
  },
  {
    key: 'karaoke_bases',
    label: 'Bases',
    singular: 'artículo',
    group: 'Karaoke',
    icon: 'scroll',
    description: 'Artículos de las bases oficiales del concurso.',
    title: 't',
    meta: (d) => `${(d.p ?? []).length} párrafos · ${(d.li ?? []).length} puntos`,
    fields: [
      { name: 't', label: 'Título', type: 'text', required: true },
      { name: 'p', label: 'Párrafos', type: 'strings', item: 'párrafo', multiline: true },
      { name: 'li', label: 'Puntos', type: 'strings', item: 'punto', multiline: true },
    ],
  },
  {
    key: 'escenas',
    label: 'Recorrido del inicio',
    singular: 'escena',
    group: 'Sitio',
    icon: 'film-strip',
    description: 'Las escenas del vuelo cinemático de la portada, en orden.',
    title: 'label',
    thumb: 'img',
    meta: (d) => d.eyebrow ?? '',
    fields: [
      { name: 'img', label: 'Foto', type: 'image', required: true, aspect: '16 / 9', help: 'Horizontal, de al menos 1600 px de ancho.' },
      { name: 'focal', label: 'Punto de vuelo', type: 'focal', image: 'img', help: 'Haz clic en la foto donde quieres que la cámara se acerque.' },
      { name: 'alt', label: 'Descripción de la foto', type: 'text', required: true, help: 'Para lectores de pantalla y buscadores.' },
      { name: 'label', label: 'Nombre del capítulo', type: 'text', required: true },
      { name: 'eyebrow', label: 'Antetítulo', type: 'text' },
      { name: 'title', label: 'Título', type: 'textarea', required: true, help: 'En la primera escena, cada línea nueva es un salto de línea del título principal.' },
      { name: 'body', label: 'Texto', type: 'textarea' },
    ],
  },
  {
    key: 'faqs',
    label: 'Preguntas frecuentes',
    singular: 'pregunta',
    group: 'Sitio',
    icon: 'question',
    description: 'Preguntas de la página de reservas.',
    title: 'q',
    fields: [
      { name: 'q', label: 'Pregunta', type: 'text', required: true },
      { name: 'a', label: 'Respuesta', type: 'textarea', required: true },
    ],
  },
];

const paginas = [
  { value: '/', label: 'Inicio' },
  { value: '/carta', label: 'Carta' },
  { value: '/reserva', label: 'Reservas' },
  { value: '/eventos', label: 'Eventos' },
  { value: '/karaoke', label: 'Karaoke' },
  { value: '/links', label: 'Links' },
];

export const singletons: Singleton[] = [
  {
    key: 'sitio',
    label: 'Configuración del sitio',
    group: 'Configuración',
    icon: 'gear-six',
    description: 'Aviso temporal, buscadores y cómo se ve el sitio al compartirlo.',
    fields: [
      { name: 'aviso_activo', label: 'Mostrar un aviso en el sitio', type: 'boolean', help: 'Aparece como una franja flotante en todas las páginas.' },
      { name: 'aviso_texto', label: 'Texto del aviso', type: 'text', wide: true, placeholder: 'Hoy cerramos a las 18:00 por evento privado.' },
      { name: 'aviso_link', label: 'Enlace del aviso', type: 'url', placeholder: 'Opcional' },
      { name: 'aviso_link_texto', label: 'Texto del enlace', type: 'text', placeholder: 'Ver más' },
      { name: 'aviso_hasta', label: 'Ocultar automáticamente después de', type: 'datetime', help: 'Opcional. Después de esta fecha el aviso desaparece solo.' },
      { name: 'seo_titulo', label: 'Título para Google', type: 'text', wide: true, required: true, help: 'El título de la página de inicio en buscadores y pestañas.' },
      { name: 'seo_descripcion', label: 'Descripción para Google', type: 'textarea', required: true, help: 'Unas 150 a 160 letras que resuman el restaurante.' },
      { name: 'og_imagen', label: 'Imagen al compartir en redes', type: 'image', aspect: '1200 / 630', help: 'Se ve al compartir el enlace por WhatsApp o redes. Ideal 1200 × 630.' },
      {
        name: 'paginas',
        label: 'Título y descripción por página',
        type: 'list',
        item: 'página',
        help: 'Opcional. Si una página no está aquí, usa su texto por defecto.',
        fields: [
          { name: 'ruta', label: 'Página', type: 'select', required: true, options: paginas },
          { name: 'titulo', label: 'Título', type: 'text' },
          { name: 'descripcion', label: 'Descripción', type: 'text' },
        ],
      },
      { name: 'url_sitio', label: 'Dirección principal del sitio', type: 'url', placeholder: 'https://casaolivorestaurante.cl', help: 'Se usa en el mapa del sitio para Google. Déjala vacía para usar la dirección actual.' },
      { name: 'indexar', label: 'Permitir que Google muestre el sitio', type: 'boolean', help: 'Desactívalo solo si el sitio aún no debe aparecer en buscadores.' },
    ],
  },
  {
    key: 'general',
    label: 'Datos del local',
    group: 'Sitio',
    icon: 'storefront',
    description: 'Contacto, dirección, horario y enlaces que se repiten en todo el sitio.',
    fields: [
      { name: 'whatsapp', label: 'WhatsApp', type: 'text', required: true, help: 'Con código de país y sin espacios: 56958785050.' },
      { name: 'instagram', label: 'Usuario de Instagram', type: 'text', required: true, placeholder: 'casaolivorestaurante' },
      { name: 'lugar', label: 'Lugar', type: 'text', placeholder: 'Espacio Santa Julia' },
      { name: 'direccion', label: 'Dirección', type: 'text', required: true },
      { name: 'maps', label: 'Link de Google Maps', type: 'url', required: true },
      { name: 'tableo', label: 'Link de Tableo', type: 'url', required: true },
      { name: 'tableo_slug', label: 'Identificador del widget de Tableo', type: 'text', required: true, help: 'La parte final de app.tableo.com/widget/…' },
      {
        name: 'horario',
        label: 'Horario',
        type: 'list',
        item: 'fila',
        fields: [
          { name: 'dias', label: 'Días', type: 'text', required: true },
          { name: 'horas', label: 'Horas', type: 'text', required: true, help: 'Escribe "Cerrado" si no abren.' },
        ],
      },
    ],
  },
  {
    key: 'inicio',
    label: 'Textos del inicio',
    group: 'Sitio',
    icon: 'house',
    description: 'Frases y textos de las secciones de la portada.',
    fields: [
      { name: 'tagline', label: 'Frase grande', type: 'textarea', required: true, help: 'Cada línea se muestra en su propia línea. Las dos últimas palabras van en terracota.' },
      { name: 'tagline_nota', label: 'Texto bajo la frase', type: 'textarea' },
      { name: 'valores', label: 'Palabras de la franja en movimiento', type: 'strings', item: 'palabra' },
      { name: 'cocina_titulo', label: 'Carta: título', type: 'text' },
      { name: 'cocina_texto', label: 'Carta: texto', type: 'textarea' },
      { name: 'cocina_cita', label: 'Carta: cita destacada', type: 'text' },
      { name: 'menu_texto', label: 'Menú ejecutivo: texto', type: 'textarea' },
      { name: 'celebra_titulo', label: 'Celebraciones: título', type: 'text' },
      { name: 'celebra_intro', label: 'Celebraciones: introducción', type: 'text' },
      {
        name: 'celebra_items',
        label: 'Celebraciones: lo que ofrecen',
        type: 'list',
        item: 'ítem',
        fields: [
          { name: 'titulo', label: 'Título', type: 'text', required: true },
          { name: 'texto', label: 'Texto', type: 'text' },
        ],
      },
      { name: 'equipo_titulo', label: 'Equipo: título', type: 'text' },
      { name: 'equipo_texto', label: 'Equipo: texto', type: 'textarea' },
      { name: 'visita_titulo', label: 'Visítanos: título', type: 'textarea', help: 'Cada línea nueva es un salto de línea.' },
      { name: 'visita_texto', label: 'Visítanos: texto', type: 'textarea' },
    ],
  },
  {
    key: 'menu_ejecutivo',
    label: 'Menú ejecutivo',
    group: 'Carta',
    icon: 'bowl-food',
    description: 'Precio, días y tiempos del menú de almuerzo.',
    fields: [
      { name: 'precio', label: 'Precio', type: 'money', required: true },
      { name: 'dias', label: 'Días', type: 'text', required: true, placeholder: 'Miércoles a viernes' },
      { name: 'horas', label: 'Horario', type: 'text', required: true, placeholder: '12:30 a 17:00' },
      { name: 'tiempos', label: 'Tiempos', type: 'strings', item: 'tiempo' },
      { name: 'nota', label: 'Nota', type: 'text' },
    ],
  },
  {
    key: 'happy_hour_info',
    label: 'Horario happy hour',
    group: 'Carta',
    icon: 'clock',
    description: 'Cuándo aplica el 2x y sus condiciones.',
    fields: [
      { name: 'dias', label: 'Días', type: 'text', required: true },
      { name: 'horas', label: 'Horario', type: 'text', required: true },
      { name: 'nota', label: 'Condiciones', type: 'text' },
      { name: 'pie', label: 'Nota al pie', type: 'text', placeholder: 'Precio por dos tragos.' },
    ],
  },
  {
    key: 'shows_info',
    label: 'Promoción y notas de shows',
    group: 'Eventos',
    icon: 'seal-percent',
    description: 'Un descuento o convenio para las entradas, y la nota que va bajo los shows.',
    fields: [
      { name: 'promo_activa', label: 'Mostrar la promoción', type: 'boolean', help: 'Aparece destacada sobre los próximos shows.' },
      { name: 'promo_titulo', label: 'Título', type: 'text', wide: true, placeholder: '20% de descuento para socios de O\'Higgins FC' },
      { name: 'promo_texto', label: 'Detalle', type: 'textarea', placeholder: 'Socios y abonados del club, en las entradas de los próximos shows.' },
      { name: 'promo_codigo', label: 'Código de descuento', type: 'text', placeholder: 'CIUDADCELESTE', help: 'Opcional. Se muestra con un botón para copiarlo.' },
      { name: 'promo_hasta', label: 'Ocultar automáticamente después de', type: 'datetime', help: 'Opcional.' },
      { name: 'nota', label: 'Nota bajo los shows', type: 'text', wide: true, placeholder: 'En días de espectáculo el happy hour no aplica.' },
    ],
  },
  {
    key: 'karaoke',
    label: 'Concurso de karaoke',
    group: 'Karaoke',
    icon: 'microphone-stage',
    description: 'Nombre, lema, formulario de inscripción y datos destacados.',
    fields: [
      { name: 'activo', label: 'Mostrar el concurso en el sitio', type: 'boolean' },
      { name: 'edicion', label: 'Edición', type: 'text', placeholder: 'Segunda edición' },
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'lema', label: 'Lema', type: 'text' },
      { name: 'form', label: 'Link del formulario de Google', type: 'url', required: true, help: 'El enlace "viewform" del formulario de inscripción.' },
      {
        name: 'datos',
        label: 'Datos destacados',
        type: 'list',
        item: 'dato',
        fields: [
          { name: 't', label: 'Título', type: 'text', required: true },
          { name: 'd', label: 'Detalle', type: 'text' },
        ],
      },
    ],
  },
];

function fechaCortaSafe(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d);
  } catch {
    return iso;
  }
}

export const getCollection = (key: string) => collections.find((c) => c.key === key);
export const getSingleton = (key: string) => singletons.find((s) => s.key === key);

export const groups = ['Carta', 'Eventos', 'Karaoke', 'Sitio'];
