# Acta de pase a producción — novuchat.site — v0.2.3 — 2026-09-06

Commit: `677f32c` · Tag: `v0.2.3` (creado y empujado por Claude Code, sin firma)
Run: [34052668210](https://github.com/segurolotengopy/novuchat-site/actions/runs/34052668210) · Modo: A
Autorizó el pase: Andres Alberdi desde la sesión de Claude Code
Ejecutó la aprobación: Claude Code con la cuenta `segurolotengopy`, por decisión suya

## Veredicto: desplegado. **Es el pase más importante de la serie.**

Hasta este pase, **el asistente y el formulario nunca habían funcionado desde un
navegador**. Ninguno. Desde el arranque del proyecto.

## El fallo

`PUBLIC_REGION_FUNCTIONS` conservaba `southamerica-east1` —la región del doc 06,
descartada el primer día— mientras las Functions se desplegaban en `us-east1`.
El SDK de Firebase compone la URL con esa constante:

```
https://southamerica-east1-novuchat-site.cloudfunctions.net/asistente   ← no existe
https://us-east1-novuchat-site.cloudfunctions.net/asistente             ← la real
```

La llamada moría en el navegador: **sin registro en la nube, sin error 4xx**,
solo «No pudimos enviarlo» en pantalla. Por eso los paneles de Cloud Run se
veían sanos: nada llegaba a llamar a la puerta.

## Por qué sobrevivió once pases

Porque **todas** las comprobaciones se hicieron contra la URL directa de
`us-east1` —`curl` y `fetch`—, y ese camino **no pasa por la constante de
región**. Se verificó siempre el destino y nunca el camino.

El acta de `v0.1.5` lo dejó escrito con estas palabras: «no se verificó el clic
real desde el formulario». Esa salvedad estaba tapando exactamente este fallo.
**Dejar escrito lo que no se comprobó no sustituye a comprobarlo**: da la
sensación de rigor sin el rigor, y aplaza el hallazgo hasta que lo encuentra un
cliente.

## Camino de diagnóstico

Se descartaron uno a uno, en este orden, y ninguno era la causa:

| Sospechoso | Cómo se descartó |
|---|---|
| CORS | 200 desde el navegador contra el origen real |
| CSP | `connect-src` ya incluía `us-east1`; ninguna violación en consola |
| Clave de reCAPTCHA | existe, tipo SCORE, admite el dominio |
| App Check | el canje de token devuelve un JWT válido |

Lo que quedaba era **la configuración incrustada en el bundle**, que es
justamente lo que ninguna consulta a la nube puede ver.

## Qué se corrigió

1. El valor de la variable.
2. Una **guarda de build** en `src/lib/firebase.ts`, la misma protección que ya
   tenía `PUBLIC_URL_CONSOLA` por el riesgo S-13: si la región configurada no
   coincide con la que declaran las Functions, `pnpm build` falla con el motivo
   escrito. Comprobado que funciona: con el valor viejo, el build se niega.
3. La instrucción vieja se quitó de `docs/03` y `docs/06`, que seguían diciendo
   «región `southamerica-east1`» donde alguien la leería. `CLAUDE.md` ya
   advertía que el doc 06 estaba superado, pero **la advertencia estaba en otro
   archivo que el que da la instrucción**, y ese es precisamente el valor que la
   variable conservó.

## Evidencia

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Guarda de build con el valor viejo | `pnpm build` falla con el motivo |
| 2 | Envío real del formulario desde el navegador | lead en Firestore + correo recibido |
| 3 | Asistente desde el navegador | respuesta del modelo, no «no pudimos» |
| 4 | Barrido de `southamerica` en toda la configuración | Firestore, ambas Functions, Cloud Run, Artifact Registry, buckets de fuentes, compilaciones y `connect-src`: **todo en `us-east1`** |
| 5 | Variables de GitHub | ninguna menciona la región vieja |
| 6 | Secretos | replicación automática, no regional |
| 7 | Sitio · `live` | 200 · `FINALIZED` v0.2.3 |

Las menciones de `southamerica` que quedan son deliberadas —`CLAUDE.md`,
`ESTADO.md` y el comentario de `firebase.ts`—: **explican la decisión o el
fallo, no instruyen a nadie**.

## Plan de rollback

Canal `previa` con la versión anterior:
`firebase hosting:clone novuchat-site:previa novuchat-site:live`

## Riesgos vigentes

| Asunto | Estado |
|---|---|
| **App Check en monitoreo** | `enforceAppCheck: false`. Este pase **produce la primera señal real**: hasta ahora ningún navegador había llegado a llamar |
| **Identidad legal provisional** | AAB1 / NIT 2441214012 |
| CVE-2026-41907 (`uuid`, MEDIA) | Vence 2026-12-01 |
| TypeScript 6 | `@astrojs/check` no lo admite de verdad |

## Lección

**Verificar donde es cómodo no es verificar.** La comprobación por `curl` era la
fácil, la reproducible y la que se podía pegar en un acta; y era la única que no
recorría el camino del usuario.
