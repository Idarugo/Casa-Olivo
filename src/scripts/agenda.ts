/*
  Agenda: el sitio es estático, así que al abrir la página se vuelve a mirar
  la hora para ocultar lo que ya pasó y marcar lo que viene.
*/

const now = Date.now();

// Shows y tarjetas con fecha de término
document.querySelectorAll<HTMLElement>('[data-ends]').forEach((el) => {
  if (Number(el.dataset.ends) <= now) el.remove();
});

// Listas que quedaron vacías muestran su estado vacío
document.querySelectorAll<HTMLElement>('[data-agenda]').forEach((list) => {
  const empty = list.querySelector<HTMLElement>('[data-agenda-empty]');
  if (empty) empty.hidden = !!list.querySelector('[data-ends]');
});

// Jornadas del karaoke: pasadas, próxima y futuras
const jornadas = [...document.querySelectorAll<HTMLElement>('[data-jornada]')];
let next = -1;
jornadas.forEach((j, i) => {
  const ends = Number(j.dataset.jornada);
  const done = ends <= now;
  j.classList.toggle('is-done', done);
  if (!done && next < 0) next = i;
});
if (next >= 0) jornadas[next].classList.add('is-next');

// Inscripciones: abiertas hasta que termina la última clasificatoria
document.querySelectorAll<HTMLElement>('[data-open-until]').forEach((el) => {
  const open = now < Number(el.dataset.openUntil);
  el.querySelectorAll<HTMLElement>('[data-if-open]').forEach((x) => (x.hidden = !open));
  el.querySelectorAll<HTMLElement>('[data-if-closed]').forEach((x) => (x.hidden = open));
});
