/*
  Efectos de scroll fuera del vuelo cinemático.
  Un solo listener de scroll pasivo, agrupado por requestAnimationFrame.
*/

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 0 cuando el elemento asoma por abajo, 1 cuando sale por arriba. */
function through(el: Element) {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return clamp((vh - r.top) / (vh + r.height));
}

// Revelados: una sola vez
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  },
  { rootMargin: '0px 0px -12% 0px' },
);
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

// Contador de precio
const countIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      countIO.unobserve(e.target);
      const el = e.target as HTMLElement;
      const end = Number(el.dataset.count);
      if (reduce) return;
      const t0 = performance.now();
      const dur = 1400;
      const step = (now: number) => {
        const k = clamp((now - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 4);
        el.textContent = Math.round(end * eased).toLocaleString('es-CL');
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  },
  { threshold: 0.6 },
);
document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

const words = [...document.querySelectorAll<HTMLElement>('[data-words] .tagline__word')];
const marquee = document.querySelector<HTMLElement>('[data-marquee]');
const spin = document.querySelector<HTMLElement>('[data-spin]');
const unveil = document.querySelector<HTMLElement>('[data-unveil]');
const parallax = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];

let ticking = false;
function frame() {
  ticking = false;
  const vh = window.innerHeight;

  // Palabras: se encienden una a una al cruzar la línea del 70 %
  const line = vh * 0.7;
  for (const w of words) {
    const on = w.getBoundingClientRect().top < line;
    w.classList.toggle('is-on', on);
  }

  if (reduce) return;

  if (marquee) {
    const p = through(marquee.parentElement!);
    marquee.style.transform = `translate3d(${(-p * 50).toFixed(2)}%, 0, 0)`;
  }
  if (spin) {
    const p = through(spin);
    spin.style.transform = `translate3d(0, ${((0.5 - p) * 80).toFixed(1)}px, 0) rotate(${((p - 0.5) * 70).toFixed(2)}deg)`;
  }
  if (unveil) {
    const r = unveil.parentElement!.getBoundingClientRect();
    const p = clamp((vh - r.top) / (vh * 0.9));
    const e = 1 - Math.pow(1 - p, 3);
    unveil.style.setProperty('--inset', `${((1 - e) * 12).toFixed(2)}%`);
    unveil.style.setProperty('--zoom', (1 + (1 - e) * 0.2).toFixed(4));
  }
  for (const el of parallax) {
    const k = Number(el.dataset.parallax) || 0.1;
    const p = through(el.parentElement!);
    el.style.transform = `translate3d(0, ${((p - 0.5) * -k * 100 - 8).toFixed(2)}%, 0)`;
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
