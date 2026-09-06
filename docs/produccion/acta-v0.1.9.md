# Acta de pase a producción — novuchat.site — v0.1.9 — 2026-09-06

Commit: `8804e44` · Tag: `v0.1.9` (firmado, ED25519, verificado por el pipeline)
Run: [34014154059](https://github.com/segurolotengopy/novuchat-site/actions/runs/34014154059) · Modo: A
Aprobó el despliegue: Andres Alberdi (`segurolotengopy`)

## Veredicto: desplegado y comprobado en la nube. El asistente deja de responder cortado.

Es el pase que cierra lo que `v0.1.8` no llegó a entregar.

## Qué corrige

`gemini-2.5-flash` razona antes de contestar y **`maxOutputTokens` incluye esos
tokens de pensamiento**. Con el tope en 400, el modelo gastaba ~381 razonando y
le quedaban 15 para responder:

```
finishReason: MAX_TOKENS · thoughtsTokenCount: 381 · candidatesTokenCount: 15
→ «El plan Pro incluye todo lo del plan Crecimiento, 2.»
```

El verificador la descartaba por «numero-inventado: 2» **y hacía bien**: ese 2
era el principio de «2.500» partido por la mitad. El visitante recibía «eso no lo
tengo» a una pregunta que el corpus sí cubre.

**El asistente llevaba así desde el primer día.** No se notaba porque las
preguntas simples caben en el presupuesto; fallaban las que piden elaboración,
que son justo las comerciales.

**Es intermitente, no determinista**: depende de cuánto decida razonar el modelo
en cada petición. La medición dio 3 de 5 truncadas.

| Cambio | Por qué |
|---|---|
| `thinkingConfig: { thinkingBudget: 256 }` | Acota el razonamiento: lo que queda para la respuesta está **garantizado**, no a merced del modelo. Medido: las preguntas reales usan 189–243 |
| `maxOutputTokens: 400 → 1200` | Deja ~944 tokens asegurados para contestar |
| Descarte por `finishReason: MAX_TOKENS` | Una respuesta truncada **no se publica**, aunque el verificador la dejara pasar |
| Aviso de `Skipped (No changes detected)` | Que un despliegue no pueda saltarse las Functions en silencio |

Sobre el tercero: con la configuración vieja, **3 de 5 preguntas salían truncadas
y el verificador aceptaba las 5**. Media frase publicada es peor que un «eso no
lo tengo», porque el visitante no sabe que le falta algo.

## Evidencia, en el orden en que se comprobó

Primero lo que faltó en `v0.1.8`; el comportamiento, al final.

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Registro del despliegue | `Successful update operation` ×2, **ningún `Skipped`** |
| 2 | **`updateTime` de las Functions** | `05:05:56` → **`06:13:49`** — avanzó |
| 3 | Compilaciones | 2 nuevas en `SUCCESS` (las de las 05:05 siguen en `FAILURE`) |
| 4 | La pregunta que fallaba, ×5 | **5/5 completas**, 386–437 caracteres |
| 5 | Truncados o descartes en registros | ninguno en 15 min |
| 6 | **RAG estricto** | «capital de Francia» y «página web» siguen derivando |
| 7 | Sitio · `live` · enlaces | 200 · `FINALIZED` v0.1.9 · ningún enlace roto |

El punto 6 importa tanto como el 4: subir el presupuesto **no aflojó** el
control. El asistente sigue sin responder lo que no está en el corpus.

## Riesgos aceptados, vigentes

| Asunto | Estado |
|---|---|
| **App Check en monitoreo** | `enforceAppCheck: false`. Datos ya disponibles: `gcloud logging read 'jsonPayload.message="App Check"'` |
| **Identidad legal provisional** | AAB1 / NIT 2441214012 hasta el NIT propio |
| CVE-2026-41907 (`uuid`, MEDIA) | Vence 2026-12-01 |
| TypeScript 6 | `@astrojs/check` no lo admite de verdad |
| Dos leads de prueba en producción | «Salón Aurora» y «Parrilla El Fogón», rotulados como prueba |

## Estado del sitio

Asistente respondiendo completo contra Vertex · formulario avisando por correo a
`novuchat@novuchat.site` · consola enlazada · sin enlaces rotos · Lighthouse 100
en las cuatro categorías en móvil · rollback disponible · sin errores en las
Functions.
