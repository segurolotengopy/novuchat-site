# Acta de pase a producción — novuchat.site — v0.2.4 — 2026-09-06

Commit: `be53f9d` · Tag: `v0.2.4` (creado y empujado por Claude Code, sin firma)
Run: [34061127665](https://github.com/segurolotengopy/novuchat-site/actions/runs/34061127665) · Modo: A
Autorizó el pase: Andres Alberdi desde la sesión de Claude Code
Ejecutó la aprobación: Claude Code con la cuenta `segurolotengopy`, por decisión suya

## Veredicto: desplegado. Tres cambios; **uno de ellos es una fuga de datos personales**.

## 1. Los datos del cliente podían acabar en la URL

El `onSubmit` de la isla llama a `preventDefault()`, así que en uso normal el
envío va por el SDK y nada aparece en la barra de direcciones. Pero si la isla
**no se ha hidratado** —un error de JS, una conexión lenta, un navegador
viejo— el navegador hace su envío nativo, y un `<form>` sin `method` es un GET.

Visto de verdad, no en teoría, al verificar `v0.2.3` con un envío que se
adelantó a la hidratación:

```
/demo?nombre=…&negocio=…&whatsapp=%2B591…&correo=…&mensaje=…
```

Nombre, teléfono y correo de un cliente **en la URL**: queda en el historial del
navegador, viaja en la cabecera `Referer` y aparece en los registros de
cualquier intermediario. Es exactamente lo que el resto del diseño evita con
cuidado —las Functions no registran el correo ni el teléfono en claro—, anulado
por un atributo que faltaba.

`method="post"` no se ejecuta nunca mientras la isla funcione. **Por eso mismo
hay que ponerlo**: es la red para el caso en que no funcione.

## 2. El correo de contacto pasa a `novuchat@novuchat.site`

De `silvana@novuchat.site` a `novuchat@novuchat.site`. Vive en un único sitio
—`src/contenido/sitio.es.ts`— y desde ahí se propaga a las doce páginas, al pie,
a la página de contacto y a los datos estructurados.

El **índice del asistente también lo tenía**: el fragmento `contacto` respondía
con la dirección vieja. Regenerado con `pnpm rag:indexar`. Es el caso de libro de
la regla de `CLAUDE.md`: *si cambia el contenido del sitio hay que reindexar*, o
el asistente cita datos que la página ya no muestra.

No se tocó `docs/diseno/landing-design.html`, que `CLAUDE.md` marca como
artefacto de referencia y no como código de producción.

## 3. El asistente lleva la marca

El botón cerrado ya flotaba y ya tenía el isotipo, pero **al abrirse el panel
tapa ese botón** y el visitante perdía de vista con quién habla. El isotipo pasa
al título del panel.

## Evidencia

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Envío real del formulario | lead en Firestore · correo recibido en `novuchat@novuchat.site` |
| 2 | `silvana@` en el build | 0 coincidencias |
| 3 | JSON-LD publicado | `novuchat@novuchat.site` |
| 4 | Índice del asistente | fragmento `contacto` con la dirección nueva |
| 5 | Panel en claro y en oscuro, y a 375 px | sin desborde; `position: fixed` |
| 6 | Sitio · `live` | 200 · `FINALIZED` v0.2.4 |

## Plan de rollback

`firebase hosting:clone novuchat-site:previa novuchat-site:live`

## Riesgos vigentes

| Asunto | Estado |
|---|---|
| **App Check en monitoreo** | `enforceAppCheck: false`. Ya hay tráfico real de navegador desde `v0.2.3`; falta acumular ventana |
| **Identidad legal provisional** | AAB1 / NIT 2441214012 |
| CVE-2026-41907 (`uuid`, MEDIA) | Vence 2026-12-01 |
| TypeScript 6 | `@astrojs/check` no lo admite de verdad |

## Lección

El fallo 1 apareció **porque se estaba verificando otro pase en el navegador
real**. Ninguna prueba lo buscaba, ningún `grep` lo habría encontrado: solo
existe en la ventana entre que la página se pinta y la isla se hidrata, que en
un escritorio con buena red dura milisegundos.
