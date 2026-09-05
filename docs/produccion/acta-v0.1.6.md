# Acta de pase a producción — novuchat.site — v0.1.6 — 2026-09-05

Commit: `37a83ac` · Tag: `v0.1.6` (firmado, ED25519, verificado por el pipeline)
Run: [33985540411](https://github.com/segurolotengopy/novuchat-site/actions/runs/33985540411) · Modo: A
Aprobó el despliegue: Andres Alberdi (`segurolotengopy`)

## Veredicto: el sitio queda sin ningún enlace roto.

Primera vez desde que salió a producción.

## Qué cambia

`PUBLIC_URL_CONSOLA` pasa de `novuchat-admin-prod.web.app` —que devolvía 404— a
`https://consola.novuchat.site`, y se retira la entrada muerta de la lista
blanca.

## Evidencia

| # | Comprobación | Resultado |
|---|---|---|
| 1 | **`pnpm enlaces`** | **«Ningún enlace roto»** — 18 páginas, 17 internos, 4 externos |
| 2 | Destino del botón en el HTML servido | `href="https://consola.novuchat.site"` en cabecera y pie |
| 3 | Ese destino | 200, y es la pantalla real: «Panel administrativo» |
| 4 | Cabeceras de la consola | CSP `default-src 'none'`, HSTS `preload`, `X-Frame-Options: DENY`, `nosniff` |
| 5 | Functions | `asistente` y `lead` `ACTIVE`, sin errores en 30 min |
| 6 | Sitio · `live` · `previa` | 200 · `FINALIZED` v0.1.6 · rollback disponible |

El punto 3 importa: que una URL responda 200 no significa que lleve a donde debe.
El punto 4 también, porque el sitio manda a sus clientes ahí a escribir una
contraseña, y conviene saber que el destino no es más flojo que el origen.

## La lección, que ya está en ESTADO.md

**Validar que una URL esté PERMITIDA no es validar que exista.** La lista blanca
de `PUBLIC_URL_CONSOLA` cumplía su papel —evitar que el sitio mande a sus
clientes a un dominio ajeno, riesgo S-13— y aun así el botón «Ingresar» llevó a
un 404 durante días: el valor estaba permitido y muerto.

La comprobación de existencia solo se puede hacer contra el sitio publicado, y
por eso vive en `pnpm enlaces` y no en el build. Fue quien lo destapó.

## Riesgos aceptados, vigentes

| Asunto | Estado |
|---|---|
| **App Check en monitoreo** | `enforceAppCheck: false`. Ya se registran los datos para decidir: `gcloud logging read 'jsonPayload.message="App Check"'` |
| **Cuenta de cómputo con `roles/editor`** | Ya no la usa nada del sitio. Retirarlo tras comprobar que no la use otro servicio |
| **Identidad legal provisional** | AAB1 / NIT 2441214012 hasta el NIT propio |
| CVE-2026-41907 (`uuid`, MEDIA) | Excepción registrada, vence 2026-12-01 |
| TypeScript 6 | Excepción en `dependabot.yml`; `@astrojs/check` no lo admite de verdad |
| Lead de prueba en producción | «Salón Aurora», borrable |

## Estado del sitio a cuatro días de los demos

Verificado contra la nube, no contra el pipeline:

- Sitio, asistente contra Vertex real y formulario con aviso por correo que
  **llega a la bandeja**.
- Consola enlazada y accesible.
- Lighthouse **100 en las cuatro categorías**, en móvil, en `/`, `/precios` y
  `/demo`. Sin desborde horizontal a 375 px, en claro y en oscuro.
- Rollback disponible.
- Ningún enlace roto.
