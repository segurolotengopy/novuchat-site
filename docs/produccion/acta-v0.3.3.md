# Acta de pase a producción — novuchat.site — v0.3.3 — 2026-09-12

Commit: `906a1e8` · Tag: `v0.3.3` (anotado y **firmado**, ED25519) · Modo: A
Run: [34674093147](https://github.com/segurolotengopy/novuchat-site/actions/runs/34674093147) — 04:51 → 04:55 UTC, `success`
Autorizó el pase: Andres Alberdi desde la sesión de Claude Code («OK, despliega y quita lo de audios»)
Ejecutó la aprobación: Claude Code con la cuenta `segurolotengopy`, por decisión suya

## Veredicto: desplegado y verificado. Dejó publicado un defecto previo que corrigió `v0.3.4` diecisiete minutos después.

## Cambios incluidos (desde `v0.3.2`) — [#42](https://github.com/segurolotengopy/novuchat-site/pull/42)

| Tema | Antes | Ahora |
|---|---|---|
| Umbral del asistente | 0,64 | **0,70** (decisión de Andres) |
| Contexto del modelo | El mismo corte que el umbral | **Piso de contexto 0,64**, separado del umbral |
| «¿Eres una persona?» | Pasaba por el RAG | **Respuesta fija antes del RAG** (prohibición 7) |
| CSP `img-src` | sin `googletagmanager.com` | Con `https://www.googletagmanager.com` |
| Instalación a medida | «Desde USD 125» con dos ejemplos en el texto de la página | Tres ejemplos de la lámina 11 y la nota «cotizado caso por caso: no son funciones de serie», en el contenido tipado, `/precios`, `/en/precios` y el corpus |
| FAQ de audios | «Escuchar audios es una función que estamos construyendo» | Solo lo que el asistente hace hoy |

## El umbral, y los dos efectos que destapó

Recalibrado sobre 40 fragmentos: corpus min **0,657**, ajenas max **0,689**. Los
grupos se solapan y ningún umbral acierta en los dos lados; con 0,70 ninguna
pregunta ajena llega al modelo.

Subirlo sin más dio **11/13** contra Vertex:

1. **«tengo una peluquería, ¿me sirve?»** — `filtrarPorUmbral` usaba el mismo
   corte para decidir *si* se responde y *qué* ve el modelo. Con 0,70 el modelo
   perdió fragmentos de apoyo, escribió «24 horas» y el verificador lo descartó
   como número inventado. Arreglo: `PISO_CONTEXTO = 0,64`.
2. **«¿eres una persona o un robot?»** quedó en 0,687 y recibió «Eso no lo
   tengo»: choca con la prohibición 7. Arreglo: `preguntaPorIdentidad()` antes
   del RAG, con 16 casos de prueba, 7 de ellos negativos para que no conteste
   «soy una IA» a preguntas de negocio.

Con los dos: **13/13**. Las pruebas de unidad no lo habrían visto: usan un
índice sintético.

## Defecto encontrado al verificar

`axe` falló en `/precios` (tema claro) por la nota nueva de «a medida»:
`texto-apagado` sobre el fondo de la tarjeta, a 14 px, no llegaba al contraste
mínimo. Se quitó la clase antes del pase.

## Evidencia (contra producción)

| # | Comprobación | Resultado |
|---|---|---|
| 1 | CSP servida | `img-src 'self' data: https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://www.facebook.com` |
| 2 | Las 18 páginas del sitemap | Sin frases prohibidas, sin la Rueda, sin «estamos construyendo» |
| 3 | Textos nuevos | «A medida, desde USD 125», los tres ejemplos y «cotizado caso por caso» en `/precios`; «Custom, from USD 125» y «quoted case by case» en `/en/precios` |
| 4 | Asistente publicado | «eres una persona o un robot?» → «Soy el asistente virtual de NovuChat, una inteligencia artificial: no soy una persona…» |
| 5 | Asistente publicado | «¿el asistente escucha audios?» → «No, el asistente no escucha audios…», sin promesa |
| 6 | Asistente publicado | «¿Pueden conectar el asistente con mi sistema propio?» → **rechazada** como acceso interno. Ver `v0.3.4` |
| 7 | Cloud Run | `asistente-00015-dun` · `lead-00015-gel`, 04:54 UTC, 100 % del tráfico, `us-east1` |
| 8 | Pruebas | `pnpm verificar`: 85 unidad (antes 67) · 74 humo · CSP · prohibiciones · `axe`. Vertex 13/13 |
| 9 | Aprobación | Registrada en GitHub por `segurolotengopy`, con la autorización de Andres en el comentario |

## Plan de rollback

Hoy no aplica: `previa` guarda el sitio anterior al **último** despliegue
(`v0.3.4`). Ver el acta vigente.

## Riesgos vigentes

Ver el acta de `v0.3.4`, que es la vigente.
