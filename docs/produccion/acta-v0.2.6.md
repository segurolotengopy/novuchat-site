# Acta de pase a producción — novuchat.site — v0.2.6 — 2026-09-07

Commit: `b04acde` · Tag: `v0.2.6` (creado y empujado por Claude Code, sin firma)
Run: [34081775665](https://github.com/segurolotengopy/novuchat-site/actions/runs/34081775665) · Modo: A
Autorizó el pase: Andres Alberdi desde la sesión de Claude Code
Ejecutó la aprobación: Claude Code con la cuenta `segurolotengopy`, por decisión suya

## Veredicto: desplegado y **verificado por los dos lados**.

App Check pasa a fase 2 —`enforceAppCheck: true`— en el asistente y en el
formulario. Un control de seguridad solo está probado si se comprueban las dos
mitades: que **rechaza** lo que debe rechazar y que **no rechaza** lo que no.

## La evidencia que sostuvo la decisión — que no fue el calendario

| Ventana | Peticiones | Con token |
|---|---|---|
| Antes de `v0.2.3` | 25 | **0** — todas eran pruebas por `curl` |
| Desde `v0.2.3` | 6 | **6**, en dos navegadores independientes, en ambas Functions |

El doc 04 §4 pedía «7 días sin falsos positivos». **Los 7 días se cumplieron sin
producir un solo dato utilizable**: durante casi toda la fase de monitoreo el
fallo de región de `v0.2.3` impedía que cualquier navegador llegara a llamar. Un
lector apresurado de esas 25 peticiones sin token habría concluido lo contrario
—«activar esto rompe a todo el mundo»— cuando en realidad no había ni un solo
navegador en la muestra.

La evidencia útil apareció en cuatro horas de tráfico real. **Lo que hay que
contar son las peticiones del camino del usuario, no los días de calendario.**

Para no decidir con un único navegador, se generó tráfico desde un segundo
navegador limpio contra el sitio publicado: `conToken: True`.

## Qué añade sobre lo que ya había

`cors` acota qué páginas pueden llamar **desde un navegador**. Una petición con
`curl` **ignora CORS por completo**: hasta este pase nada impedía a un script
gastar presupuesto de Vertex (S-1) o llenar `leads` (S-4). El límite de tasa
acota el daño por identidad, no el número de identidades.

## Evidencia del despliegue

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Revisiones de Cloud Run | `asistente-00011-few` · `lead-00011-qoz`, ambas 04:08 — **redesplegadas de verdad** |
| 2 | `asistente` por `curl`, sin token | **HTTP 401 `UNAUTHENTICATED`** |
| 3 | `lead` por `curl`, sin token | **HTTP 401 `UNAUTHENTICATED`** |
| 4 | Asistente desde un navegador real | respondió con los datos del plan Crecimiento |
| 5 | Formulario desde un navegador real | «Recibimos tus datos» · lead en Firestore · correo enviado (`sin avisar: 0`) |
| 6 | Envío interceptado por la isla | `defaultPrevented: true`, **sin parámetros en la URL** (sigue en pie el arreglo de `v0.2.4`) |
| 7 | 401 en las 2 h siguientes | **dos, ambos `curl/8.5.0`** — los de la prueba 2 y 3. Ningún navegador rechazado |
| 8 | Sitio · `live` | 200 · `FINALIZED` v0.2.6 |

## Lo que se retiró, y por qué

El `logger.info('App Check', …)` que sostuvo el monitoreo. Con la exigencia
activa, una petición sin token se rechaza **antes** del código de la Function,
así que ese registro pasaría a valer siempre `true`. Se retiró en vez de dejarlo
dando una falsa sensación de control.

La vigilancia se muda a donde el fallo sí se ve:

```
métricas de App Check en la consola de Firebase (peticiones no verificadas)
gcloud logging read 'resource.labels.service_name="asistente"
  AND httpRequest.status=401' --project novuchat-site
```

## Guarda permanente

`pnpm prohibiciones` gana el control 6: falla si alguna Function vuelve a
`enforceAppCheck: false`. **Comprobado que falla de verdad**, no solo que existe.
Desactivarlo obliga a quitar también la comprobación, en el mismo commit y con
el motivo escrito: la vuelta atrás debe ser deliberada, no silenciosa.

## Plan de rollback

Dos vías, de menor a mayor alcance:

1. `enforceAppCheck: false` en ambas Functions **y quitar el control 6**, luego
   desplegar. Es el rollback del control, no del pase.
2. `firebase hosting:clone novuchat-site:previa novuchat-site:live` para el
   sitio; las Functions no vuelven con esto.

## Riesgo asumido — S-15

Si a un visitante legítimo le falla la atestación —reCAPTCHA bloqueado por una
extensión, navegador muy viejo— **pierde el asistente y el formulario**, y el
rechazo ocurre fuera de nuestro código. Se decidió activarlo **dos días antes de
la Rueda** deliberadamente: es la ventana para descubrirlo con tráfico bajo, y
deja la Rueda —cuando el sitio recibirá visitas y enlaces— con el asistente
protegido en vez de abierto.

## Riesgos vigentes

| Asunto | Estado |
|---|---|
| **Identidad legal provisional** | AAB1 / NIT 2441214012, a sustituir por el NIT propio de NovuChat |
| **Token de depuración de App Check** | Sin registrar. `pnpm dev` lo activa e imprime un UUID en la consola del navegador; hay que darlo de alta en Firebase → App Check → Administrar tokens de depuración, o el desarrollo local contra las Functions de producción dejará de funcionar |
| CVE-2026-41907 (`uuid`, MEDIA) | Vence 2026-12-01 |
| TypeScript 6 | `@astrojs/check` no lo admite de verdad |
| Cinco leads de prueba | Rotulados, se conservan como evidencia |

## Nota sobre la versión

El commit lleva `feat:`, que por Conventional Commits pediría un salto menor
(`v0.3.0`). Se etiquetó `v0.2.6` porque el cambio **exige un control que ya
existía**, no añade capacidad, y porque el número ya está escrito en el código,
en el doc 04 y en `ESTADO.md`. Queda dicho para que la desviación no pase por
descuido.

## Lección

Un plazo no es evidencia. La regla decía «7 días» y se cumplieron; lo que no se
cumplió fue la condición que el plazo intentaba aproximar —tráfico real sin
falsos positivos—, y solo mirando **qué** había en la muestra, en vez de
**cuánta**, se vio que no había ni un navegador dentro.
