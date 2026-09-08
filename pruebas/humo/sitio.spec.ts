import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Humo del sitio estático.
 *
 * Lo que de verdad cubre esta suite, y por qué existe cada bloque:
 *
 *  1. **Violaciones de la CSP.** Son el fallo más traicionero del proyecto: el
 *     navegador bloquea el recurso y no pasa nada visible. Ya ocurrió una vez
 *     (Astro incrustaba los scripts en el HTML y la política los rechazaba, con
 *     el conmutador de tema y el banner de consentimiento muertos en silencio).
 *     Cada página se carga y cualquier mensaje «Refused to…» rompe la prueba.
 *  2. **Accesibilidad con axe**, en tema claro y oscuro.
 *  3. **Nada de medición sin consentimiento**: ni Google ni Meta pueden
 *     descargarse hasta que la persona acepta.
 *  4. **El rótulo del QR de demostración** existe donde se muestra el QR.
 */

const RUTAS = [
  '/',
  '/como-funciona',
  '/soluciones/salud-belleza',
  '/soluciones/gastronomia',
  '/soluciones/comercio',
  '/consola',
  '/precios',
  '/demo',
  '/nosotros',
  '/preguntas-frecuentes',
  '/contacto',
  '/privacidad',
  '/terminos',
  '/en',
  '/en/precios',
  '/en/consola',
  '/en/contacto',
  '/en/privacidad',
];

/** Recoge los errores de consola y las peticiones fallidas de una página. */
function vigilar(page: Page): { errores: string[]; externas: string[] } {
  const errores: string[] = [];
  const externas: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errores.push(msg.text());
  });
  page.on('pageerror', (err) => errores.push(String(err)));
  page.on('request', (req) => {
    const host = new URL(req.url()).host;
    if (host !== '127.0.0.1:5245') externas.push(req.url());
  });

  return { errores, externas };
}

for (const ruta of RUTAS) {
  test(`${ruta} carga sin violar la CSP`, async ({ page }) => {
    const { errores } = vigilar(page);
    const respuesta = await page.goto(ruta);

    expect(respuesta?.status(), `${ruta} debe responder 200`).toBe(200);

    const violaciones = errores.filter((e) => /Refused to|Content Security Policy/i.test(e));
    expect(violaciones, `${ruta} viola la CSP`).toEqual([]);
    expect(errores, `${ruta} tiene errores de consola`).toEqual([]);

    // Toda página debe tener un h1, y solo uno.
    await expect(page.locator('h1')).toHaveCount(1);
  });
}

test('sin consentimiento no se carga nada de Google ni de Meta', async ({ page }) => {
  const { externas } = vigilar(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(
    externas.filter((u) => /googletagmanager|google-analytics|facebook/.test(u)),
    'no debe descargarse medición antes de aceptar',
  ).toEqual([]);

  await expect(page.locator('[data-consentimiento]')).toBeVisible();
});

test('al aceptar el consentimiento se pide la medición', async ({ page }) => {
  const { externas } = vigilar(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await page.waitForTimeout(1500);

  expect(
    externas.some((u) => /googletagmanager|connect\.facebook\.net/.test(u)),
    'tras aceptar debe cargarse al menos una de las dos etiquetas',
  ).toBe(true);
});

test('el banner de consentimiento SE VA al elegir, y no vuelve', async ({ page }) => {
  // Esta prueba faltaba, y su ausencia dejó un fallo en producción: las otras
  // dos comprueban qué se carga tras decidir, no que el banner desaparezca.
  // `.consentimiento { display: flex }` anulaba el `[hidden]` del navegador
  // —cualquier `display` de autor le gana—, así que el clic guardaba la
  // decisión y el banner se quedaba ahí. Parecía que los botones no hacían
  // nada, y reaparecía en cada página.
  await page.goto('/');
  const banner = page.locator('[data-consentimiento]');
  await expect(banner).toBeVisible();

  await page.getByRole('button', { name: 'Solo lo necesario' }).click();
  await expect(banner).toBeHidden();

  // Y al volver a entrar tampoco reaparece: la decisión ya está tomada.
  await page.goto('/precios');
  await expect(page.locator('[data-consentimiento]')).toBeHidden();
});

test('el conmutador de tema cambia y persiste', async ({ page }) => {
  await page.goto('/');
  const raiz = page.locator('html');

  await page.getByRole('button', { name: /tema claro y oscuro/i }).click();
  await expect(raiz).toHaveAttribute('data-tema', 'oscuro');

  await page.reload();
  await expect(raiz).toHaveAttribute('data-tema', 'oscuro');
});

test('el QR de demostración lleva su rótulo, y no se esconde', async ({ page }) => {
  await page.goto('/soluciones/gastronomia');
  const rotulo = page.getByText(/DEMOSTRACIÓN — este QR no cobra/i);
  await expect(rotulo).toBeVisible();
  await expect(rotulo).toHaveCSS('opacity', '1');
});

test('el conmutador de rubro cambia de rubro y marca el actual', async ({ page }) => {
  await page.goto('/soluciones/gastronomia');

  const conmutador = page.getByRole('navigation', { name: 'Elegir rubro' });
  await expect(conmutador.getByRole('link')).toHaveCount(3);
  await expect(conmutador.getByRole('link', { name: 'Gastronomía' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await conmutador.getByRole('link', { name: 'Salud y Belleza' }).click();
  await expect(page).toHaveURL(/\/soluciones\/salud-belleza$/);
  await expect(page.locator('h1')).toContainText('salones y consultorios');
  await expect(conmutador.getByRole('link', { name: 'Salud y Belleza' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('las cuatro diapositivas del carrusel cargan su imagen y la cuarta es Consultorios', async ({
  page,
}) => {
  await page.goto('/');
  const carrusel = page.locator('[data-carrusel]');
  await carrusel.scrollIntoViewIfNeeded();

  // Los cuatro rubros, con Consultorios incluido: faltaba, y es de los que más
  // se reconocen.
  await expect(carrusel.locator('[data-carrusel-diapositiva] .tag')).toHaveText([
    'Salud y Belleza',
    'Gastronomía',
    'Comercio y Retail',
    'Consultorios',
  ]);

  // Y que la imagen esté DE VERDAD, no solo la etiqueta <img>. El disparador
  // nativo de `loading="lazy"` no se cumple de forma fiable cuando la imagen
  // entra en pantalla por un desplazamiento horizontal dentro de un
  // contenedor: comprobado en Chromium, las diapositivas 3 y 4 se quedaban en
  // blanco con la imagen totalmente visible. Media diapositiva vacía se ve
  // perfecta en el DOM y pésima en una demostración.
  for (const destino of [1, 2, 3]) {
    await carrusel.locator(`[data-carrusel-ir="${destino}"]`).click();
    await expect
      .poll(() =>
        carrusel
          .locator('[data-carrusel-diapositiva] img')
          .nth(destino)
          .evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
      )
      .toBe(true);
  }
});

test('el carrusel de ejemplos avanza, retrocede y da la vuelta', async ({ page }) => {
  await page.goto('/');
  const carrusel = page.locator('[data-carrusel]');
  const pista = carrusel.locator('[data-carrusel-pista]');
  const puntos = carrusel.locator('[data-carrusel-ir]');

  await expect(puntos).toHaveCount(4);
  await carrusel.scrollIntoViewIfNeeded();

  const posicion = () => pista.evaluate((el) => Math.round(el.scrollLeft));
  const activo = () =>
    puntos.evaluateAll((els) => els.findIndex((e) => e.getAttribute('aria-current') === 'true'));

  expect(await posicion()).toBe(0);

  await carrusel.locator('[data-carrusel-siguiente]').click();
  await expect.poll(posicion).toBeGreaterThan(0);
  await expect.poll(activo).toBe(1);

  // Ir directo a la última con su punto, y comprobar que la vuelta funciona.
  await carrusel.locator('[data-carrusel-ir="3"]').click();
  await expect.poll(activo).toBe(3);

  await carrusel.locator('[data-carrusel-siguiente]').click();
  await expect.poll(posicion).toBe(0);
  // `poll` y no una lectura suelta: el punto se reconcilia cuando el
  // desplazamiento se detiene, no en el instante del clic.
  await expect.poll(activo).toBe(0);
});

test('el carrusel se puede recorrer con el teclado', async ({ page }) => {
  await page.goto('/');
  const carrusel = page.locator('[data-carrusel]');
  await carrusel.scrollIntoViewIfNeeded();

  // La pista es enfocable, así que el teclado puede desplazarla.
  await carrusel.locator('[data-carrusel-pista]').focus();
  await expect(carrusel.locator('[data-carrusel-pista]')).toBeFocused();

  // Y las flechas son botones reales, alcanzables con Tab.
  await carrusel.locator('[data-carrusel-siguiente]').focus();
  await page.keyboard.press('Enter');
  await expect
    .poll(() => carrusel.locator('[data-carrusel-pista]').evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
});

for (const ruta of ['/', '/precios', '/demo', '/preguntas-frecuentes']) {
  for (const tema of ['claro', 'oscuro'] as const) {
    test(`axe sin fallos críticos en ${ruta} (tema ${tema})`, async ({ page }) => {
      await page.goto('/');
      await page.evaluate((t) => localStorage.setItem('novuchat.tema', t), tema);
      await page.goto(ruta);

      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const graves = violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );
      expect(
        graves.map((v) => `${v.id}: ${v.nodes[0]?.target.join(' ')}`),
        `axe encontró fallos graves en ${ruta} (${tema})`,
      ).toEqual([]);
    });
  }
}

test('el asistente flota y su logo tiene tamaño real', async ({ page }) => {
  // El logo estuvo en producción con `width: 0px`: el SVG cargaba, el elemento
  // existía y no se veía nada. Lo causaba `min-width: 0` en el contenedor —el
  // reinicio global tiene `img { max-width: 100% }`, y ese 100 % pasó a valer
  // cero—. Una revisión visual en pantalla ancha no lo detecta; una aserción de
  // tamaño sí.
  await page.goto('/');
  // Primero se resuelve el consentimiento, como haría una persona: en móvil el
  // banner ocupa el bajo de la pantalla y tapaba el botón del asistente, que
  // quedaba inalcanzable. Ese solape lo cubre la prueba siguiente.
  await page.getByRole('button', { name: 'Solo lo necesario' }).click();

  const boton = page.getByRole('button', { name: 'Abrir el asistente virtual' });
  await expect(boton).toBeVisible();
  expect(await boton.evaluate((e) => getComputedStyle(e).position)).toBe('fixed');

  await boton.click();
  const panel = page.locator('.asistente');
  await expect(panel).toBeVisible();
  expect(await panel.evaluate((e) => getComputedStyle(e).position)).toBe('fixed');

  const logo = panel.locator('.asistente-marca img');
  await expect(logo).toBeVisible();
  const caja = await logo.boundingBox();
  expect(caja?.width ?? 0, 'el logo del asistente no puede tener ancho cero').toBeGreaterThan(10);
  expect(caja?.height ?? 0).toBeGreaterThan(10);
});

test('el banner de consentimiento no deja inalcanzable al asistente', async ({ page }) => {
  // En móvil los dos son `position: fixed` en el bajo de la pantalla, y el
  // banner va por encima (z-index 70 contra 50). Sin esto, quien entra desde un
  // teléfono no puede abrir el chat hasta aceptar o rechazar la medición.
  await page.goto('/');
  const banner = page.locator('[data-consentimiento]');
  await expect(banner).toBeVisible();

  // Por CSS y no por rol: `getByRole` ignora lo que está en `display: none`, y
  // ese es justamente el estado correcto en móvil mientras el banner está a la
  // vista. Aquí interesa el elemento exista o no se vea.
  const boton = page.locator('.asistente-boton');
  const caja = (await boton.isVisible()) ? await boton.boundingBox() : null;

  if (caja) {
    // Si el botón se muestra, tiene que ser accionable: nadie lo tapa.
    const cubierto = await page.evaluate(({ x, y }) => {
      const arriba = document.elementFromPoint(x, y);
      return !!arriba?.closest('[data-consentimiento]');
    }, { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 });
    expect(cubierto, 'el banner tapa el botón del asistente').toBe(false);
  }
  // Si no se muestra (el caso de móvil), aparece al resolver el consentimiento.
  await page.getByRole('button', { name: 'Solo lo necesario' }).click();
  await expect(boton).toBeVisible();
  const despues = await boton.boundingBox();
  expect(despues?.width ?? 0, 'el botón debe ser accionable tras decidir').toBeGreaterThan(0);
});
