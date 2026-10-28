/*
  Fotos subidas desde el panel. Se convierten a WebP en dos tamaños
  (1600 px y 900 px) para que carguen rápido en cualquier pantalla.
  Producción: Vercel Blob. Desarrollo: carpeta .data/uploads, servida por /uploads.
*/
import sharp from 'sharp';
import { getSecret } from 'astro:env/server';
import { randomBytes } from 'node:crypto';
import type { Image } from './schema';

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif'];

export class UploadError extends Error {}

async function store(path: string, data: Buffer): Promise<string> {
  const token = getSecret('BLOB_READ_WRITE_TOKEN');
  if (token) {
    const { put } = await import('@vercel/blob');
    const blob = await put(path, data, { access: 'public', contentType: 'image/webp', token, addRandomSuffix: false });
    return blob.url;
  }
  if (!import.meta.env.DEV) throw new UploadError('El almacenamiento de fotos no está conectado. Crea un Blob store en Vercel.');
  const { mkdir, writeFile } = await import('node:fs/promises');
  const { dirname, join } = await import('node:path');
  const file = join(process.cwd(), '.data', path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, data);
  return '/' + path;
}

export async function saveImage(file: File): Promise<Image & { width: number; height: number }> {
  if (!TYPES.includes(file.type)) throw new UploadError('Formato no soportado. Sube una foto JPG, PNG, WebP o AVIF.');
  if (file.size > MAX_BYTES) throw new UploadError('La foto pesa más de 8 MB. Expórtala en un tamaño menor.');

  const input = Buffer.from(await file.arrayBuffer());
  let base: sharp.Sharp;
  try {
    // Límite de píxeles: una imagen «bomba» que se infla al abrirla se rechaza
    base = sharp(input, { failOn: 'error', limitInputPixels: 60_000_000 }).rotate();
    await base.metadata();
  } catch {
    throw new UploadError('No pudimos leer la foto. Prueba con otro archivo.');
  }

  const id = `${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`;
  const big = await base.clone().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const small = await base.clone().resize({ width: 900, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();

  const [src, sm] = await Promise.all([store(`uploads/${id}.webp`, big.data), store(`uploads/${id}-sm.webp`, small)]);
  return { src, sm, width: big.info.width, height: big.info.height };
}
