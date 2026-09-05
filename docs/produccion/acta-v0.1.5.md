# Acta de pase a producción — novuchat.site — v0.1.5 — 2026-09-05

Commit: `414a9ea` · Tag: `v0.1.5` (firmado, ED25519, verificado por el pipeline)
Run: [33969771670](https://github.com/segurolotengopy/novuchat-site/actions/runs/33969771670) · Modo: A
Aprobó el despliegue: Andres Alberdi (`segurolotengopy`)

## Veredicto: el aviso de leads por correo funciona de punta a punta.

Es el pase que convirtió el formulario en algo útil. Hasta aquí guardaba el lead
y nadie se enteraba.

## Qué cambia

| Cambio | Por qué |
|---|---|
| `Referer` en la llamada a FormSubmit | **Sin él, FormSubmit rechaza el aviso.** Ver abajo |
| Registro de App Check | La «semana de monitoreo» no registraba nada |
| `pnpm rag:cotejar` | El índice del asistente podía desincronizarse en silencio |
| `pnpm leads:pendientes` | Recuperar leads sin avisar, sin consola ni correo |
| `pnpm enlaces` | Enlaces rotos contra el sitio publicado |
| Alias real en Secret Manager (versión 2) | Lo que activa el correo de verdad |

## El fallo que este pase evitó

Activando el punto final desde la terminal, FormSubmit respondió:

```
{"success":"false","message":"Make sure you open this page through a web server,
 FormSubmit will not work in pages browsed as HTML files."}
```

El mensaje **no menciona la cabecera que falta**. `avisarPorCorreo` mandaba
exactamente esas cabeceras, así que el resultado con el alias ya configurado
habría sido: primer lead real guardado, `avisado: false`, ningún correo, y en los
registros un «Lead guardado pero sin avisar» sin causa. Se habría descubierto con
un cliente perdido, no con una prueba.

**No se veía leyendo el código.** Hizo falta hablar con el servicio.

## Evidencia

| # | Comprobación | Resultado |
|---|---|---|
| 1 | `FORMSUBMIT_ALIAS` en las Functions | **versión 2** — el redespliegue tomó el alias real |
| 2 | Lead enviado a la Function desplegada | `{"ok":true}` |
| 3 | **Estado del lead** | `Leads en total: 1 · sin avisar: 0` → `avisado: true` |
| 4 | **Correo recibido** | confirmado por el propietario en Zoho, con todos los campos y «Someone just submitted your form on https://novuchat.site/» |
| 5 | Errores en registros | ninguno en 30 min |
| 6 | Sitio · `live` · `previa` | 200 · `FINALIZED` v0.1.5 · rollback disponible |

El punto 4 es el que cierra el asunto: no solo que FormSubmit aceptara, sino que
**el correo llega a la bandeja**.

## Lo que no se probó

El envío **desde el formulario del sitio con un clic real**. Se intentó desde el
navegador, pero la isla no registró los eventos sintéticos y el envío no salió;
la verificación se hizo llamando a la Function con el mismo payload que manda la
isla. Queda probado Function → Firestore → FormSubmit → bandeja; queda sin
probar por Claude Code el tramo del clic.

## Nota

El lead de prueba («Salón Aurora», `+59170000001`) sigue en producción y se puede
borrar. Se usaron los datos ficticios que exige la prohibición 9.
