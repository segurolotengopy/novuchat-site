# docs/ — Paquete de arquitectura de `novuchat.site`

Elaborado el 2026-09-02 a partir del análisis de `~/.gemini/antigravity/scratch/AAB1-landing/`
(sitio de referencia www.aab1.website), de la plataforma y consola en `~/NovuChat/` y del
artefacto de Claude Design **"Panel NovuChat"** (versión del 2026-09-02, alineada al logo).

| Archivo | Contenido | Público |
|---|---|---|
| `../CLAUDE.md` | Instrucciones de proyecto para Claude Code: prohibiciones, reglas, flujo de trabajo, qué requiere a Andres | Claude Code |
| `01-analisis-referencia-aab1-landing.md` | Inventario, funcionalidades, agente IA, seguridad, privacidad y hallazgos del sitio de referencia; qué reutilizar y qué no | Andres / Claude Code |
| `02-contexto-negocio-y-producto.md` | Producto, problema, propuesta de valor, verticales, planes, consola, identidad visual, datos legales, vocabulario | Todos |
| `03-arquitectura-sitio.md` | Stack, mapa del sitio, estructura del repositorio, Functions, Firestore, `firebase.json` con CSP, dominios y enlace a la consola, i18n, tema, rendimiento, accesibilidad | Claude Code |
| `04-seguridad-y-privacidad.md` | Prohibiciones, modelo de amenazas S-1…S-15, App Check, política de privacidad y términos base, checklist previo al despliegue | Claude Code / Andres |
| `05-contenido-y-secciones.md` | Guion de contenido por página, textos base, SEO, JSON-LD, base de conocimiento del asistente | Silvana / Claude Code |
| `06-plan-de-implementacion.md` | Decisiones pendientes D1–D8, fases 0–5, intervenciones de Andres, estimación | Andres |
| `07-prompt-claude-design.md` | Prompt listo para pegar en Claude Design (sistema de la consola como base) | Andres |
| `09-prompt-claude-code.md` | Prompt de arranque para Claude Code (orden de lectura, fases, discrepancias del diseño) | Andres |
| `diseno/` | Exportación del artefacto "Novuchat Responsive landing page design" (`0dc499f8…`, 2026-09-02): `landing-design.html` (referencia visual, no código), `qr-demostracion.png`, `fotos/pyme-*.jpg` (ilustrativas, generadas) y los logos JPEG | Claude Code |
| `08-sistema-de-diseno.md` | Tokens exactos del artefacto "Panel NovuChat", contraste medido, adaptaciones panel → sitio, logotipo, checklist | Claude Code / Claude Design |

**Cómo empezar en Claude Code:** abrir `~/Novuchat-site`, leer `CLAUDE.md`, resolver las
decisiones D1–D8 del doc 06 (o aceptar las recomendadas) y ejecutar la Fase 0.

Las marcas ⚠️ señalan datos que dependen del documento comercial de Silvana o de una
decisión de Andres; no deben llegar a producción sin confirmarse.
