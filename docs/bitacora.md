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

## Paso 16 — La app es la Lista de Tareas: documentación funcional, análisis y ADR (2026-11-24)

**Qué hicimos:** decidimos que la app de DemoAgentes es la **Lista de Tareas** (tareas, plantillas y tareas repetitivas) del análisis de referencia `docs/analisis-diseño.md`, y la adaptamos al stack del CLAUDE.md. Así se resuelve el pendiente principal de la Fase 0.5 (qué app construir) y, en parte, el pendiente del paso 13 (qué se reutiliza de los documentos de referencia).

**Por qué:** el análisis existente describía la app sobre ASP.NET Core, EF Core, SQLite y xUnit, que no es nuestro stack.

**Cambios:**
- `docs/app/lista-de-tareas.md` (Fase 1): parte funcional sin tecnología, con actor, conceptos, funcionalidades F-01 a F-12, dos casos de uso, reglas de negocio RN-01 a RN-10, fuera de alcance y preguntas abiertas para negocio.
- `docs/analisis.md` (Fase 2): capas de Symfony, entidades Doctrine (`Task`, `TaskTemplate`, enum `Recurrence`), 12 endpoints bajo `/api/tasks` y `/api/task-templates`, errores en `application/problem+json`, lógica de completar e instanciar, pantallas y rutas de Angular, requisitos no funcionales, plan de tests y tabla de diferencias con la referencia.
- `docs/decisiones/0001-base-de-datos-postgresql.md` y `0002-codigo-y-api-en-ingles.md`, en estado "propuesto".
- `CLAUDE.md`: marcadas como hechas las tareas de documentación (Fase 1) y de análisis, requisitos no funcionales y ADR (Fase 2), y con ✅ las carpetas `docs/app/`, `docs/analisis.md` y `docs/decisiones/`. Los dos CRITERIO siguen sin marcar.

**Decisión:**
- PostgreSQL en lugar de SQLite, porque el Docker Compose ya prevé un servidor de base de datos (ADR-0001).
- Código y rutas en inglés, según la regla del CLAUDE.md (ADR-0002).
- Se elimina el booleano `EsRepetitiva`: `recurrence` nullable lo sustituye y evita estados incoherentes.
- La validación devuelve `422` y no `400`, como hace Symfony por defecto.
- `/complete` devuelve la tarea completada y la nueva ocurrencia.
- `analisis-diseño.md` se conserva sin tocar, como referencia.

**Pendiente:**
- CRITERIO de la Fase 1 (validación funcional) y de la Fase 2 (revisión técnica), y aprobación de los ADR.
- Preguntas abiertas: qué pasa con las tareas al borrar una plantilla, desde qué fecha se calcula la siguiente ocurrencia, qué pasa al reabrir y volver a completar una tarea repetitiva, si hace falta borrado lógico y qué base de datos se usa en los tests.
- Conflicto con el CLAUDE.md: la Fase 4 incluye "Implementar seguridad (autenticación…)", pero la autenticación queda fuera de alcance. Hay que decidir si se cambia esa tarea; es un cambio del candado y necesita aprobación.
- Fase 0.5: completar el CLAUDE.md con qué es la app y su alcance.

**Ficheros:** `docs/app/lista-de-tareas.md` (nuevo), `docs/analisis.md` (nuevo), `docs/decisiones/0001-base-de-datos-postgresql.md` (nuevo), `docs/decisiones/0002-codigo-y-api-en-ingles.md` (nuevo), `CLAUDE.md` (modificado), `docs/bitacora.md` (modificado).

## Paso 17 — CRITERIO de la Fase 1: documentación funcional aprobada (2026-11-24)

**Qué hicimos:** el usuario, como PO, aprobó y firmó la documentación funcional `docs/app/lista-de-tareas.md`. Queda cerrado el CRITERIO de la Fase 1.

**Cambios:**
- `docs/app/lista-de-tareas.md`: el estado pasa de "borrador" a "aprobado", con firma y fecha.
- `CLAUDE.md`: marcado `[x]` el CRITERIO de la Fase 1.

**Pendiente:**
- Las cuatro preguntas abiertas de la sección 8 del documento siguen sin respuesta. La aprobación no las resuelve: hay que contestarlas antes de crear los issues de la Fase 3.
- CRITERIO de la Fase 2: revisión técnica de `docs/analisis.md` y aprobación de los ADR 0001 y 0002.

**Ficheros:** `docs/app/lista-de-tareas.md` (modificado), `CLAUDE.md` (modificado), `docs/bitacora.md` (modificado).

## Paso 18 — Respuestas del PO a las preguntas abiertas (2026-11-24)

**Qué hicimos:** el PO respondió las cuatro preguntas abiertas de la documentación funcional e incorporamos las respuestas a la documentación y al análisis. Queda resuelto el primer pendiente del paso 17.

**Respuestas:**
1. No se puede eliminar una plantilla con tareas asociadas → RN-12, `409` y FK `ON DELETE RESTRICT`.
2. La siguiente ocurrencia se calcula desde el día en que se completa → RN-05.
3. Una tarea completada no se puede reabrir → RN-11. `PUT` deja de aceptar `completed` y el estado solo cambia con `/complete`.
4. Borrado lógico con papelera → RN-10 reescrita, F-13 (ver papelera), F-14 (restaurar), CU-03, campo `deletedAt` y endpoints `GET /api/tasks/trash` y `POST /api/tasks/{id}/restore`.

**Cambios:**
- `docs/app/lista-de-tareas.md`: funcionalidades F-04, F-05, F-11, F-13 y F-14; CU-01 y CU-03; reglas RN-05 y RN-10 a RN-13; fuera de alcance; la sección 8 pasa a ser "Preguntas de negocio resueltas".
- `docs/analisis.md`: modelo de `Task`, relación con la plantilla, endpoints, DTO, errores `409`, lógica de servicios, pantalla de papelera en Angular, plan de tests y tablas de diferencias y riesgos.

**Decisión:** el borrado lógico se hace a mano con `deletedAt` y métodos del repositorio, sin la extensión Gedmo SoftDeleteable, para que sea explícito en la demo.

**Pendiente:**
- El PO debe confirmar lo que añadimos por deducción y no salió de sus respuestas: RN-13 (una tarea de la papelera no se modifica ni se completa), que las tareas de la papelera también cuentan para RN-12, y que vaciar la papelera y la papelera de plantillas quedan fuera de alcance.
- CRITERIO de la Fase 2 (análisis y ADR) y conflicto de seguridad de la Fase 4 con el CLAUDE.md.

**Ficheros:** `docs/app/lista-de-tareas.md` (modificado), `docs/analisis.md` (modificado), `docs/bitacora.md` (modificado).

## Paso 19 — El PO confirma las reglas deducidas (2026-11-24)

**Qué hicimos:** el PO dio por buenas las reglas que añadimos por deducción en el paso 18: RN-13, que las tareas de la papelera cuentan para RN-12, y que vaciar la papelera y la papelera de plantillas quedan fuera de alcance. Queda resuelto el primer pendiente del paso 18 y la documentación funcional queda cerrada.

**Pendiente:** CRITERIO de la Fase 2 (análisis y ADR) y conflicto de seguridad de la Fase 4 con el CLAUDE.md.

**Ficheros:** `docs/app/lista-de-tareas.md` (modificado), `docs/bitacora.md` (modificado).

## Paso 20 — CRITERIO de la Fase 2 y decisiones para la versión 0.1 (2026-11-24)

**Qué hicimos:** el usuario pidió crear la versión 0.1 de la aplicación. Antes de implementar cerramos lo que exige el CLAUDE.md: aprobó el análisis y los ADR (CRITERIO de la Fase 2) y tomó tres decisiones. Queda resuelto el conflicto de seguridad de la Fase 4 pendiente desde el paso 16.

**Decisiones del usuario:**
- **Alcance de la 0.1:** backend completo (tareas, papelera y plantillas) y frontend Angular.
- **Base de datos:** SQLite en la 0.1, porque Docker no está instalado. PostgreSQL en Docker se aplaza (nuevo ADR-0003).
- **Seguridad:** la tarea de la Fase 4 se reduce a validación de entrada y gestión de errores; la autenticación queda fuera de alcance.

**Cambios:**
- `docs/decisiones/0001` y `0002` pasan a "aceptado"; el 0001 se aplicará cuando haya entorno Docker.
- Nuevo `docs/decisiones/0003-sqlite-en-la-version-0-1.md`.
- `docs/analisis.md`: estado "aprobado", stack con SQLite, entorno de la 0.1 y riesgos actualizados.
- `CLAUDE.md`: tarea de seguridad de la Fase 4 reescrita (cambio del candado aprobado por el usuario) y CRITERIO de la Fase 2 marcado.

**Pendiente:**
- Composer no está instalado y hace falta para crear el proyecto Symfony (Fase 4).
- Docker Compose (Fase 0) sigue pendiente; no bloquea la 0.1.

**Ficheros:** `docs/decisiones/0001-base-de-datos-postgresql.md`, `docs/decisiones/0002-codigo-y-api-en-ingles.md`, `docs/analisis.md` (modificados), `docs/decisiones/0003-sqlite-en-la-version-0-1.md` (nuevo), `CLAUDE.md` (modificado), `docs/bitacora.md` (modificado).
