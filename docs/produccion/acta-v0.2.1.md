# Acta de pase a producción — novuchat.site — v0.2.1 — 2026-09-06

Commit: `bd519f5` · Tag: `v0.2.1` (firmado, verificado por el pipeline)
Run: [34038804404](https://github.com/segurolotengopy/novuchat-site/actions/runs/34038804404) · Modo: A
Aprobó el despliegue: Andres Alberdi (`segurolotengopy`)

## Veredicto: desplegado. Corrige lo que v0.2.0 dejó fuera.

## Qué se había escapado

Al verificar `v0.2.0` en producción seguía apareciendo «sin cebolla» en
gastronomía. No era un caso de uso: era la **conversación de ejemplo**, que es
peor, porque **muestra la función en acción** en vez de solo nombrarla.

```
Cliente:   «una hamburguesa doble, sin cebolla. Es para mandar a Calacoto»
Asistente: «Hamburguesa doble sin cebolla registrada. El total con envío a
            Calacoto es 45 Bs»
```

Demuestra la nota por ítem y sugiere precio de envío por zona.

La de comercio era más explícita todavía, y demostraba **dos** funciones
inexistentes a la vez:

```
Cliente:   «¿Tienen la casaca negra en talla M?»
Asistente: «Sí, quedan dos en talla M a 320 Bs»
```

La variante (talla) y el stock en tiempo real. Un comercio lo prueba el primer
día.

## Por qué se escapó

Se revisaron los `casos` de cada rubro y **no las conversaciones**. Es el mismo
error de método que se repetiría una vez más en `v0.2.2`: buscar donde uno
espera encontrar.

## Qué cambia

Las dos conversaciones reescritas con lo que el asistente sí hace: pedido desde
el catálogo, total con el envío ya calculado, cobro por QR.

En la portada, la comparación con los chatbots de botones usaba «mejor sin
cebolla» como ejemplo de lo que **ellos** no entienden. Seguía siendo cierta —el
asistente entiende la frase; lo que no hace es registrar la nota— pero quedaba
incoherente justo después de retirar esa función. Se cambió por dos ejemplos que
el asistente resuelve enteros. **Es la única corrección de la serie donde la
frase original no era falsa.**

## Evidencia

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Registro del despliegue | `Successful update operation`, sin `Skipped` |
| 2 | `updateTime` de las Functions | avanzó a `14:23` |
| 3 | Índice del asistente | regenerado y cotejado |

## Lo que este pase destapó

El barrido posterior —esta vez sobre **todas las páginas del sitemap**, no sobre
los archivos que se creía relevantes— encontró las mismas promesas en la
portada, en `/como-funciona` y en la versión en inglés. Ver el acta de `v0.2.2`.
