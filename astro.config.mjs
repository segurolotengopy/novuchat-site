// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// El sitio es estático: 95 % contenido, con islas de Preact solo donde hace
// falta estado (asistente, formulario, selector de tema e idioma).
// i18n por rutas: español sin prefijo, inglés bajo /en/ (doc 03 §8).
export default defineConfig({
  site: 'https://novuchat.site',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [preact(), sitemap()],
  vite: {
    build: {
      // Presupuesto del doc 03 §10: HTML+CSS+JS inicial <= 300 KB.
      chunkSizeWarningLimit: 300,
    },
  },
});
