# Acta de pase a producción — novuchat.site — v0.2.2 — 2026-09-06

Commit: `5126379` · Tag: `v0.2.2` (**creado y empujado por Claude Code**, sin firma)
Run: [34039677515](https://github.com/segurolotengopy/novuchat-site/actions/runs/34039677515) · Modo: A
Autorizó el pase: Andres Alberdi desde la sesión de Claude Code
Ejecutó la aprobación: Claude Code con la cuenta `segurolotengopy`, por decisión suya

## Veredicto: desplegado. El sitio queda sin ninguna promesa que el producto no cumpla.

Primer pase con el flujo nuevo: **una sola decisión humana**, en vez de aprobar
PR, crear tag, firmarlo, empujarlo y aprobar el pase.

## Qué corrige

El barrido de `v0.2.1` sobre **las páginas publicadas** encontró lo retirado en
cuatro sitios más, incluida la portada, que es la más vista:

```
/                «Variantes, notas, envío por zona…»              (tarjeta de pedidos)
                 «Funcionarios, cada uno con su agenda y sus especialidades»
                 «Las preguntas por talla y stock se responden a medianoche»
                 «Un pedido completo: variante, zona de envío…»
/como-funciona   la misma tarjeta de pedidos
/en              la misma tarjeta, en inglés
```

## El error de método, por tercera vez

Se acotó el `grep` a `precios.es.ts`, `precios.en.ts` y `verticales.es.ts`
porque eran los archivos donde se habían encontrado las frases al principio. La
portada vive en `inicio.es.ts` y en `index.astro`, y **nunca entraron en la
búsqueda**.

Las tres rondas de esta serie fallaron por lo mismo: buscar donde uno espera
encontrar. Lo que finalmente funcionó fue **recorrer el sitemap del sitio
publicado** con un patrón amplio, en vez de razonar sobre qué archivos deberían
contenerlo.

## Evidencia

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Barrido de las 18 páginas publicadas | solo dos coincidencias, ambas legítimas |
| 2 | `/precios` | «Variantes, notas por ítem y envío por zona» con etiqueta **Próximamente** |
| 3 | `/consola` | «sus especialidades» — cierto: la consola sí permite cargarlas |
| 4 | Sitio · `live` | 200 · `FINALIZED` v0.2.2 |
| 5 | Registro de la aprobación | `segurolotengopy · approved · «Autorizado por Andres Alberdi desde Claude Code…»` |

Un falso positivo digno de mención: el patrón encontró «talla» dentro de
«pan**talla**», en «Las capturas de pantalla de esta página». El mismo error de
subcadena contra el que el filtro de términos del asistente se protege con
«terapia» y «api».

## Cambio de gobernanza aplicado en este pase

A petición del propietario, y tras exponerle qué se pierde:

| | Antes | Ahora |
|---|---|---|
| Aprobación de PR | 1 revisor obligatorio | **0** — la compuerta es `compuerta-pr` |
| Tags | los creaba y firmaba él | los crea Claude Code, sin firma |
| `TAG_FIRMADO_REQUERIDO` | `true` | `false` |
| Aprobación del pase | él, en la interfaz de GitHub | **él decide, Claude Code ejecuta** |

Se quitaron además `require_code_owner_review` y
`required_review_thread_resolution`: sin revisor obligatorio solo podían
bloquear sin que nadie pudiera desbloquear.

**Lo que se pierde, dicho para que conste:** el asiento de la aprobación ya no
distingue la decisión del propietario de la ejecución del agente. Si el criterio
del agente falla, no queda ningún control técnico entre ese fallo y los usuarios.
El propietario asumió ese riesgo con conocimiento, y por eso el comentario de
cada aprobación deja constancia de quién autorizó y por qué medio.

La regla del estándar se actualizó para describir esto en vez de prohibirlo:
`AndresAlberdi/SeguridadGeneral#2`.

## Riesgos vigentes

| Asunto | Estado |
|---|---|
| **App Check en monitoreo** | `enforceAppCheck: false`. La semana **no produjo señal utilizable**: las 16 peticiones registradas son pruebas desde terminal, sin tráfico real de navegador |
| **Identidad legal provisional** | AAB1 / NIT 2441214012 |
| CVE-2026-41907 (`uuid`, MEDIA) | Vence 2026-12-01 |
| TypeScript 6 | `@astrojs/check` no lo admite de verdad |
| Dos leads de prueba | Rotulados, se conservan como evidencia |
