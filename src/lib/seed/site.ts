export const links = {
  reserva: '/reserva',
  carta: '/carta',
  tableo: 'https://app.tableo.com/r/_PG13BP',
  maps: 'https://maps.app.goo.gl/enW6uzUFeeBVgfN79',
  whatsapp: 'https://wa.me/56958785050',
  instagram: 'https://www.instagram.com/casaolivorestaurante',
};

export type Scene = {
  id: string;
  img: string;
  alt: string;
  /** Punto hacia donde vuela la cámara, en % de la foto. */
  focal: [number, number];
  label: string;
  eyebrow: string;
  title: string;
  body: string;
};

export const scenes: Scene[] = [
  {
    id: 'inicio',
    img: 'casona-noche',
    alt: 'Fachada de la casona de Casa Olivo iluminada al atardecer',
    focal: [47, 58],
    label: 'Inicio',
    eyebrow: 'Olivar · Sexta región',
    title: 'Cocina chilena en una casona con más de cien años',
    body: 'Tradición y creatividad en una carta que emociona, a pocos minutos de Rancagua.',
  },
  {
    id: 'casona',
    img: 'casona-jardin',
    alt: 'Casona blanca de tejas con arco de entrada, palmera y jardín',
    focal: [60, 62],
    label: 'La casona',
    eyebrow: 'La casona',
    title: 'Restaurada, con el alma intacta',
    body: 'Un refugio de buen gusto y calidez que renace con un nuevo propósito: celebrar lo mejor de nuestra cultura culinaria.',
  },
  {
    id: 'salon',
    img: 'salon',
    alt: 'Salón con mesas de madera, lámpara de lágrimas y espejo dorado',
    focal: [68, 42],
    label: 'El salón',
    eyebrow: 'El salón',
    title: 'La cocina que nace en las casas y en los campos',
    body: 'Rescatamos la cocina chilena de los encuentros familiares. Aquí cada plato tiene identidad y cada ingrediente tiene un propósito.',
  },
  {
    id: 'terraza',
    img: 'terraza',
    alt: 'Terraza luminosa con arcos, olivos en macetero y mesas de madera',
    focal: [72, 48],
    label: 'La terraza',
    eyebrow: 'La terraza',
    title: 'Sobremesas largas bajo los arcos',
    body: 'Luz de tarde, olivos y un espacio pensado para quedarse. Para el almuerzo de semana o la celebración que vienes planeando.',
  },
  {
    id: 'cocina',
    img: 'ceviche',
    alt: 'Pocillos de greda con ceviche fresco recién preparados',
    focal: [50, 50],
    label: 'La cocina',
    eyebrow: 'La cocina',
    title: 'Hecho al momento, con ingredientes frescos',
    body: 'Cuidamos cada plato como si lo preparáramos en casa, con sabores que respetan nuestra identidad chilena.',
  },
];

export const horario = [
  { dias: 'Lunes y martes', horas: 'Cerrado' },
  { dias: 'Miércoles a sábado', horas: '12:30 a 23:00' },
  { dias: 'Domingo y festivos', horas: '12:30 a 18:00' },
];
