import type { APIRoute } from 'astro';
import { endSession } from '../../lib/auth';
import { log } from '../../lib/audit';

export const POST: APIRoute = async ({ cookies, redirect, locals }) => {
  await log(locals.user, 'logout');
  await endSession(cookies);
  return redirect('/admin/login?salio=1');
};
