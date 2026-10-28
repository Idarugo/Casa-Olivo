// Historial: cada cambio del panel queda registrado con su versión anterior y posterior.
import { query } from './db';
import type { User } from './auth';

export type Action =
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'purge'
  | 'reorder'
  | 'settings'
  | 'login'
  | 'logout'
  | 'user_create'
  | 'user_delete'
  | 'user_role'
  | 'password'
  | 'backup_import';

export type AuditRow = {
  id: number;
  at: string;
  user_id: number | null;
  user_name: string | null;
  action: Action;
  collection: string | null;
  entry_id: number | null;
  title: string | null;
  before: any;
  after: any;
};

export async function log(
  user: Pick<User, 'id' | 'name'> | undefined,
  action: Action,
  info: { collection?: string; entryId?: number; title?: string; before?: unknown; after?: unknown } = {},
) {
  try {
    await query(
      'insert into audit (user_id, user_name, action, collection, entry_id, title, before, after) values ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        user?.id ?? null,
        user?.name ?? null,
        action,
        info.collection ?? null,
        info.entryId ?? null,
        info.title ?? null,
        info.before === undefined ? null : JSON.stringify(info.before),
        info.after === undefined ? null : JSON.stringify(info.after),
      ],
    );
  } catch (e) {
    // El historial nunca debe impedir guardar
    console.error('No se pudo registrar en el historial', e);
  }
}

export const actionLabels: Record<Action, string> = {
  create: 'creó',
  update: 'editó',
  delete: 'envió a la papelera',
  restore: 'restauró',
  purge: 'eliminó definitivamente',
  reorder: 'reordenó',
  settings: 'editó',
  login: 'ingresó al panel',
  logout: 'cerró sesión',
  user_create: 'invitó a',
  user_delete: 'quitó el acceso de',
  user_role: 'cambió el rol de',
  password: 'cambió su contraseña',
  backup_import: 'restauró un respaldo',
};

/** Campos que cambiaron entre dos versiones, para mostrar en el historial. */
export function diff(before: any, after: any) {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  const out: { field: string; before: unknown; after: unknown }[] = [];
  for (const k of keys) {
    const a = before?.[k];
    const b = after?.[k];
    if (JSON.stringify(a ?? null) !== JSON.stringify(b ?? null)) out.push({ field: k, before: a, after: b });
  }
  return out;
}
