/*
  Carta: portada con scroll, barra de categorías con scrollspy y búsqueda.
*/

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

// ---- Portada ----
const hero = document.querySelector<HTMLElement>('[data-carta-hero]')!;
const heroImg = hero.querySelector<HTMLElement>('[data-ch-img]')!;
const heroCopy = hero.querySelector<HTMLElement>('[data-ch-copy]')!;
const heroShade = hero.querySelector<HTMLElement>('[data-ch-shade]')!;
const heroL = hero.querySelector<HTMLElement>('[data-ch-l]')!;
const heroR = hero.querySelector<HTMLElement>('[data-ch-r]')!;

// ---- Barra ----
const chips = [...document.querySelectorAll<HTMLAnchorElement>('[data-chip]')];
const chipBox = document.querySelector<HTMLElement>('[data-chips]')!;
const cats = [...document.querySelectorAll<HTMLElement>('[data-cat]')];
const progress = document.querySelector<HTMLElement>('[data-cbar-progress]')!;
const carta = document.querySelector<HTMLElement>('[data-carta]')!;
const drift = [...document.querySelectorAll<HTMLElement>('[data-drift]')];
const hhX = document.querySelector<HTMLElement>('[data-hh-x]');

let active = '';
function setActive(id: string) {
  if (id === active) return;
  active = id;
  for (const c of chips) {
    const on = c.dataset.chip === id;
    c.setAttribute('aria-current', String(on));
    if (on) {
      const box = chipBox.getBoundingClientRect();
      const r = c.getBoundingClientRect();
      const left = chipBox.scrollLeft + (r.left - box.left) - box.width / 2 + r.width / 2;
      chipBox.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
}

let ticking = false;
function frame() {
  ticking = false;
  const vh = window.innerHeight;

  // Portada: zoom hacia el espejo, el título se separa y se oscurece
  const r = hero.getBoundingClientRect();
  const p = clamp(-r.top / (hero.offsetHeight - vh));
  if (!reduce) {
    heroImg.style.transform = `scale(${(1.05 + p * 0.5).toFixed(4)})`;
    heroL.style.transform = `translate3d(${(-p * 18).toFixed(2)}vw, 0, 0)`;
    heroR.style.transform = `translate3d(${(p * 18).toFixed(2)}vw, 0, 0)`;
    heroCopy.style.transform = `translate3d(0, ${(-p * 60).toFixed(1)}px, 0)`;
  }
  heroCopy.style.opacity = String(1 - clamp((p - 0.35) / 0.5));
  heroShade.style.opacity = String(1 + p * 0.3);

  // Scrollspy: la última categoría cuyo inicio pasó bajo la barra
  const line = 170;
  let current = '';
  for (const c of cats) {
    if (c.hidden) continue;
    if (c.getBoundingClientRect().top <= line) current = c.id;
  }
  setActive(current || (cats.find((c) => !c.hidden)?.id ?? ''));

  const cr = carta.getBoundingClientRect();
  progress.style.transform = `scaleX(${clamp((line - cr.top) / (cr.height - vh * 0.5)).toFixed(4)})`;

  if (!reduce) {
    for (const el of drift) {
      const b = el.parentElement!.getBoundingClientRect();
      const t = clamp((vh - b.top) / (vh + b.height));
      el.style.transform = `translate3d(0, ${((0.5 - t) * 40).toFixed(1)}px, 0)`;
    }
    if (hhX) {
      const b = hhX.getBoundingClientRect();
      const t = clamp((vh - b.top) / vh);
      hhX.style.transform = `scale(${(0.7 + t * 0.3).toFixed(3)}) rotate(${((1 - t) * -8).toFixed(2)}deg)`;
    }
  }
}
function request() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(frame);
  }
}
window.addEventListener('scroll', request, { passive: true });
window.addEventListener('resize', request);
frame();

// ---- Búsqueda ----
const input = document.querySelector<HTMLInputElement>('[data-search]')!;
const empty = document.querySelector<HTMLElement>('[data-empty]')!;
const emptyQ = document.querySelector<HTMLElement>('[data-empty-q]')!;
const items = [...document.querySelectorAll<HTMLElement>('[data-plato]')];
const secs = [...document.querySelectorAll<HTMLElement>('[data-sec]')];

function filter() {
  const q = norm(input.value);
  const words = q.split(/\s+/).filter(Boolean);
  let total = 0;
  for (const it of items) {
    const hay = it.dataset.search ?? '';
    const ok = words.every((w) => hay.includes(w));
    it.hidden = !ok;
    if (ok) total++;
  }
  // Ocultar grupos, categorías y secciones sin resultados
  document.querySelectorAll<HTMLElement>('.grupo').forEach((g) => {
    g.hidden = !g.querySelector('[data-plato]:not([hidden])');
  });
  for (const c of cats) {
    c.hidden = !c.querySelector('[data-plato]:not([hidden])');
    chips.find((ch) => ch.dataset.chip === c.id)!.hidden = c.hidden;
  }
  for (const s of secs) s.hidden = !s.querySelector('[data-plato]:not([hidden])');

  empty.hidden = total > 0;
  emptyQ.textContent = `“${input.value.trim()}”`;
  request();
}

let t: number | undefined;
input.addEventListener('input', () => {
  window.clearTimeout(t);
  t = window.setTimeout(() => {
    filter();
    // Llevar al lector al inicio de los resultados
    if (input.value.trim()) {
      const top = carta.getBoundingClientRect().top + window.scrollY - 150;
      if (window.scrollY > top + 10 || window.scrollY < top - 10) window.scrollTo({ top, behavior: 'auto' });
    }
  }, 120);
});
input.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    input.value = '';
    filter();
  }
});
document.querySelector('[data-clear]')!.addEventListener('click', () => {
  input.value = '';
  filter();
  input.focus();
});
