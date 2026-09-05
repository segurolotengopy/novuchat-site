# Acta de pase a producción — novuchat.site — v0.1.7 — 2026-09-05

Commit: `2758885` · Tag: `v0.1.7` (firmado, ED25519, verificado por el pipeline)
Run: [33995790054](https://github.com/segurolotengopy/novuchat-site/actions/runs/33995790054) · Modo: A
Aprobó el despliegue: Andres Alberdi (`segurolotengopy`)

## Veredicto: desplegado. El sitio deja de tener copias accesibles.

## Qué cambia, y qué NO se puede cambiar

Los dominios por defecto de Firebase —`novuchat-site.web.app` y
`novuchat-site.firebaseapp.com`— servían el sitio **entero**, igual que el
dominio propio.

**No se pueden desactivar.** Firebase Hosting siempre los publica y no existe
ajuste que lo impida. Conviene que quede escrito para que nadie vuelva a
buscarlo: lo que se hizo es que nadie se quede ahí, no apagarlos.

| Cambio | Efecto |
|---|---|
| Redirección en el `<head>` | Manda al dominio propio conservando ruta, consulta y ancla, antes de pintar nada |
| `cors` sin el dominio por defecto | Las Functions dejan de responder a llamadas desde la copia |
| `robots.txt` | No existía: `/robots.txt` devolvía la página 404 |

## Evidencia

| # | Comprobación | Resultado |
|---|---|---|
| 1 | `/robots.txt` | se sirve, con `Sitemap:` anunciado |
| 2 | **Condición de la redirección, evaluada sobre el script SERVIDO** | 7 de 7 anfitriones correctos (tabla abajo) |
| 3 | CORS desde `novuchat-site.web.app` | **sin cabecera `Access-Control-Allow-Origin`** → bloqueado |
| 4 | CORS desde `novuchat.site` | permitido |
| 5 | `pnpm enlaces` | «Ningún enlace roto» |
| 6 | Sitio · `live` | 200 · `FINALIZED` v0.1.7 |

### El riesgo real del cambio, y cómo se comprobó

Un `endsWith('.web.app')` habría redirigido también los canales de vista previa
—`novuchat-site--<canal>.web.app`—, rompiendo la prueba de humo y el DAST, que
corren justo contra ellos, y el canal `previa` del que depende el rollback.

Por eso la condición compara los dos anfitriones **exactos**. Se verificó
extrayendo el script tal como viaja al navegador en producción y evaluando su
condición, no leyendo el repositorio:

```
✓ novuchat.site                        redirige=false
✓ www.novuchat.site                    redirige=false
✓ novuchat-site.web.app                redirige=true    ← dominio por defecto
✓ novuchat-site.firebaseapp.com        redirige=true    ← dominio por defecto
✓ novuchat-site--pr-17-abc123.web.app  redirige=false   ← canal de PR
✓ novuchat-site--previa.web.app        redirige=false   ← canal de rollback
✓ localhost                            redirige=false
```

### Dos decisiones que conviene no reabrir

**El `robots.txt` no lleva `Disallow` para el duplicado.** Ese archivo se sirve
igual desde los tres anfitriones, así que bloquear la copia bloquearía también
el sitio bueno. De los duplicados se ocupan el `canonical` —que ya apuntaba
correctamente a `novuchat.site` desde el dominio por defecto, verificado en el
HTML servido— y la redirección.

**La consola no necesitó nada.** Sus tres dominios por defecto
(`novuchat-admin-prod.web.app`, `.firebaseapp.com`, `consola-novuchat.web.app`)
ya devolvían 404.

## Lo que no se verificó

El salto en vivo abriendo `novuchat-site.web.app` en un navegador: el navegador
de la sesión no permitió cargar ese dominio. Se comprobó la lógica del script
servido, que es determinista, pero **no el salto con los propios ojos**.

## Riesgos aceptados, vigentes

| Asunto | Estado |
|---|---|
| **App Check en monitoreo** | `enforceAppCheck: false`. Datos ya disponibles: `gcloud logging read 'jsonPayload.message="App Check"'` |
| **Cuenta de cómputo con `roles/editor`** | Ya no la usa nada del sitio |
| **Identidad legal provisional** | AAB1 / NIT 2441214012 |
| CVE-2026-41907 (`uuid`, MEDIA) | Vence 2026-12-01 |
| TypeScript 6 | `@astrojs/check` no lo admite de verdad |
| Lead de prueba en producción | «Salón Aurora», borrable |

## Estado del sitio

Sin PR abiertas · sin enlaces rotos · correo de leads llegando a la bandeja ·
consola enlazada y accesible · Lighthouse 100 en las cuatro categorías en móvil ·
rollback disponible · sin errores en las Functions.
