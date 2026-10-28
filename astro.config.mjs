// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://casaolivorestaurante.cl',
  // El contenido vive en la base de datos y se edita desde /admin
  output: 'server',
  adapter: vercel(),
  vite: {
    // PGlite solo se usa en desarrollo
    ssr: { external: ['@electric-sql/pglite'] },
    optimizeDeps: { exclude: ['@electric-sql/pglite'] },
  },
});
