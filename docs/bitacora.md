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

## Paso 21 — Regla de firmas en el CLAUDE.md (2026-11-24)

**Qué hicimos:** a petición del usuario, añadimos al CLAUDE.md una regla que impide avanzar si algo no se ha firmado antes. Interrumpe la creación del backlog de la 0.1, que queda a la espera de la regla.

**Cambios:**
- `CLAUDE.md`: nueva sección "Firmas (puertas de CRITERIO)". Explica qué es una firma (aprobación expresa de una persona en el chat; el agente nunca firma), sus tres huellas (registro, cabecera del documento y `[x]` del CRITERIO), la regla de bloqueo con la tabla de dependencias por fase, qué pasa si un documento firmado cambia y el "Registro de firmas" con las firmas ya dadas. También una regla nueva en "Reglas para el agente".
- Cabeceras de la documentación funcional, el análisis y los tres ADR, con el formato `firmado por <persona> el <fecha>`.

**Pendiente:** al aplicar la regla, la Fase 3 (backlog) queda **bloqueada**, porque el CLAUDE.md (CRITERIO de la Fase 0.5) no está firmado.

**Ficheros:** `CLAUDE.md`, `docs/analisis.md`, `docs/app/lista-de-tareas.md`, `docs/decisiones/0001-base-de-datos-postgresql.md`, `docs/decisiones/0002-codigo-y-api-en-ingles.md`, `docs/decisiones/0003-sqlite-en-la-version-0-1.md`, `docs/bitacora.md` (modificados).

## Paso 22 — Diseño de la app en el CLAUDE.md (2026-11-24)

**Qué hicimos:** completamos el CLAUDE.md con lo que pedía la Fase 0.5, para que el usuario pueda firmarlo y se desbloquee el backlog de la 0.1.

**Cambios:**
- Sección "La aplicación: Lista de Tareas": qué es, documentos de referencia, alcance de la 0.1, fuera de alcance y qué manda si hay contradicción.
- Stack: línea de base de datos (SQLite en la 0.1, PostgreSQL después).
- Sección "Arquitectura y convenciones": capas del backend, convenciones de la API REST (rutas, códigos, problem+json), nombres y estructura de Angular.
- Marcadas las cuatro tareas de la Fase 0.5. El CRITERIO queda pendiente de firma.

**Pendiente:** firma del CLAUDE.md (CRITERIO de la Fase 0.5).

**Ficheros:** `CLAUDE.md` (modificado), `docs/bitacora.md` (modificado).

## Paso 23 — CRITERIO de la Fase 0.5: CLAUDE.md firmado (2026-11-24)

**Qué hicimos:** el usuario firmó el CLAUDE.md. Con esto queda desbloqueado el backlog de la 0.1 (Fase 3) y resuelto el pendiente del paso 22.

**Cambios:** cabecera de estado en el CLAUDE.md, fila en el Registro de firmas y `[x]` en el CRITERIO de la Fase 0.5.

**Ficheros:** `CLAUDE.md` (modificado), `docs/bitacora.md` (modificado).

## Paso 24 — Suspensión temporal de la regla de firmas (2026-11-24)

**Qué hicimos:** a petición del usuario, suspendimos la regla de bloqueo por firmas hasta que la reactive en el chat.

**Cambios:**
- `CLAUDE.md`: aviso de suspensión en la sección "Firmas", nota en la regla del agente y nueva tabla "Pendientes de firma".

**Decisión:** suspender no es borrar. Mientras dure, el agente avanza sin esperar firmas, pero marca cada entregable como `pendiente de firma` y lo anota en la tabla, para firmarlo todo junto al reactivarla. Siguen vigentes las reglas que no son firmas: nada de PR con tests en rojo, nada de merge sin una persona y nada de implementar sin issue.

**Ficheros:** `CLAUDE.md` (modificado), `docs/bitacora.md` (modificado).

## Paso 25 — Backlog de la versión 0.1 en GitHub (2026-11-24)

**Qué hicimos:** creamos en GitHub el backlog de la 0.1 a partir de la documentación funcional y el análisis. Como la regla de firmas está suspendida (paso 24), el backlog queda en "Pendientes de firma" del CLAUDE.md.

**Cambios:**
- Etiquetas: `backend`, `frontend`, `test`, `docs`, `ci`, `historia` y `v0.1`.
- Milestones (uno por bloque funcional, como pide el CLAUDE.md): `Infraestructura`, `Bloque A — Tareas` y `Bloque B — Plantillas`.
- 12 issues, cada uno con objetivo o historia, enlaces a la documentación funcional y al análisis, criterios de aceptación Dado/Cuando/Entonces y checklist de tareas:
  - Infraestructura: #1 proyecto Symfony con SQLite, #2 PHPUnit, #3 proyecto Angular, #4 CI y plantilla de PR.
  - Bloque A: #5 gestionar tareas, #6 completar y recurrencia, #7 papelera (backend); #10 pantallas de tareas y #11 pantalla de papelera (frontend).
  - Bloque B: #8 gestionar plantillas, #9 instanciar plantilla (backend); #12 pantallas de plantillas (frontend).
- `CLAUDE.md`: marcadas cuatro tareas de la Fase 3; la de etiquetas de la Fase 0 indica que ya están creadas.

**Decisión:** la versión se marca con la etiqueta `v0.1`, porque los milestones se reservan para los bloques funcionales según el CLAUDE.md.

**Pendiente:**
- El tablero de GitHub Projects no se pudo crear: al token de `gh` le falta el permiso `project`. El usuario tiene que ejecutar `gh auth refresh -s project,read:project`.
- Composer no está instalado y hace falta para el issue #1.
- CRITERIO de la Fase 3 (refinamiento del backlog), pendiente de firma.

**Ficheros:** `CLAUDE.md` (modificado), `docs/bitacora.md` (modificado).

## Paso 26 — Issue #1: proyecto Symfony con Doctrine y SQLite, y scripts de PowerShell (2026-11-24)

**Qué hicimos:** implementamos el issue #1 en la rama `feature/1-proyecto-symfony`. Además, a petición del usuario, creamos scripts `.ps1` para instalar, arrancar, parar y probar el backend.

**Cambios:**
- Composer: descargamos `composer.phar` 2.11.3 de getcomposer.org a `.tools/` (ignorada en Git), verificando su SHA-256.
- `backend/`: proyecto Symfony 7.4 creado con `symfony new`, más `orm-pack`, `serializer-pack`, `validator`, `clock` y `maker-bundle` (dev).
- `DATABASE_URL` apunta a SQLite en `var/data.db` (ADR-0003). Borramos los `compose*.yaml` que añadió la receta de Doctrine con PostgreSQL, porque Docker está aplazado.
- Carpetas `src/Service/` y `src/Dto/`, junto a las `Controller/`, `Entity/` y `Repository/` del esqueleto.
- `scripts/backend-setup.ps1` (descarga Composer si falta, `composer install` y migraciones), `backend-start.ps1` (`-Port`, `-Foreground`), `backend-stop.ps1` y `backend-test.ps1` (contenedor, mapeo de Doctrine y PHPUnit cuando exista). Se guardan en UTF-8 con BOM para que PowerShell 5.1 lea bien los acentos.
- `CLAUDE.md`: sección "Comandos" con los scripts, `scripts/` y `backend/` en la estructura de carpetas, y dos tareas de la Fase 4 marcadas.

**Verificación:** `backend-setup.ps1` instala y migra, `backend-test.ps1` termina en verde, y `backend-start.ps1` arranca el servidor (página de bienvenida de Symfony en dev) que `backend-stop.ps1` para. Se crea `var/data.db`.

**Decisión:** las migraciones se ejecutan con `--allow-no-migration`, porque hasta el issue #5 no hay ninguna y sin la opción el comando devuelve error.

**Pendiente:** todavía no hay PHPUnit (issue #2), así que la PR no incluye tests.

**Ficheros:** `backend/` (nuevo), `scripts/*.ps1` (nuevos), `.gitignore`, `CLAUDE.md`, `docs/bitacora.md` (modificados).

## Paso 27 — Merge de la PR #13 (issue #1) (2026-11-24)

**Qué hicimos:** el usuario decidió hacer el merge de la PR #13 y pidió al agente que lo ejecutara. `main` ya incluye el backend Symfony y los scripts, y el issue #1 se cerró solo por el `Closes #1`.

**Por qué el agente:** la regla "No hacer merge" del CLAUDE.md reserva la decisión a una persona. La decisión la tomó el usuario en el chat; el agente solo ejecutó `gh pr merge --merge --delete-branch`. GitHub no permite aprobar una PR propia, así que no hay revisión formal.

**Ficheros:** `docs/bitacora.md` (modificado).

## Paso 28 — Skill modelo para crear y actualizar el modelo de datos (2026-11-24)

**Qué hicimos:** creamos el skill de proyecto `modelo` en `.claude/skills/modelo/`. Crea, actualiza y revisa el modelo de la aplicación (entidades y enums Doctrine, repositorios, migraciones y tests de dominio) a partir de la sección 3 de `docs/analisis.md`.

**Por qué:** el usuario quería un skill propio para mantener el modelo. Se basa en el CLAUDE.md, el análisis y, a petición del usuario, en los documentos de orquestación de skills (`docs/skills-orquestacion.md` y `-v2.md`).

**Cambios:**
- Tres modos:
  - `crear`: genera lo que el análisis define y aún no existe, solo en la parte que cubre el issue.
  - `actualizar <cambio>`: primero el análisis (que pierde la firma) y, si hace falta, un ADR; después el código, una migración nueva y los tests.
  - `revisar`: compara análisis y código, devuelve una tabla de diferencias y no modifica nada.
- Comprobaciones previas: issue y rama, estado de la regla de firmas y repositorio limpio.
- Sección "Lugar en la orquestación", al estilo de las referencias: qué lee, qué escribe, qué no toca, prerrequisito (se detiene si el análisis no define algo), verificación mínima, entregable y frontera con los servicios.
- Convenciones de entidades (sin setters de estado, métodos de dominio con la regla RN en el docblock, la fecha se pasa como argumento) y tabla de tipos del análisis a Doctrine, solo con tipos portables entre SQLite y PostgreSQL.
- Reglas de migraciones (una por issue, leerla entera, no editar las que ya están en `main`) y aviso sobre las claves foráneas en SQLite.
- `CLAUDE.md`: el skill aparece en la estructura de carpetas.

**Decisión:** `modelo` reúne en un solo tramo lo que en las referencias eran dos skills (`modelo` + `base-de-datos`, o `dominio-backend` + `persistencia-doctrine`), porque con atributos de Doctrine la entidad y su mapeo están en el mismo fichero. La lógica entre varias entidades (RN-05, RN-12) queda para los servicios.

**Verificación:** el frontmatter se lee bien como YAML y el skill aparece entre los disponibles de la sesión.

**Pendiente:** el resto de skills de la cadena (DTO, servicios, API, frontend, pruebas) no existen todavía.

**Ficheros:** `.claude/skills/modelo/SKILL.md` (nuevo), `CLAUDE.md` (modificado), `docs/bitacora.md` (modificado).

## Paso 29 — Diagrama ER del modelo en el análisis (2026-11-24)

**Qué hicimos:** a petición del usuario, añadimos a la sección 3 de `docs/analisis.md` un diagrama entidad-relación en Mermaid con `TASK`, `TASK_TEMPLATE` y su relación. Cada columna lleva su tipo, su nulabilidad y las reglas RN que la afectan.

**Decisión:** el diagrama solo dibuja lo que ya definían las tablas del análisis, sin añadir ni cambiar nada del diseño. Por eso no anula la firma del análisis; es el mismo caso que una corrección que no cambia el contenido. Lo commiteamos en `main`, aparte de la rama del issue #2, para no mezclarlo con PHPUnit.

**Verificación:** la sintaxis del diagrama se validó con un renderizador de Mermaid (tipo `er`, válido).

**Ficheros:** `docs/analisis.md` (modificado), `docs/bitacora.md` (modificado).

## Paso 30 — Issue #2: PHPUnit con base de datos de test (2026-11-24)

**Qué hicimos:** implementamos el issue #2 en la rama `feature/2-phpunit`. El backend ya tiene tests unitarios y funcionales, con una base de datos SQLite de test aislada.

**Cambios:**
- `symfony/test-pack` (PHPUnit 13, BrowserKit, CssSelector) y `dama/doctrine-test-bundle` 8.8.
- `phpunit.dist.xml`: suites `Unit` (`tests/Unit`) y `Functional` (`tests/Functional`), y la extensión de DAMA, que envuelve cada test en una transacción y la deshace al terminar.
- `.env.test`: `DATABASE_URL` con SQLite en `var/test.db`. En `doctrine.yaml` quitamos el `dbname_suffix` de la receta, que no tiene sentido con una ruta de fichero.
- `tests/bootstrap.php`: en cada ejecución borra `var/test.db` y la recrea con las migraciones, para que los tests usen el mismo esquema que producción.
- DAMA registrado a mano en `bundles.php` con su configuración, porque su receta no se aplicó.
- Tests de humo: `Unit/ClockTest`, que comprueba que se puede fijar la fecha (`MockClock`) para RN-02 y RN-05; `Functional/DatabaseTest`, que comprueba la base de datos de test y que las escrituras se deshacen entre tests; y `Functional/ApiErrorFormatTest`, que comprueba que un 404 de la API devuelve la estructura Problem Details.
- `CLAUDE.md`: marcada la tarea "Configurar PHPUnit y base de datos de test" de la Fase 5.

**Verificación:** `php bin/phpunit` → OK (6 tests, 10 assertions); las suites `Unit` y `Functional` por separado también; `scripts/backend-test.ps1` → "Todo en verde".

**Decisión:** el test de error iba a exigir `Content-Type: application/problem+json`, como pide el análisis, pero Symfony devuelve `application/json` por defecto, aunque con la estructura correcta. Ajustar la cabecera es gestión de errores y queda para el issue #5, donde lo anotamos en un comentario. El test de humo comprueba solo la estructura.

**Pendiente:** en los tests aparece en la consola una línea `[error] Uncaught ... NotFoundHttpException` del logger por defecto de Symfony. No afecta al resultado; se puede silenciar más adelante con un logger de test.

**Ficheros:** `backend/composer.json`, `backend/composer.lock`, `backend/symfony.lock`, `backend/.gitignore`, `backend/config/bundles.php`, `backend/config/packages/doctrine.yaml` (modificados); `backend/config/packages/dama_doctrine_test_bundle.yaml`, `backend/.env.test`, `backend/bin/phpunit`, `backend/phpunit.dist.xml`, `backend/tests/` (nuevos); `CLAUDE.md`, `docs/bitacora.md` (modificados).

## Paso 31 — Merge de la PR #14 (issue #2) (2026-11-24)

**Qué hicimos:** el usuario decidió hacer el merge de la PR #14 y el agente lo ejecutó (`gh pr merge --merge`). `main` ya tiene PHPUnit y la base de datos de test, el issue #2 se cerró solo y borramos la rama `feature/2-phpunit`.

**Pendiente:** después del merge, `php bin/phpunit` se quedó colgado en `main`, cuando en la rama terminaba en menos de un segundo. La suite `Unit` acabó mostrando una traza de error y la `Functional` no terminó. La migración de test, ejecutada sola, sí funciona. A petición del usuario (estaba en clase) aplazamos la investigación. Sospechas que hay que comprobar: un proceso PHP anterior que bloquea `var/test.db` o la caché de `var/cache/test`.

**Ficheros:** `docs/bitacora.md` (modificado).

## Paso 32 — Modelo del issue #5: enum Recurrence, entidad Task y migración (2026-11-24)

**Qué hicimos:** con `/modelo revisar` confirmamos que el código seguía sin modelo, y con `/modelo crear` generamos la parte del issue #5 en la rama `feature/5-gestionar-tareas`. Por petición del usuario (estaba en clase), **no ejecutamos los tests**.

**Cambios:**
- `src/Entity/Recurrence.php`: enum `daily`, `weekly`, `monthly` (RN-04).
- `src/Entity/Task.php`, tabla `task`: `id`, `title` (255), `completed` (default false), `createdAt`, `recurrence` (varchar 10, enum) y `nextOccurrenceDate` (date).
  - Constructor con la fecha como argumento, porque la tarea nace pendiente (RN-02).
  - `setTitle()` recorta espacios y rechaza el título vacío o de más de 255 caracteres (RN-01).
  - `setRecurrence()` impide que una tarea no repetitiva tenga fecha de siguiente ocurrencia (RN-03).
  - `isRecurring()` es derivado. No hay setter para `completed`.
- `src/Entity/Exception/DomainRuleViolation.php`: excepción de dominio cuyo mensaje cita la regla RN.
- `src/Repository/TaskRepository.php`: repositorio base, sin consultas propias.
- `migrations/Version20261124123921.php` ("Create task table (#5)"): solo crea la tabla `task`.
- `tests/Unit/Entity/TaskTest.php`: 11 tests que cubren RN-01 a RN-04. **Escritos, sin ejecutar.**

**Verificación:** `php -l` sin errores en todos los ficheros. Con `var/data.db` borrada, la migración se aplica en limpio, `doctrine:schema:validate` da mapeo correcto y esquema sincronizado, y `doctrine:migrations:status` muestra 1 ejecutada y 0 pendientes.

**Decisión:**
- Quedan fuera las partes del modelo de otros issues: `complete()` (#6), la papelera (#7) y la plantilla con su relación (#8).
- El análisis no dice quién calcula `nextOccurrenceDate` al crear una tarea a mano. La entidad lo recibe ya calculado y el cálculo queda para el servicio del #5, sin inventar una regla.

**Pendiente:**
- Ejecutar los tests cuando se resuelva el bloqueo de PHPUnit (paso 31). Sin tests en verde no se abre PR.
- El resto del issue #5: DTO, servicio, controlador, tests funcionales y la cabecera `application/problem+json`.

**Ficheros:** `backend/src/Entity/Recurrence.php`, `backend/src/Entity/Task.php`, `backend/src/Entity/Exception/DomainRuleViolation.php`, `backend/src/Repository/TaskRepository.php`, `backend/migrations/Version20261124123921.php`, `backend/tests/Unit/Entity/TaskTest.php` (nuevos), `docs/bitacora.md` (modificado).

## Paso 33 — Suspensión del sistema de tests (2026-11-24)

**Qué hicimos:** a petición del usuario, aplazamos todo el sistema de tests hasta que lo reactive en el chat.

**Cambios:**
- `CLAUDE.md`, Fase 5: aviso de tests suspendidos. Mientras dure, el agente no ejecuta ni escribe tests, y se pueden abrir PR sin tests en verde si se indica "Tests diferidos". Siguen vigentes `php -l`, el mapeo de Doctrine y las migraciones. La regla "No abrir PR si los tests no pasan" y su mención en la sección "Firmas" remiten a esa suspensión.
- `scripts/backend-test.ps1`: por defecto ya no lanza PHPUnit (que se queda colgado, paso 31). Solo lo hace con `-PhpUnit`. Comprobado: sin PHPUnit termina en "Todo en verde".
- Skill `modelo`: nota de que, con los tests suspendidos, no los escribe ni los ejecuta.

**Por qué el modelo "desapareció":** para commitear esto volvimos a `main`, y VS Code mostró `Task.php` como borrado. El modelo está en la rama `feature/5-gestionar-tareas` (commit `584bc2b`, subido); al volver a esa rama reaparece.

**Pendiente:**
- Al reactivar los tests: resolver el bloqueo de PHPUnit (paso 31) y ejecutar los tests del paso 32.
- Sigue abierta la propuesta de añadir al CLAUDE.md que el mapeo de Doctrine va con atributos.

**Ficheros:** `CLAUDE.md`, `scripts/backend-test.ps1`, `.claude/skills/modelo/SKILL.md`, `docs/bitacora.md` (modificados).

## Paso 34 — Regla del mapeo de Doctrine con atributos en el CLAUDE.md (2026-11-24)

**Qué hicimos:** a petición del usuario, añadimos al CLAUDE.md (Arquitectura y convenciones → Backend) que el mapeo de Doctrine se hace con **atributos PHP** en la propia entidad, sin ficheros XML ni YAML. Ya se hacía así (`doctrine.yaml` con `type: attribute`, skill `modelo` y entidad `Task`), pero no estaba en el candado. Además, los documentos de referencia de tstcln-reservas usaban XML y alguien podría copiarlo de ahí.

**Cambios:**
- `CLAUDE.md`: nueva regla en "Backend (capas)".
- Como el CLAUDE.md firmado cambia de contenido, su cabecera pasa a "pendiente de nueva firma" y queda anotado en la tabla "Pendientes de firma". La regla de bloqueo sigue suspendida, así que no bloquea nada.

**Decisión:** lo editamos en `main` a través de un worktree temporal, sin cambiar la rama de trabajo. Así evitamos que los ficheros del modelo de `feature/5-gestionar-tareas` desaparezcan del editor (paso 33).

**Ficheros:** `CLAUDE.md`, `docs/bitacora.md` (modificados).

## Paso 35 — Categorías de tareas para la versión 0.2 (2026-11-24)

**Qué hicimos:** el usuario pidió con `/modelo` añadir categorías de tareas y comprobar el análisis. Las categorías no estaban ni en el análisis ni en la documentación funcional, así que el skill se detuvo y lo preguntó al PO. Con sus respuestas actualizamos la documentación funcional y el análisis, y creamos el issue #15. Todavía **no** hay código.

**Decisiones del PO:**
- La categoría es una entidad que el usuario gestiona: crear, renombrar y eliminar.
- Una tarea tiene cero o una categoría.
- No se puede eliminar una categoría que tenga tareas (`409`), tampoco si están en la papelera.
- Entra en la versión 0.2 y solo afecta a las tareas; las plantillas no llevan categoría.

**Cambios:**
- `docs/app/lista-de-tareas.md`:
  - Concepto "Categoría" y Bloque C con F-15 a F-19.
  - Reglas RN-14 (nombre obligatorio), RN-15 (cero o una por tarea) y RN-16 (no se elimina con tareas).
  - Fuera de alcance: categorías en plantillas y varias categorías por tarea.
  - Las respuestas del PO, como preguntas 5 a 8.
- `docs/analisis.md`:
  - Entidad `Category` (tabla `category`, `name` varchar 100) y campo `Task.category` (FK nullable `ON DELETE RESTRICT`), con `countByCategory()`.
  - Diagrama ER con `CATEGORY`; el Mermaid validado es de tipo `er` y sin errores.
  - Endpoints `/api/categories` y `categoryId` en los DTO de tarea, validación, `CategoryService::delete()`, pantalla `/categories`, plan de tests y dos riesgos nuevos.
- GitHub: etiqueta `v0.2`, milestone "Bloque C — Categorías" e issue #15 con criterios Dado/Cuando/Entonces.
- `CLAUDE.md`: rangos F-01 a F-19 y RN-01 a RN-16, línea "Versión 0.2" y cuatro entregables nuevos en "Pendientes de firma".

**Decisión:** el código del modelo (`Category`, la relación y la migración) se aplaza hasta que `Task` (issue #5) esté en `main`. Hacerlo ahora obligaría a mezclar dos issues en una rama o a duplicar la entidad.

**Pendiente:**
- El PO tiene que decidir si los nombres de categoría son únicos.
- La documentación funcional y el análisis han **perdido la firma**.
- El modelo de categorías, cuando se haya fusionado el #5.

**Ficheros:** `docs/app/lista-de-tareas.md`, `docs/analisis.md`, `CLAUDE.md`, `docs/bitacora.md` (modificados).

## Paso 36 — Nombres de categoría únicos (RN-17) (2026-11-24)

**Qué hicimos:** el PO decidió que los nombres de categoría son únicos. Así se resuelve el pendiente del paso 35. Lo incorporamos a la documentación funcional, al análisis, al issue #15 y al CLAUDE.md.

**Cambios:**
- `docs/app/lista-de-tareas.md`: regla RN-17 y la pregunta 9 en la tabla de respuestas del PO.
- `docs/analisis.md`:
  - `CategoryRepository::existsWithName()` compara con `LOWER(TRIM(name))` y `CategoryService` la consulta antes de crear o renombrar; un duplicado devuelve `422` con la violación en `name`.
  - Índice único `uniq_category_name` como segunda barrera.
  - Diagrama ER (`name` único), endpoints, plan de tests (`CategoryRepositoryTest`) y riesgo 3 reescrito.
- Issue #15: dos criterios de aceptación nuevos (duplicado sin distinguir mayúsculas → `422`; renombrar con su mismo nombre → `200`) y las tareas del modelo.
- `CLAUDE.md`: rangos de reglas hasta RN-17.

**Decisión:**
- La comparación ignora mayúsculas y espacios al principio o al final. Lo propuso el analista al aplicar la respuesta del PO, y queda anotado en el documento para que el PO pueda cambiarlo.
- El duplicado se responde con `422` y no con `409`: según el CLAUDE.md, `409` es para "el estado no permite la acción" y `422` para datos que no pasan la validación.
- El índice único solo atrapa duplicados exactos, porque un índice sin mayúsculas no es portable entre SQLite y PostgreSQL. La regla completa la garantiza el servicio.

**Ficheros:** `docs/app/lista-de-tareas.md`, `docs/analisis.md`, `CLAUDE.md`, `docs/bitacora.md` (modificados).
