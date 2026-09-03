import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Vitest cubre las pruebas de unidad y las de reglas de Firestore.
 * Las de humo son de Playwright y viven en `pruebas/humo`: si Vitest las
 * recogiera, fallaría al importar el `test` de Playwright.
 */
export default defineConfig({
  plugins: [
    {
      /**
       * `functions/` compila con `moduleResolution: NodeNext`, que obliga a
       * escribir las importaciones con extensión `.js` aunque el archivo sea
       * `.ts`. Vite no hace esa correspondencia por su cuenta, así que se
       * resuelve aquí en vez de degradar la configuración del backend, que es
       * la correcta para Node.
       */
      name: 'resolver-js-a-ts-en-functions',
      enforce: 'pre',
      resolveId(fuente, importador) {
        if (
          !importador?.includes('/functions/src/') ||
          !fuente.startsWith('.') ||
          !fuente.endsWith('.js')
        ) {
          return null;
        }
        const candidato = resolve(dirname(importador), fuente.replace(/\.js$/, '.ts'));
        return existsSync(candidato) ? candidato : null;
      },
    },
  ],
  test: {
    include: ['pruebas/**/*.{test,spec}.ts'],
    // Aquí solo se excluye lo que Vitest NUNCA debe tocar. Las suites que
    // necesitan un emulador levantado se excluyen en el script `pruebas` de
    // package.json, no aquí: si se excluyeran en la configuración, sus propios
    // comandos (`test:rules`, `test:backend`) no encontrarían nada que correr.
    exclude: ['pruebas/humo/**', 'node_modules/**', 'dist/**'],
    environment: 'node',
  },
});
