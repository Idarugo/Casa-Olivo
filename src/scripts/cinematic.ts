/*
  Vuelo cinemático de Casa Olivo.
  Adaptado del motor de scroll-world (references/scrub-engine.js): el scroll no
  reproduce nada, solo mueve un "tiempo" que se suaviza con lerp en cada frame.
  En lugar de clips de video generados, la cámara vuela sobre las fotos reales:
  se acerca al punto focal de cada escena y, en la costura, se lanza hacia
  adentro mientras la siguiente escena aterriza desde un zoom mayor.
*/

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
// Igual que `linger` en scroll-world: la cámara se asienta a mitad de escena,
// justo donde el texto está en su punto máximo, y acelera en los bordes.
const linger = (x: number, l: number) => {
  const c = x - 0.5;
  return (1 - l) * x + l * (4 * c * c * c + 0.5);
};

const SEAM = 0.3; // fracción final de cada escena dedicada a la transición
const LINGER = 0.4;

export function mountCinematic(root: HTMLElement) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenes = [...root.querySelectorAll<HTMLElement>('[data-scene]')];
  const imgs = scenes.map((s) => s.querySelector('img')!);
  const copies = [...root.querySelectorAll<HTMLElement>('[data-copy]')];
  const jumps = [...root.querySelectorAll<HTMLButtonElement>('[data-jump]')];
  const flash = root.querySelector<HTMLElement>('[data-flash]')!;
  const hint = root.querySelector<HTMLElement>('[data-hint]');
  const bar = root.querySelector<HTMLElement>('[data-progress]')!;
  const N = scenes.length;
  const desktop = window.matchMedia('(min-width: 768px)');

  let top = 0;
  let range = 1;
  let target = 0;
  let cur = 0;
  let running = false;
  let active = -1;

  function measure() {
    const r = root.getBoundingClientRect();
    top = r.top + window.scrollY;
    range = Math.max(1, root.offsetHeight - window.innerHeight);
    read();
  }

  let last = 0;

  function read() {
    target = clamp((window.scrollY - top) / range) * N;
    if (!running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(tick);
    }
  }

  // Suavizado por tiempo real, no por frame: se siente igual a 30, 60 o 120 Hz.
  function tick(now: number) {
    const dt = Math.min(100, now - last);
    last = now;
    const k = reduce ? 1 : 1 - Math.exp(-dt / 110);
    cur += (target - cur) * k;
    if (Math.abs(target - cur) < 0.0005) cur = target;
    render(cur);
    if (cur !== target) requestAnimationFrame(tick);
    else running = false;
  }

  function render(p: number) {
    let flashOp = 0;

    for (let i = 0; i < N; i++) {
      const u = p - i; // tiempo local de la escena i: 0 → 1
      const own = clamp(u);
      const last = i === N - 1;

      // salida: los últimos SEAM de la escena (excepto la última)
      const out = last ? 0 : smooth((u - (1 - SEAM)) / SEAM);
      // entrada: la escena se monta sobre la salida de la anterior
      const inn = i === 0 ? 1 : smooth((u + SEAM) / SEAM);

      let opacity = i === 0 ? 1 - smooth((out - 0.35) / 0.65) : inn * (1 - smooth((out - 0.35) / 0.65));
      if (u < -SEAM || u > 1) opacity = 0;
      if (last && u > 0) opacity = 1;

      scenes[i].style.opacity = opacity.toFixed(4);
      scenes[i].style.zIndex = String(u >= 0 ? 2 : 1);
      scenes[i].style.visibility = opacity > 0.001 ? 'visible' : 'hidden';

      if (reduce) continue;

      const t = linger(clamp(own / (1 - SEAM)), LINGER);
      // empuje de cámara dentro de la escena
      let scale = 1.04 + t * 0.12;
      // fuga hacia el punto focal en la costura
      scale *= 1 + out * out * 1.6;
      // aterrizaje desde un zoom mayor
      if (u < 0) scale *= 1 + (1 - inn) * 0.45;
      const drift = (t - 0.5) * -1.2; // vh
      imgs[i].style.transform = `translate3d(0, ${drift.toFixed(3)}vh, 0) scale(${scale.toFixed(4)})`;

      if (!last) flashOp = Math.max(flashOp, Math.sin(Math.PI * clamp(out)) * 0.55);
    }
    flash.style.opacity = flashOp.toFixed(3);

    // Texto: el héroe saluda al cargar; los demás capítulos aparecen a mitad de escena
    for (let i = 0; i < N; i++) {
      const u = p - i;
      let op: number;
      if (i === 0) op = 1 - smooth((u - 0.32) / 0.25);
      else if (i === N - 1) op = smooth((u - 0.02) / 0.2);
      else op = smooth((u - 0.02) / 0.2) * (1 - smooth((u - 0.58) / 0.14));
      const y = reduce ? 0 : (0.35 - clamp(u)) * 40;
      const c = copies[i];
      c.style.opacity = op.toFixed(3);
      c.style.transform = desktop.matches ? `translate3d(0, calc(-50% + ${y.toFixed(1)}px), 0)` : `translate3d(0, ${y.toFixed(1)}px, 0)`;
      c.style.visibility = op > 0.01 ? 'visible' : 'hidden';
      c.style.pointerEvents = op > 0.6 ? 'auto' : 'none';
    }

    const near = clamp(Math.round(p - 0.15), 0, N - 1);
    if (near !== active) {
      active = near;
      jumps.forEach((b, k) => b.setAttribute('aria-current', String(k === near)));
    }
    bar.style.transform = `scaleX(${clamp(p / N).toFixed(4)})`;
    if (hint) hint.style.opacity = String(clamp(1 - p * 4));
  }

  function jumpTo(i: number) {
    const y = top + ((i + 0.4) / N) * range;
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }
  jumps.forEach((b) => b.addEventListener('click', () => jumpTo(Number(b.dataset.jump))));

  // Las anclas de capítulos (#casona, #salon…) apuntan a artículos fijos;
  // las redirigimos al punto del scroll donde ese capítulo está en pantalla.
  copies.forEach((c, i) => {
    if (!c.id) return;
    document.querySelectorAll<HTMLAnchorElement>(`a[href="#${c.id}"], a[href="/#${c.id}"]`).forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        jumpTo(i);
        history.replaceState(null, '', `#${c.id}`);
      }),
    );
  });

  let lastW = window.innerWidth;
  window.addEventListener('scroll', read, { passive: true });
  window.addEventListener('resize', () => {
    // Las barras del navegador móvil cambian solo el alto: no remedir.
    if (window.matchMedia('(pointer: coarse)').matches && window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    measure();
  });
  window.addEventListener('load', measure);
  measure();
  cur = target;
  render(cur);
}
