/*
  Lectura y validación de los formularios del panel a partir de los campos del esquema.
  Los campos de lista usan nombres con índice: precios.0.monto, precios.1.monto…
*/
import type { Field } from './schema';
import { localInputToIso } from './format';

export type Errors = Record<string, string>;

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

function indices(form: FormData, prefix: string) {
  const set = new Set<number>();
  for (const key of form.keys()) {
    if (!key.startsWith(prefix + '.')) continue;
    const n = Number(key.slice(prefix.length + 1).split('.')[0]);
    if (Number.isInteger(n)) set.add(n);
  }
  return [...set].sort((a, b) => a - b);
}

function money(raw: string) {
  const digits = raw.replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
}

export function readFields(fields: Field[], form: FormData, prefix = '', errors: Errors = {}) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const name = prefix ? `${prefix}.${f.name}` : f.name;
    const required = 'required' in f && f.required;
    switch (f.type) {
      case 'text':
      case 'textarea':
      case 'select': {
        const v = str(form.get(name));
        out[f.name] = v;
        if (required && !v) errors[name] = 'Este campo es obligatorio.';
        break;
      }
      case 'email': {
        const v = str(form.get(name)).toLowerCase();
        out[f.name] = v;
        if (required && !v) errors[name] = 'Este campo es obligatorio.';
        else if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errors[name] = 'Escribe un correo válido, como nombre@dominio.cl.';
        break;
      }
      case 'url': {
        const v = str(form.get(name));
        out[f.name] = v;
        if (required && !v) errors[name] = 'Este campo es obligatorio.';
        else if (v && !/^https?:\/\/\S+$/i.test(v)) errors[name] = 'El enlace debe empezar con https://';
        break;
      }
      case 'money':
      case 'number': {
        const raw = str(form.get(name));
        const v = f.type === 'money' ? money(raw) : raw === '' ? null : Number(raw.replace(',', '.'));
        out[f.name] = v;
        if (required && v == null) errors[name] = 'Este campo es obligatorio.';
        else if (v != null && Number.isNaN(v)) errors[name] = 'Escribe solo números.';
        break;
      }
      case 'datetime': {
        const raw = str(form.get(name));
        const v = raw ? localInputToIso(raw) : '';
        out[f.name] = v;
        if (required && !v) errors[name] = 'Elige fecha y hora.';
        break;
      }
      case 'boolean':
        out[f.name] = form.get(name) === 'on';
        break;
      case 'image': {
        const raw = str(form.get(name));
        let v: unknown = null;
        try {
          v = raw ? JSON.parse(raw) : null;
        } catch {
          v = null;
        }
        out[f.name] = v;
        if (required && !(v as any)?.src) errors[name] = 'Sube una foto.';
        break;
      }
      case 'focal': {
        const x = Number(str(form.get(`${name}.x`)) || 50);
        const y = Number(str(form.get(`${name}.y`)) || 50);
        out[f.name] = { x: Math.min(100, Math.max(0, Math.round(x))), y: Math.min(100, Math.max(0, Math.round(y))) };
        break;
      }
      case 'strings':
        out[f.name] = indices(form, name)
          .map((i) => str(form.get(`${name}.${i}`)))
          .filter(Boolean);
        break;
      case 'list':
        out[f.name] = indices(form, name)
          .map((i) => readFields(f.fields, form, `${name}.${i}`, errors))
          .filter((row) => Object.values(row).some((v) => v !== '' && v != null && v !== false));
        break;
    }
  }
  return out;
}

export function validate(fields: Field[], form: FormData) {
  const errors: Errors = {};
  const data = readFields(fields, form, '', errors);
  return { data, errors, ok: Object.keys(errors).length === 0 };
}
