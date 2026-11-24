# Bitácora del proyecto DemoAgentes

Registro de cada paso que damos, en orden. Cada entrada indica qué se hizo, por qué y qué ficheros cambiaron.

---

## Paso 1 — Punto de partida: la pizarra (2026-11-24)

**Qué hicimos:** partimos de un diagrama en pizarra que describe el flujo de trabajo con agentes de IA:

- La **documentación de la app (DOC)** se lleva, vía **MCP**, a **Jira** (tareas) y a un **análisis** técnico.
- La **IA** toma los tickets de Jira (vía MCP) y construye la **app en PHP**.
- El resultado acaba en una **Pull Request en Git**.
- En cada salida hay un **CRITERIO**: revisión humana antes de avanzar.

**Stack decidido:** PHP + Symfony + Doctrine (backend), Angular (frontend) y tests.

**Ficheros:** ninguno; la carpeta estaba vacía.

## Paso 2 — Creación del CLAUDE.md como lista de tareas (2026-11-24)

**Qué hicimos:** creamos `CLAUDE.md` en la raíz con el stack, el flujo de la pizarra, una lista de tareas por fases (0 a 7) con su punto de CRITERIO, reglas para el agente y comandos básicos.

**Ficheros:** `CLAUDE.md` (nuevo).

## Paso 3 — El candado de la pizarra es el CLAUDE.md (2026-11-24)

**Qué hicimos:** corregimos la interpretación del candado ① del diagrama. En la primera versión lo habíamos leído como "tests en verde"; en realidad **el candado representa el CLAUDE.md**: el diseño que define en qué consiste el proyecto y que acota lo que puede hacer la IA.

**Cambios:**
- El diagrama del CLAUDE.md sitúa el candado ① sobre la app PHP.
- Nueva **Fase 0.5 — Diseño del proyecto** para completar y aprobar el CLAUDE.md antes de implementar.
- Nueva regla: "Este CLAUDE.md es el candado: ninguna implementación puede salirse de lo que define".
- Los tests pasan a ser una fase normal (Fase 5).

**Ficheros:** `CLAUDE.md` (modificado).

## Paso 4 — Carpeta docs y bitácora (2026-11-24)

**Qué hicimos:** creamos `docs/` con dos ficheros:
- `docs/bitacora.md` (este fichero): registro de cada paso.
- `docs/aprendizajes.md`: lo que vamos aprendiendo, que se añade cuando se pide.

**Ficheros:** `docs/bitacora.md`, `docs/aprendizajes.md` (nuevos), `CLAUDE.md` (regla de documentación).

## Paso 5 — Repositorio Git en local (2026-11-24)

**Qué hicimos:** inicializamos el repositorio Git en local con `git init -b main`. De momento no hay remoto.

- Rama principal: `main`. Las ramas de trabajo seguirán el formato `feature/<JIRA-KEY>-descripcion`.
- Añadimos un `.gitignore` para Symfony (`vendor/`, `var/`, `.env.local`, cachés de PHPUnit) y Angular (`node_modules/`, `dist/`, `.angular/`), además de ficheros del IDE, del sistema y la configuración local de Claude Code.
- Marcada la tarea en la Fase 0 del CLAUDE.md y añadida otra pendiente: crear el remoto y enlazarlo.

**Pendiente:** primer commit (todavía no hay ninguno). *(Resuelto en el paso 10.)*

**Ficheros:** `.git/` (nuevo), `.gitignore` (nuevo), `CLAUDE.md` (modificado).

*(Superado en el paso 7: las ramas pasan a `feature/<nº-issue>-descripcion` al sustituir Jira por GitHub.)*

## Paso 6 — Skill de proyecto para mensajes de commit (2026-11-24)

**Qué hicimos:** creamos el skill `mensaje-commit` en `.claude/skills/`, la carpeta de skills de Claude Code a nivel de proyecto (solo existe en este repositorio, no en el resto de proyectos del usuario).

**Qué hace el skill:**
- Lee el diff preparado antes de escribir nada.
- Primera línea con el formato `tipo: descripción corta` (`feat`, `fix`, `docs`, `test`, `refactor`, `style`, `build`, `ci`, `chore`), en castellano y con 72 caracteres como máximo.
- Cuerpo opcional con el detalle; si el cambio es trivial, basta una línea.
- Tres reglas: ser específico con lo que cambió, no confundir escueto con vago y proponer dividir commits si el diff mezcla cambios sin relación.
- Ejemplos buenos y malos, y el commit solo se hace con aprobación del usuario.

**Decisión:** el CLAUDE.md dice `<JIRA-KEY>: descripción breve` para los commits y el skill propone `tipo: <JIRA-KEY> descripción` cuando hay ticket. Se decidió **no modificar la regla del CLAUDE.md** por ahora; ambos formatos conviven. *(Superado en el paso 7: Jira se sustituye por GitHub.)*

**Ficheros:** `.claude/skills/mensaje-commit/SKILL.md` (nuevo).

## Paso 7 — GitHub en lugar de Jira (2026-11-24)

**Qué hicimos:** corregimos el proyecto para usar **GitHub** como gestor del backlog en lugar de Jira. Todo pasa por GitHub vía MCP: issues, tablero y Pull Requests.

**Equivalencias:**

| Antes (Jira) | Ahora (GitHub) |
|---|---|
| Épica | Milestone (y etiquetas) |
| Historia / tarea | Issue (con sub-issues o checklist) |
| Tablero | GitHub Projects |
| Clave `PROJ-12` | Número de issue `#12` |
| Cerrar ticket a mano | `Closes #12` en la PR: se cierra al hacer merge |
| CI | GitHub Actions |

**Cambios:**
- `CLAUDE.md`: stack, diagrama, flujo, Fases 0, 3, 4, 5 y 7, y reglas del agente.
- Ramas: `feature/<nº-issue>-descripcion`.
- Commits: el número del issue va al final, `descripción breve (#<nº>)`. No puede ir al principio porque Git trata las líneas que empiezan por `#` como comentarios cuando el mensaje se edita en el editor.
- Skill `mensaje-commit`: `tipo: descripción corta (#<nº>)` y `Closes #<nº>` en el cuerpo. Así el skill y el CLAUDE.md quedan alineados y desaparece la divergencia del paso 6.

**Ficheros:** `CLAUDE.md`, `.claude/skills/mensaje-commit/SKILL.md` (modificados).

## Paso 8 — Estructura de carpetas en el CLAUDE.md (2026-11-24)

**Qué hicimos:** añadimos al CLAUDE.md la sección "Estructura de carpetas" con el árbol completo del proyecto. Las carpetas que ya existen van marcadas con ✅ y en el resto se indica la fase en que se crean.

**Puntos clave:**
- `docs/`: bitácora, aprendizajes, documentación funcional (`docs/app/`), análisis y ADR.
- `backend/src/` sigue las capas Controller → Service → Repository → Entity, más `Dto/` para la API.
- `backend/tests/` separa tests `Unit/` y `Functional/`.
- `frontend/src/app/` se organiza en `core/`, `shared/` y `features/` (una carpeta por bloque funcional).
- `.github/`: workflows de GitHub Actions y plantilla de PR.
- En la Fase 0, la tarea "Crear estructura de carpetas" pasa a ser "Definir la estructura" (hecha) y "Crear las carpetas que faltan a medida que avance cada fase" (pendiente).

**Ficheros:** `CLAUDE.md` (modificado).

## Paso 9 — Corrección del frontmatter del skill (2026-11-24)

**Qué pasó:** Claude Code mostraba el error *"Failed to parse frontmatter: Nested mappings are not allowed in compact mappings"* al cargar el skill `mensaje-commit`.

**Causa:** el campo `description` iba en una sola línea sin comillas y contenía `"tipo: descripción corta"`. En YAML, la secuencia `: ` (dos puntos y espacio) dentro de un valor sin comillas se interpreta como una nueva clave, y el parser falla.

**Solución:** pasamos `description` a un bloque YAML plegado (`description: >-`) en varias líneas, donde los dos puntos son texto literal. Comprobamos que el frontmatter ya se lee correctamente como YAML.

**Verificación:** el skill aparece entre los disponibles de la sesión y se invoca sin errores. Carga la versión actual, la que ya incluye la referencia a issues de GitHub.

**Ficheros:** `.claude/skills/mensaje-commit/SKILL.md` (modificado).

## Paso 10 — Primeros commits (2026-11-24)

**Qué hicimos:** hicimos los primeros commits del repositorio con los mensajes redactados por el skill `mensaje-commit`. Siguiendo su regla "un commit, un propósito", el trabajo se dividió en tres commits:

1. `chore: añadir .gitignore para Symfony, Angular y configuración local`
2. `chore: añadir skill mensaje-commit para redactar commits del proyecto`
3. `docs: crear CLAUDE.md con el flujo de la pizarra y la bitácora en docs/`

Ninguno lleva número de issue porque todavía no existen issues en GitHub.

**Ficheros:** `docs/bitacora.md` (modificado); ninguno más, solo commits.

## Paso 11 — Skill bitacora para registrar pasos y retomar en otro chat (2026-11-24)

**Qué hicimos:** creamos el skill de proyecto `bitacora` con dos modos. Esta entrada es la primera escrita con él.

**Por qué:** la bitácora dependía de recordar una regla, sin formato fijo, y no había forma clara de que un chat nuevo continuara donde se quedó el anterior.

**Cambios:**
- Modo `registrar` (por defecto): añade la entrada del paso con una plantilla fija (qué hicimos, por qué, cambios, decisión, pendiente, ficheros). Marca los pasos superados sin reescribir el historial y pone `[x]` en las tareas completadas del CLAUDE.md.
- Modo `retomar`: lee la bitácora, el CLAUDE.md, `docs/aprendizajes.md` y git, y resume el último paso, los hitos, las decisiones vigentes, lo pendiente, la fase actual y el siguiente paso propuesto. También avisa de desajustes (commits sin registrar, cambios sin explicar) y no modifica nada.
- `CLAUDE.md`: el skill aparece en la estructura de carpetas y la regla de documentación indica empezar los chats nuevos con `/bitacora retomar`.

**Decisión:** el `description` del frontmatter va en bloque YAML (`>-`) desde el principio, para no repetir el error de parseo del paso 9. Validado con un parser YAML.

**Pendiente:** commit de estos cambios. *(Resuelto en el paso 12.)*

**Ficheros:** `.claude/skills/bitacora/SKILL.md` (nuevo), `CLAUDE.md` (modificado), `docs/bitacora.md` (modificado).

## Paso 12 — Commit del skill bitacora y repositorio remoto en GitHub (2026-11-24)

**Qué hicimos:** commiteamos el skill `bitacora`, con lo que queda resuelto el pendiente del paso 11, y creamos el repositorio remoto en GitHub, enlazado como `origin`. Subimos `main`.

**Cambios:**
- Commit `fc2ac40 chore: añadir skill bitacora para registrar pasos y retomar en otro chat`.
- Repositorio creado con `gh repo create --source=. --remote=origin --push`: https://github.com/hispafox/DemoAgentes
- `main` sigue a `origin/main`.
- Tarea de la Fase 0 "Crear el repositorio remoto en GitHub y enlazarlo" marcada como hecha en el CLAUDE.md.

**Decisión:** el repositorio se creó **privado**. Se puede hacer público más adelante desde GitHub o con `gh repo edit --visibility public`.

**Ficheros:** `CLAUDE.md` (modificado), `docs/bitacora.md` (modificado).

## Paso 13 — Documentos de referencia de proyectos anteriores en docs/ (2026-11-24)

**Qué hicimos:** commiteamos y subimos cinco documentos que el usuario añadió a `docs/`. Son material de referencia de otros proyectos (AppTodoList y tstcln-reservas) que usaron agentes y skills con GitHub Copilot sobre .NET:
- `ARQUITECTURA-AGENTES.md` y `ARQUITECTURA-AGENTES-V2.md`: equipo de agentes coordinados (orquestador, plan, código, verificación, commit), el bucle de verificación y el flujo con GitHub Issues.
- `skills-orquestacion.md` y `skills-orquestacion-v2.md`: catálogo de skills, orden de ejecución, dependencias y convenciones por capa.
- `analisis-diseño.md`: análisis y diseño de AppTodoList (CRUD de tareas con plantillas y tareas repetitivas), con modelo de datos, endpoints y decisiones.

**Decisión:** se suben tal cual, como referencia. Su stack (ASP.NET Core, EF Core, xUnit) **no** es el de este proyecto. Lo que manda es el CLAUDE.md (PHP, Symfony, Doctrine, Angular), así que lo que se reutilice habrá que adaptarlo.

**Pendiente:** decidir qué ideas de estos documentos se trasladan a DemoAgentes. Las candidatas son la estructura del análisis para la Fase 2 y el reparto de agentes y skills.

**Ficheros:** `docs/ARQUITECTURA-AGENTES.md`, `docs/ARQUITECTURA-AGENTES-V2.md`, `docs/skills-orquestacion.md`, `docs/skills-orquestacion-v2.md`, `docs/analisis-diseño.md` (nuevos), `docs/bitacora.md` (modificado).

## Paso 14 — Cierre de sesión y handoff (2026-11-24)

**Qué hicimos:** cerramos la primera sesión de trabajo. Esta entrada es el punto de partida para el siguiente chat.

**Cómo retomar:** abre un chat nuevo en `C:\w\repos\DemoAgentes` y escribe `/bitacora retomar`. Todo está commiteado y subido, así que también funciona en un worktree.

**Estado al cerrar:**
- Repositorio privado https://github.com/hispafox/DemoAgentes, con `main` sincronizada con `origin/main` y sin cambios pendientes.
- `CLAUDE.md` (el candado ①): stack, estructura de carpetas, flujo de la pizarra, lista de tareas por fases y reglas del agente. Gestión con **GitHub** (Issues, Milestones, Projects, Actions), no con Jira.
- Skills de proyecto en `.claude/skills/`: `mensaje-commit` (formato `tipo: descripción (#nº)`) y `bitacora` (modos registrar y retomar).
- `docs/`: esta bitácora, `aprendizajes.md` (vacío, solo se rellena cuando se pide) y cinco documentos de referencia de proyectos .NET (paso 13).
- Todavía no hay código: ni `backend/`, ni `frontend/`, ni issues en GitHub.

**Decisiones vigentes:**
- El candado ① del flujo es el CLAUDE.md: si algo no encaja, primero se cambia el CLAUDE.md con aprobación.
- La regla de commits del CLAUDE.md y el skill `mensaje-commit` usan el número de issue al final, `(#nº)`, nunca al principio.
- Repositorio privado.
- Sin hooks de automatización por ahora: `retomar` se lanza a mano al abrir un chat.

**Pendiente para la próxima sesión (por orden):**
1. Decidir qué ideas de los documentos de referencia se adaptan a DemoAgentes (paso 13): la estructura del análisis y el reparto de agentes y skills.
2. Fase 0: configurar el MCP de GitHub (o usar `gh`), crear el tablero en GitHub Projects y las etiquetas base, y definir el Docker Compose.
3. Fase 0.5: completar el diseño en el CLAUDE.md. Falta lo principal: **qué aplicación vamos a construir**.
4. Fase 1: reunir la documentación funcional de la app en `docs/app/`.

**Ficheros:** `docs/bitacora.md` (modificado).

## Paso 15 — Corrección de desajustes en la bitácora (2026-11-24)

**Qué hicimos:** corregimos los desajustes que detectó `/bitacora retomar` al empezar la segunda sesión.

**Cambios:**
- Paso 5: añadida la marca de superado (el formato de ramas `feature/<JIRA-KEY>` cambió en el paso 7) y marcado como resuelto su pendiente del primer commit (paso 10).
- Pasos 6 y 8: la línea "Ficheros" del paso 6 estaba al final del paso 8, que tenía dos. La devolvimos al paso 6.

**Ficheros:** `docs/bitacora.md` (modificado).
