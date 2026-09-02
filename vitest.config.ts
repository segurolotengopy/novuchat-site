import { defineConfig } from 'vitest/config';

/**
 * Vitest cubre las pruebas de unidad y las de reglas de Firestore.
 * Las de humo son de Playwright y viven en `pruebas/humo`: si Vitest las
 * recogiera, fallaría al importar el `test` de Playwright.
 */
export default defineConfig({
  test: {
    include: ['pruebas/**/*.{test,spec}.ts'],
    exclude: ['pruebas/humo/**', 'node_modules/**', 'dist/**'],
    environment: 'node',
  },
});
