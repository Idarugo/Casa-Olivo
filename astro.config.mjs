// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://casaolivorestaurante.cl',
  // El contenido vive en la base de datos y se edita desde /admin
  output: 'server',
  adapter: vercel(),
  security: {
    // Formularios del panel: solo se aceptan si vienen del propio sitio
    checkOrigin: true,
    // Política de contenido: Astro calcula el hash de cada script y estilo propio,
    // así que ningún script inyectado puede ejecutarse
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self'",
        'frame-src https://app.tableo.com',
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        'upgrade-insecure-requests',
      ],
      styleDirective: {
        resources: ["'self'", 'https://fonts.googleapis.com', { resource: "'unsafe-inline'", kind: 'attribute' }],
      },
      scriptDirective: {
        resources: ["'self'"],
      },
    },
  },
  vite: {
    // PGlite solo se usa en desarrollo
    ssr: { external: ['@electric-sql/pglite'] },
    optimizeDeps: { exclude: ['@electric-sql/pglite'] },
  },
});
