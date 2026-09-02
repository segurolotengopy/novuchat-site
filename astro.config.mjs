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
      // CRÍTICO: con el valor por defecto, Astro incrusta los scripts pequeños
      // dentro del HTML, y la CSP los bloquea sin dejar rastro visible (el
      // conmutador de tema y el banner de consentimiento dejan de funcionar).
      // En 0, todo script sale a un archivo servido desde el propio origen y
      // queda cubierto por `script-src 'self'`. Ver docs/csp.md.
      assetsInlineLimit: 0,
    },
  },
});
