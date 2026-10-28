import type { APIRoute } from 'astro';
import { endSession } from '../../lib/auth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  await endSession(cookies);
  return redirect('/admin/login?salio=1');
};
