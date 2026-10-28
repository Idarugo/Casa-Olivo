// Agenda de Casa Olivo. Las fechas van con zona horaria de Chile continental
// (verano, UTC−3). Los eventos pasados se ocultan solos: al compilar y en el navegador.

export type Show = {
  id: string;
  artista: string;
  subtitulo?: string;
  fecha: string; // ISO con zona horaria
  poster: string;
  entradas: string;
  desde?: number;
};

export const shows: Show[] = [
  {
    id: 'toto-acuna',
    artista: 'Toto Acuña',
    subtitulo: 'Totos Juntos',
    fecha: '2026-10-24T19:30:00-03:00',
    poster: '/img/shows/show-toto-acuna.webp',
    entradas: 'https://ticketplus.cl/events/totos-juntos-toto-acuna-en-vivo-en-casa-olivo-restaurante',
  },
  {
    id: 'sexual-democracia',
    artista: 'Sexual Democracia',
    subtitulo: 'En vivo en la casona',
    fecha: '2026-11-27T19:30:00-03:00',
    poster: '/img/shows/show-sexual-democracia.webp',
    entradas: 'https://ticketplus.cl/events/sexual-democracia-en-vivo-en-casa-olivo-restaurante',
    desde: 19040,
  },
  {
    id: 'juan-antonio-labra',
    artista: 'Juan Antonio Labra',
    subtitulo: 'Concierto íntimo',
    fecha: '2026-12-04T19:30:00-03:00',
    poster: '/img/shows/show-juan-antonio-labra.webp',
    entradas: 'https://ticketplus.cl/events/juan-antonio-labra-en-vivo-en-casa-olivo-restaurante',
    desde: 19040,
  },
];

export const karaoke = {
  edicion: 'Segunda edición',
  nombre: 'Concurso de Karaoke Casa Olivo',
  lema: 'Tu voz, nuestra noche',
  form: 'https://docs.google.com/forms/d/e/1FAIpQLSfYSsC5SG4QUKp_ApjQq35CUoxzwRnxqkkLeRl7XglLj2gjAw/viewform',
  jornadas: [
    { tipo: 'Clasificatoria', fecha: '2026-10-30T20:30:00-03:00' },
    { tipo: 'Clasificatoria', fecha: '2026-11-07T20:30:00-03:00' },
    { tipo: 'Clasificatoria', fecha: '2026-11-14T20:30:00-03:00' },
    { tipo: 'Gran final', fecha: '2026-11-21T20:30:00-03:00' },
  ],
  premios: [
    { lugar: '1er lugar', monto: 200000 },
    { lugar: '2do lugar', monto: 100000 },
    { lugar: '3er lugar', monto: 50000 },
  ],
  datos: [
    { t: 'Inscripción gratuita', d: 'Los cupos se asignan por orden de inscripción.' },
    { t: 'Mayores de 18 años', d: 'Máximo 15 participantes por jornada.' },
    { t: 'Desde las 20:30', d: 'Sorteo de grupos al llegar. Término cerca de las 23:00.' },
    { t: 'Vota el público', d: 'Con código QR en pantalla, solo asistentes presentes.' },
  ],
};

/** Bases oficiales, transcritas desde casaolivorestaurante.cl/karaoke */
export const bases: { t: string; p?: string[]; li?: string[] }[] = [
  {
    t: 'Objetivo',
    p: [
      'El Concurso de Karaoke Casa Olivo tiene como finalidad generar un espacio de entretención, participación y sana competencia, promoviendo la música, la integración entre los asistentes y una experiencia entretenida para todos los clientes del restaurante.',
    ],
  },
  {
    t: 'Fechas del concurso',
    li: ['Jornadas clasificatorias: viernes 30 de octubre, sábado 7 de noviembre y sábado 14 de noviembre.', 'Gran final: sábado 21 de noviembre.'],
  },
  {
    t: 'Horarios',
    li: ['Inicio: 20:30 horas. Sorteo para determinar con quién competirá cada participante.', 'Término aproximado: 23:00 horas.'],
    p: ['La organización podrá realizar ajustes menores de horario para asegurar el correcto desarrollo del evento.'],
  },
  {
    t: 'Participantes',
    li: [
      'Máximo 15 participantes por jornada clasificatoria.',
      'Participación para mayores de 18 años.',
      'Inscripción gratuita.',
      'Los cupos se asignarán por orden de inscripción.',
      'El día que le corresponda competir, cada participante debe llegar a las 20:30 horas para el sorteo que determinará contra quién competirá en la primera etapa.',
      'Ese día, cada participante podrá elegir un bebestible y una botella de agua.',
      'Si lo requieren, tendrán un camarín compartido con los otros participantes.',
      'Al inscribirse, cada participante debe enviar tres opciones de canción (duración máxima de 5 minutos), con el link de YouTube de la versión karaoke. Las canciones seleccionadas serán las que se cantarán durante toda la competencia, incluida la final.',
    ],
  },
  {
    t: 'Sistema de competencia',
    p: ['Cada jornada clasificatoria contará con 15 participantes, divididos en 5 grupos de 3 cantantes asignados de forma aleatoria. El orden de participación también será aleatorio.'],
    li: [
      'Cada participante interpretará una canción.',
      'Al finalizar cada grupo, el público presente votará mediante código QR proyectado en pantalla.',
      'Se elegirá un ganador por grupo, para obtener 5 ganadores por noche.',
    ],
  },
  {
    t: 'Final de la noche',
    li: [
      'Los 5 ganadores de grupo competirán nuevamente durante la misma jornada.',
      'Al finalizar esta ronda, el público presente votará mediante código QR.',
      'Se determinarán el 1°, 2° y 3° lugar.',
      // Así dicen las bases originales, aunque luego no describen una semifinal.
      'Los tres primeros lugares de cada jornada clasificarán automáticamente a la semifinal.',
    ],
  },
  {
    t: 'Gran final, sábado 21 de noviembre',
    p: ['La jornada estará compuesta por los quince clasificados de las jornadas previas, y se desarrollará en dos rondas:'],
    li: [
      'Ronda 1: los finalistas interpretarán una canción y el público presente votará mediante código QR.',
      'Ronda 2: los finalistas interpretarán una nueva canción y el público votará nuevamente.',
      'Se sumarán los votos de ambas rondas. Quien acumule más votos será proclamado Campeón de la 2da edición del Karaoke Casa Olivo 2026.',
      'Premios: 1er lugar $200.000 en efectivo y trofeo; 2do lugar $100.000 en efectivo y trofeo; 3er lugar $50.000 en efectivo y trofeo.',
    ],
  },
  {
    t: 'Sistema de votación',
    p: ['La votación será digital, mediante código QR mostrado en la pantalla del restaurante, y exclusiva para asistentes presentes.'],
    li: [
      'Un voto por dispositivo por ronda.',
      'Las votaciones tendrán tiempo limitado.',
      'La organización podrá invalidar votos fraudulentos o intentos de manipulación.',
    ],
  },
  {
    t: 'Participación del público',
    p: ['Entre rondas se abrirán espacios para karaoke abierto, concursos, sorteos y entrega de premios y regalos, para mantener la participación del público durante toda la jornada.'],
  },
  {
    t: 'Conducta y respeto',
    p: ['No se permitirá lenguaje ofensivo, conductas agresivas, actitudes discriminatorias ni comportamientos que alteren el desarrollo normal del concurso. La organización podrá descalificar participantes o solicitar el retiro de asistentes que incumplan estas normas.'],
  },
  {
    t: 'Uso de imagen',
    p: ['Los participantes autorizan a Casa Olivo a utilizar fotografías y registros audiovisuales obtenidos durante el concurso para fines promocionales, publicaciones en redes sociales y difusión de futuras actividades.'],
  },
  {
    t: 'Facultades de la organización',
    p: ['La organización se reserva el derecho de resolver situaciones no contempladas en estas bases, ajustar aspectos operativos del concurso y realizar modificaciones que contribuyan a su correcto desarrollo. Sus decisiones serán inapelables.'],
  },
];
