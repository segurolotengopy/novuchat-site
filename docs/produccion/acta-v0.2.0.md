# Acta de pase a producción — novuchat.site — v0.2.0 — 2026-09-06

Commit: `daba785` · Tag: `v0.2.0` (firmado, verificado por el pipeline)
Run: [34018522563](https://github.com/segurolotengopy/novuchat-site/actions/runs/34018522563) · Modo: A
Aprobó el despliegue: Andres Alberdi (`segurolotengopy`)

## Veredicto: desplegado. El sitio deja de prometer lo que el producto no hace.

Primera versión **menor** de la serie: no corrige un fallo técnico, cambia lo que
el sitio afirma.

## Por qué

Tres frases de `/precios` se leían como funciones disponibles y no lo estaban.
El riesgo no era técnico sino comercial: **un cliente podía descubrir la
diferencia después de pagar.**

| Frase | Qué era falso |
|---|---|
| «Varios funcionarios, cada uno con su agenda **y especialidades**» | Las especialidades se cargan en la consola, pero el asistente no las usa para filtrar |
| «Pedidos con **variantes, notas y envío por zona**» | No existen las variantes, las notas por ítem ni el envío diferenciado |
| «Alta… y **base de datos aislada**» | El aislamiento es lógico, por reglas; no hay una base por cliente |

## Lo que se encontró al mirar más allá de `/precios`

Las mismas promesas estaban en **cuatro sitios más**, y en las páginas de rubro
eran **más concretas**, con ejemplos textuales:

- `/soluciones/salud-belleza`: «cada profesional con su propia agenda y sus especialidades»
- `/soluciones/gastronomia`: «Pedidos con notas y variantes» · «Envío calculado por zona»
- `/soluciones/comercio`: «Talla, color y **disponibilidad real**»
- `precios.en.ts`: las tres, en inglés

Un cliente de gastronomía lee su página de rubro, no la de precios.

## Una corrección durante la propia PR

La frase de instalación aprobada decía «**Ni nosotros podemos** leer tus
conversaciones». Al verificar la cifra de pruebas apareció el modelo de amenazas
T-5 de la plataforma: el claim de propietario no da acceso, pero **sí se puede
leer con un permiso temporal que abre un administrador del negocio**, dura de 1 a
24 horas y queda registrado.

El absoluto era falso. Quedó: «Nadie de NovuChat lee tus conversaciones sin que
tú abras el acceso» — que además resiste la repregunta «¿entonces cómo me dan
soporte?».

La cifra publicada («más de doscientos casos automáticos») **se verificó** antes
de escribirla: `reglas.test.ts` de la plataforma tiene 203 casos y 404
aserciones.

## Evidencia

| # | Comprobación | Resultado |
|---|---|---|
| 1 | `updateTime` de las Functions | `06:13` → `07:16` — se recompilaron |
| 2 | Registro del despliegue | `Successful update operation`, sin `Skipped` |
| 3 | `/precios`, salud-belleza, comercio | limpios de las promesas retiradas |
| 4 | Frases nuevas en el HTML servido | las cuatro presentes |
| 5 | Índice del asistente | 35 fragmentos, umbral 0,64 intacto, recuperación 100 % |
| 6 | El asistente ya no promete | «especialidades», «envío por zona» y «stock» → deriva; «variantes» → «todavía no están disponibles, pero es una función próxima» |

El punto 6 fue el hallazgo útil: **el rótulo «próximamente» se propaga solo hasta
el asistente**, sin tocar el prompt.

## Lo que quedó fuera y se corrigió después

En gastronomía seguía «sin cebolla»: no en un caso de uso, sino en la
**conversación de ejemplo**. Ver el acta de `v0.2.1`.
