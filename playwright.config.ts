import { defineConfig, devices } from '@playwright/test';

/**
 * Las pruebas de humo corren contra `dist/` servido con **las cabeceras reales
 * de `firebase.json`** (`scripts/probar-csp.mjs`), no contra `astro dev`. Es la
 * única forma de que una violación de la CSP aparezca en una prueba en vez de
 * en producción.
 */
export default defineConfig({
  testDir: './pruebas/humo',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5245',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'movil', use: { ...devices['Pixel 7'] } },
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'node scripts/probar-csp.mjs',
    url: 'http://127.0.0.1:5245',
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },
});
