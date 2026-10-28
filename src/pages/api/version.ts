import type { APIRoute } from 'astro';
import { contentVersion } from '../../lib/content';

// Lo consultan las páginas abiertas para saber si el panel guardó algo nuevo
export const GET: APIRoute = async () =>
  Response.json({ v: await contentVersion() }, { headers: { 'Cache-Control': 'no-store' } });
