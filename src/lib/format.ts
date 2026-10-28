// Formatos compartidos por el sitio y el panel. Todo en hora de Chile.

export const TZ = 'America/Santiago';

export const clp = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function zoned(d: Date) {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d);
  const get = (t: string) => f.find((p) => p.type === t)!.value;
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
  };
}

/** Partes de una fecha en hora de Chile, sin depender de la zona del servidor. */
export function partes(iso: string) {
  const z = zoned(new Date(iso));
  return {
    dia: z.day,
    mes: meses[z.month - 1],
    mesCorto: meses[z.month - 1].slice(0, 3),
    semana: dias[z.weekday],
    hora: `${String(z.hour).padStart(2, '0')}:${String(z.minute).padStart(2, '0')}`,
  };
}

/** Fin aproximado de un evento: tres horas después de empezar. */
export const termina = (iso: string) => new Date(iso).getTime() + 3 * 60 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO → valor de <input type="datetime-local"> en hora de Chile. */
export function isoToLocalInput(iso: string) {
  if (!iso) return '';
  const z = zoned(new Date(iso));
  return `${z.year}-${pad(z.month)}-${pad(z.day)}T${pad(z.hour)}:${pad(z.minute)}`;
}

/** Valor de <input type="datetime-local"> en hora de Chile → ISO con su desfase real. */
export function localInputToIso(local: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(local);
  if (!m) return '';
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const target = Date.UTC(y, mo - 1, d, h, mi);
  // Ajuste iterativo: corrige por el desfase de Santiago en esa fecha (cambia con el horario de verano)
  let t = target;
  for (let i = 0; i < 3; i++) {
    const z = zoned(new Date(t));
    const shown = Date.UTC(z.year, z.month - 1, z.day, z.hour, z.minute);
    t += target - shown;
  }
  const offsetMin = Math.round((target - t) / 60000);
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** Fecha corta legible para el panel: "vie 27 nov, 19:30". */
export function fechaCorta(iso: string) {
  const p = partes(iso);
  return `${p.semana.slice(0, 3)} ${p.dia} ${p.mesCorto}, ${p.hora}`;
}

/** 56958785050 → +56 9 5878 5050 */
export function telefono(raw: string) {
  const d = String(raw ?? '').replace(/\D/g, '');
  const m = /^56(9)(\d{4})(\d{4})$/.exec(d);
  return m ? `+56 ${m[1]} ${m[2]} ${m[3]}` : d ? `+${d}` : '';
}
