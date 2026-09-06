# Acta de pase a producción — novuchat.site — v0.1.8 — 2026-09-06

Commit: `b6d1dc0` · Tag: `v0.1.8` (firmado, ED25519, verificado por el pipeline)
Run: [34012279854](https://github.com/segurolotengopy/novuchat-site/actions/runs/34012279854) · Modo: A
Aprobó el despliegue: Andres Alberdi (`segurolotengopy`), dos veces

## Veredicto: PARCIAL. Se publicó el sitio; las Functions NO se desplegaron.

Y el pipeline terminó en **verde**. Esta acta existe sobre todo por eso.

## Qué debía traer

El arreglo del asistente, que respondía cortado a media frase: `gemini-2.5-flash`
razona antes de contestar y `maxOutputTokens` **incluye** esos tokens. Con el
tope en 400, gastaba ~381 pensando y le quedaban 15 para responder.

## Qué llegó de verdad

| | Estado |
|---|---|
| Hosting | **v0.1.8 publicado** |
| Reglas de Firestore | publicadas |
| **Functions** | **NO desplegadas — siguieron con el código de v0.1.7** |

```
✔ functions[sitio:asistente(us-east1)] Skipped (No changes detected)
✔ functions[sitio:lead(us-east1)]      Skipped (No changes detected)
✔ Deploy complete!
```

## La cadena de causas

1. **Retirar `roles/editor` rompió la COMPILACIÓN, no la ejecución.** Las
   Functions gen2 usan la cuenta de cómputo como `buildConfig.serviceAccount`
   **aunque la de ejecución sea otra**. Al quitarle `editor`, las Functions
   siguieron corriendo —por eso la verificación posterior a `v0.1.4` pasó— pero
   el siguiente despliegue falló:

   ```
   Build failed with status: FAILURE. Could not build the function due to a
   missing permission on the build service account.
   ```

   Ese camino **solo se ejercita al desplegar**. La verificación que se hizo
   tras retirar el rol comprobó el tiempo de ejecución, no el de compilación.

2. **Se concedió `roles/cloudbuild.builds.builder`**, el rol mínimo de
   compilación: registros, Artifact Registry y Cloud Storage. Sin Firestore,
   IAM, hosting ni secretos, que era lo que sobraba en `editor`.

3. **Al relanzar, Firebase saltó las Functions.** Registra la huella del código
   subido **antes** de compilarlo. La compilación falló, pero la huella quedó
   grabada; al relanzar comparó, vio la misma y las saltó.

   **Una compilación fallida envenena el despliegue siguiente.**

## Cómo se detectó

No por el pipeline, que dio verde. Por tres comprobaciones contra la nube:

```
gcloud functions list --format="value(name,updateTime)"
  asistente  2026-09-06T05:05:56Z   ← el intento FALLIDO, no avanzó
gcloud builds list
  05:05 FAILURE ×2 · última SUCCESS: 05/09 22:27 (v0.1.7)
comportamiento: 3/3 «Eso no lo tengo»
```

## Riesgo que quedó abierto y se cerró en v0.1.9

Producción quedó **descuadrada**: hosting en v0.1.8, Functions en v0.1.7. Nada
roto —el sitio respondía, el formulario avisaba, el asistente contestaba con el
truncado intermitente— pero el arreglo no estaba donde el registro decía.

## Lo que cambió a raíz de esto

- El paso de despliegue detecta `Skipped (No changes detected)` y lo escribe en
  el resumen del job. No falla —saltar Functions es legítimo cuando de verdad no
  cambiaron— pero deja de ser invisible.
- La comprobación quedó anotada donde se mirará: `functions/src/proveedores/vertex.ts`.
- **`--force` no se usó**, pese a ser la salida evidente: la prohibición 10 lo
  descarta. La salida limpia fue cambiar el código de `functions/`, que altera
  la huella.

## La lección

**El verde del pipeline dice que los pasos no fallaron, no que el cambio esté en
producción.** Aquí ninguna etapa falló: la compilación se saltó, el despliegue
se completó y el health check pasó —porque el sitio, que sí se publicó,
respondía—. Lo único que lo demostró fue preguntarle a la nube por el
`updateTime`.
