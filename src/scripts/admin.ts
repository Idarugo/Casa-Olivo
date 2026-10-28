/*
  Interacciones del panel. Todo funciona también sin JavaScript (formularios
  normales); esto suma arrastrar, subir fotos, atajos y avisos.
*/

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
const icon = (paths: string) => `<svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">${paths}</svg>`;
const ICON_OK = icon('<path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/>');
const ICON_ERR = icon('<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"/>');

// ---------- Avisos ----------
export function toast(text: string, kind: 'ok' | 'error' = 'ok') {
  const box = $('[data-toasts]');
  if (!box) return;
  const t = document.createElement('div');
  t.className = `toast${kind === 'error' ? ' toast--error' : ''}`;
  t.innerHTML = `<span class="icon">${kind === 'ok' ? ICON_OK : ICON_ERR}</span><span></span>`;
  t.lastElementChild!.textContent = text;
  box.appendChild(t);
  setTimeout(() => {
    t.classList.add('is-leaving');
    setTimeout(() => t.remove(), 300);
  }, 3600);
}

const okMessages: Record<string, string> = {
  guardado: 'Cambios guardados. Ya se ven en el sitio.',
  creado: 'Listo, quedó publicado en el sitio.',
  eliminado: 'Eliminado del sitio.',
  duplicado: 'Copia creada. Ajusta lo que necesites y guarda.',
  bienvenida: 'Tu cuenta quedó creada.',
};
const params = new URLSearchParams(location.search);
const ok = params.get('ok');
if (ok && okMessages[ok]) {
  toast(okMessages[ok]);
  params.delete('ok');
  history.replaceState(null, '', location.pathname + (params.toString() ? `?${params}` : '') + location.hash);
}
if (params.get('error') === 'noexiste') toast('Ese elemento ya no existe. Quizás alguien lo eliminó.', 'error');

// ---------- Menú móvil ----------
const admin = $('[data-admin]');
$('[data-menu]')?.addEventListener('click', () => admin?.classList.add('is-menu'));
$('[data-scrim]')?.addEventListener('click', () => admin?.classList.remove('is-menu'));

// ---------- Confirmaciones ----------
const dialog = $<HTMLDialogElement>('[data-confirm-dialog]');
let confirmed: HTMLButtonElement | null = null;
document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-confirm]');
  if (!btn || !dialog || btn === confirmed) return;
  e.preventDefault();
  $('[data-confirm-title]', dialog)!.textContent = btn.dataset.confirm!;
  $('[data-confirm-text]', dialog)!.textContent = btn.dataset.confirmText ?? 'Esta acción no se puede deshacer.';
  dialog.showModal();
  dialog.addEventListener(
    'close',
    () => {
      if (dialog.returnValue !== 'ok') return;
      confirmed = btn;
      btn.click();
      confirmed = null;
    },
    { once: true },
  );
});

// ---------- Formularios ----------
const form = $<HTMLFormElement>('[data-form]');
const savebar = $('[data-savebar]');
let dirty = false;
let submitting = false;

function markDirty() {
  if (dirty) return;
  dirty = true;
  savebar?.classList.add('is-on');
  savebar?.setAttribute('aria-hidden', 'false');
}

if (form) {
  form.addEventListener('input', markDirty);
  form.addEventListener('change', markDirty);

  // Renumera las filas repetibles según su orden en pantalla antes de enviar
  form.addEventListener('submit', (e) => {
    const submitter = (e as SubmitEvent).submitter as HTMLElement | null;
    $$('[data-repeat]', form).forEach((rep) => {
      const base = rep.dataset.repeat!;
      $$('[data-repeat-rows] > [data-repeat-row]', rep).forEach((row, i) => {
        $$<HTMLInputElement>('[name]', row).forEach((input) => {
          const rest = input.name.slice(base.length + 1).replace(/^[^.]+/, '');
          input.name = `${base}.${i}${rest}`;
        });
      });
    });
    // Precios: enviar solo dígitos
    $$<HTMLInputElement>('[data-money]', form).forEach((m) => (m.value = m.value.replace(/[^\d]/g, '')));
    submitting = true;
    if (!submitter?.hasAttribute('data-skip-dirty')) $$('button[type=submit][value=save]', form).forEach((b) => b.classList.add('is-busy'));
  });

  window.addEventListener('beforeunload', (e) => {
    if (dirty && !submitting) e.preventDefault();
  });

  // ⌘S / Ctrl+S guarda
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      form.requestSubmit($<HTMLButtonElement>('[data-save]', form) ?? undefined);
    }
  });

  // Lleva la vista al primer error
  const firstError = $('.field.has-error', form);
  if (firstError) {
    firstError.scrollIntoView({ block: 'center', behavior: 'smooth' });
    $<HTMLInputElement>('input, textarea, select', firstError)?.focus({ preventScroll: true });
  }
}

// Textareas que crecen con el contenido
function autosize(t: HTMLTextAreaElement) {
  t.style.height = 'auto';
  t.style.height = `${Math.max(t.scrollHeight + 2, 48)}px`;
}
document.addEventListener('input', (e) => {
  const t = e.target as HTMLTextAreaElement;
  if (t.matches?.('[data-autosize]')) autosize(t);
});
$$<HTMLTextAreaElement>('[data-autosize]').forEach(autosize);

// Precios con separador de miles mientras se escribe
document.addEventListener('input', (e) => {
  const m = e.target as HTMLInputElement;
  if (!m.matches?.('[data-money]')) return;
  const digits = m.value.replace(/[^\d]/g, '');
  m.value = digits ? Number(digits).toLocaleString('es-CL') : '';
});

// ---------- Listas repetibles ----------
let rowSeq = 1000;
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const add = target.closest<HTMLButtonElement>('[data-repeat-add]');
  if (add) {
    const rep = add.closest<HTMLElement>('[data-repeat]')!;
    // Solo el template propio, no los de listas anidadas
    const tpl = [...rep.children].find((c) => c.matches('template[data-repeat-template]')) as HTMLTemplateElement;
    const rows = [...rep.children].find((c) => c.matches('[data-repeat-rows]'))!;
    const html = tpl.innerHTML.replaceAll('__i__', String(rowSeq++));
    rows.insertAdjacentHTML('beforeend', html);
    const row = rows.lastElementChild as HTMLElement;
    $$<HTMLTextAreaElement>('[data-autosize]', row).forEach(autosize);
    $<HTMLInputElement>('input, textarea, select', row)?.focus();
    markDirty();
    return;
  }
  const remove = target.closest<HTMLButtonElement>('[data-repeat-remove]');
  if (remove) {
    const row = remove.closest<HTMLElement>('[data-repeat-row]')!;
    row.classList.add('is-leaving');
    setTimeout(() => row.remove(), 250);
    markDirty();
    return;
  }
  const up = target.closest<HTMLButtonElement>('[data-repeat-up]');
  if (up) {
    const row = up.closest<HTMLElement>('[data-repeat-row]')!;
    const prev = row.previousElementSibling;
    if (prev) {
      row.parentElement!.insertBefore(row, prev);
      markDirty();
    }
  }
});

// ---------- Fotos ----------
// Vercel acepta hasta 4,5 MB por envío: las fotos pesadas (típicas de celular)
// se reducen en el navegador antes de subirlas. El servidor después las optimiza.
const MAX_UPLOAD = 4 * 1024 * 1024;

async function prepare(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD * 0.85) return file;
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file;
  }
  const scale = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  for (const q of [0.88, 0.78, 0.68]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', q));
    if (blob && blob.size <= MAX_UPLOAD) return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  }
  return file;
}

async function upload(field: HTMLElement, original: File) {
  const drop = $('[data-drop]', field)!;
  const valueInput = $<HTMLInputElement>('[data-image-value]', field)!;
  drop.classList.add('is-uploading');
  try {
    const file = await prepare(original);
    if (file.size > MAX_UPLOAD) throw new Error('La foto es demasiado pesada. Expórtala en JPG o WebP y vuelve a intentarlo.');
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/admin/api/upload', { method: 'POST', body });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? 'No pudimos subir la foto.');
    valueInput.value = JSON.stringify({ src: json.src, sm: json.sm });
    let img = $<HTMLImageElement>('img', drop);
    if (!img) {
      img = document.createElement('img');
      img.alt = '';
      drop.prepend(img);
    }
    img.src = json.sm ?? json.src;
    drop.classList.add('has-image');
    markDirty();
    syncFocal(field);
    toast('Foto lista. Guarda para publicarla.');
  } catch (err) {
    toast((err as Error).message, 'error');
  } finally {
    drop.classList.remove('is-uploading');
  }
}

$$('[data-image]').forEach((field) => {
  const drop = $('[data-drop]', field)!;
  const file = $<HTMLInputElement>('[data-image-file]', field)!;
  const pick = () => file.click();
  drop.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-image-remove]')) return;
    pick();
  });
  drop.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick();
    }
  });
  file.addEventListener('change', () => file.files?.[0] && upload(field, file.files[0]));
  drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('is-over');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('is-over');
    const f = e.dataTransfer?.files?.[0];
    if (f) upload(field, f);
  });
  $('[data-image-remove]', field)?.addEventListener('click', (e) => {
    e.stopPropagation();
    $<HTMLInputElement>('[data-image-value]', field)!.value = '';
    $('img', drop)?.remove();
    drop.classList.remove('has-image');
    markDirty();
    syncFocal(field);
  });
});

// ---------- Punto de vuelo ----------
function syncFocal(imageField: HTMLElement) {
  const name = $<HTMLInputElement>('[data-image-value]', imageField)?.name;
  const focal = $(`[data-focal-source="${name}"]`);
  if (!focal) return;
  const raw = $<HTMLInputElement>('[data-image-value]', imageField)!.value;
  const img = $<HTMLImageElement>('[data-focal-img]', focal)!;
  const empty = $('.focal__empty', focal)!;
  const v = raw ? JSON.parse(raw) : null;
  img.hidden = !v;
  empty.hidden = !!v;
  if (v) img.src = v.sm ?? v.src;
}

$$('[data-focal]').forEach((field) => {
  const box = $('[data-focal-box]', field)!;
  const dot = $('[data-focal-dot]', field)!;
  const x = $<HTMLInputElement>('[data-focal-x]', field)!;
  const y = $<HTMLInputElement>('[data-focal-y]', field)!;
  const set = (px: number, py: number) => {
    const cx = Math.round(Math.min(100, Math.max(0, px)));
    const cy = Math.round(Math.min(100, Math.max(0, py)));
    x.value = String(cx);
    y.value = String(cy);
    dot.style.left = `${cx}%`;
    dot.style.top = `${cy}%`;
    markDirty();
  };
  let dragging = false;
  const fromEvent = (e: PointerEvent) => {
    const r = box.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
  };
  box.addEventListener('pointerdown', (e) => {
    dragging = true;
    box.setPointerCapture(e.pointerId);
    fromEvent(e);
  });
  box.addEventListener('pointermove', (e) => dragging && fromEvent(e));
  box.addEventListener('pointerup', () => (dragging = false));
  box.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 10 : 2;
    const k: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (!k[e.key]) return;
    e.preventDefault();
    set(Number(x.value) + k[e.key][0], Number(y.value) + k[e.key][1]);
  });
});

// ---------- Listas: búsqueda, filtros y orden ----------
const rowsList = $('[data-rows]');
if (rowsList) {
  const search = $<HTMLInputElement>('[data-list-search]');
  const chips = $$<HTMLButtonElement>('[data-list-chip]');
  const empty = $('[data-list-empty]');
  let group = '';

  const apply = () => {
    const q = norm(search?.value ?? '');
    let visible = 0;
    $$('[data-row]', rowsList).forEach((r) => {
      const show = (!q || r.dataset.search!.includes(q)) && (!group || r.dataset.group === group);
      r.hidden = !show;
      if (show) visible++;
    });
    $$('[data-group-label]', rowsList).forEach((g) => {
      const key = g.dataset.groupLabel!;
      g.hidden = !$$(`[data-row][data-group="${key}"]`, rowsList).some((r) => !r.hidden);
    });
    if (empty) empty.hidden = visible > 0;
    rowsList.classList.toggle('is-filtered', !!q || !!group);
  };
  search?.addEventListener('input', apply);
  chips.forEach((c) =>
    c.addEventListener('click', () => {
      group = c.dataset.listChip!;
      chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
      apply();
    }),
  );

  if (rowsList.hasAttribute('data-sortable')) {
    const collection = rowsList.dataset.collection!;
    let timer: number | undefined;
    const save = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        const ids = $$('[data-row]', rowsList).map((r) => Number(r.dataset.id));
        const res = await fetch('/admin/api/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collection, ids }),
        });
        toast(res.ok ? 'Orden guardado.' : 'No pudimos guardar el orden.', res.ok ? 'ok' : 'error');
      }, 500);
    };

    // Mover con las flechas, dentro del mismo grupo
    rowsList.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-move]');
      if (!btn) return;
      const row = btn.closest<HTMLElement>('[data-row]')!;
      const sibling = (btn.dataset.move === 'up' ? row.previousElementSibling : row.nextElementSibling) as HTMLElement | null;
      if (!sibling?.matches('[data-row]') || sibling.dataset.group !== row.dataset.group) return;
      if (btn.dataset.move === 'up') row.parentElement!.insertBefore(row, sibling);
      else row.parentElement!.insertBefore(sibling, row);
      btn.focus();
      save();
    });

    // Arrastrar y soltar
    let dragged: HTMLElement | null = null;
    rowsList.addEventListener('dragstart', (e) => {
      const row = (e.target as HTMLElement).closest<HTMLElement>('[data-row]');
      if (!row || rowsList.classList.contains('is-filtered')) return e.preventDefault();
      dragged = row;
      row.classList.add('is-dragging');
      e.dataTransfer!.effectAllowed = 'move';
    });
    rowsList.addEventListener('dragover', (e) => {
      const over = (e.target as HTMLElement).closest<HTMLElement>('[data-row]');
      if (!dragged || !over || over === dragged || over.dataset.group !== dragged.dataset.group) return;
      e.preventDefault();
      const r = over.getBoundingClientRect();
      const after = e.clientY > r.top + r.height / 2;
      over.parentElement!.insertBefore(dragged, after ? over.nextSibling : over);
    });
    rowsList.addEventListener('dragend', () => {
      if (!dragged) return;
      dragged.classList.remove('is-dragging');
      dragged = null;
      save();
    });
  }
}

// ---------- Paleta ⌘K ----------
const palette = $<HTMLDialogElement>('[data-palette]');
if (palette) {
  const input = $<HTMLInputElement>('[data-palette-input]', palette)!;
  const list = $('[data-palette-list]', palette)!;
  type Item = { t: string; s: string; href: string; icon: string };
  let items: Item[] | null = null;
  let results: Item[] = [];
  let active = 0;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

  const render = () => {
    const q = norm(input.value);
    const all = items ?? [];
    results = (q ? all.filter((i) => norm(`${i.t} ${i.s}`).includes(q)) : all.slice(0, 10)).slice(0, 40);
    active = Math.min(active, Math.max(0, results.length - 1));
    if (!items) {
      list.innerHTML = '<li class="palette__empty">Cargando…</li>';
      return;
    }
    if (!results.length) {
      list.innerHTML = `<li class="palette__empty">Nada coincide con “${esc(input.value)}”.</li>`;
      return;
    }
    const mark = (t: string) => {
      if (!q) return esc(t);
      const i = norm(t).indexOf(q);
      return i < 0 ? esc(t) : `${esc(t.slice(0, i))}<mark>${esc(t.slice(i, i + q.length))}</mark>${esc(t.slice(i + q.length))}`;
    };
    list.innerHTML = results
      .map(
        (r, i) =>
          `<li><a href="${esc(r.href)}" role="option" aria-selected="${i === active}" data-i="${i}">${icon('<circle cx="128" cy="128" r="40"/>')}<span><strong>${mark(r.t)}</strong><small>${esc(r.s)}</small></span></a></li>`,
      )
      .join('');
  };

  const open = async () => {
    admin?.classList.remove('is-menu');
    palette.showModal();
    input.value = '';
    active = 0;
    render();
    input.focus();
    if (!items) {
      items = await fetch('/admin/api/search')
        .then((r) => r.json())
        .catch(() => []);
      render();
    }
  };

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.open ? palette.close() : open();
    }
  });
  $$('[data-palette-open]').forEach((b) => b.addEventListener('click', open));
  input.addEventListener('input', () => {
    active = 0;
    render();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % Math.max(1, results.length);
      render();
      $(`[data-i="${active}"]`, list)?.scrollIntoView({ block: 'nearest' });
    }
    if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      location.href = results[active].href;
    }
  });
  palette.addEventListener('click', (e) => {
    if (e.target === palette) palette.close();
  });
}
