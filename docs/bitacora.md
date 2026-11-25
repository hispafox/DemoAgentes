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

## Paso 37 — Skill analisis-diseno para crear, actualizar y revisar el análisis (2026-11-24)

**Qué hicimos:** creamos el skill de proyecto `analisis-diseno` en `.claude/skills/analisis-diseno/`. Mantiene `docs/analisis.md` y los ADR de `docs/decisiones/` a partir de la documentación funcional y del CLAUDE.md. Antes, con `/modelo revisar`, comprobamos que el código del modelo coincide con el análisis: falta lo de los issues #6, #7, #8 y #15, y el análisis no dice si `nextOccurrenceDate` es obligatoria al crear a mano una tarea repetitiva.

**Por qué:** el usuario echó en falta el skill. Es el primer eslabón de la cadena de `docs/skills-orquestacion.md` y `-v2.md`, y el skill `modelo` da por hecho que existe un análisis firmado antes que él.

**Cambios:**
- Tres modos, como `modelo`:
  - `crear <funcionalidad>`: diseña en el análisis lo que falte de una funcionalidad de la documentación funcional (modelo, API, lógica, pantallas, plan de tests y riesgos).
  - `actualizar <cambio>`: distingue el cambio funcional (lo decide el PO y va primero a la documentación funcional) del técnico; propone un ADR si contradice uno vigente; el análisis pierde la firma y avisa de lo que queda desfasado en issues, código y tests.
  - `revisar`: tabla de hallazgos (`falta`, `sobra`, `hueco`, `contradicción`, `incoherencia`) sin modificar nada.
- Sección "Lugar en la orquestación", fronteras con la documentación funcional (el PO decide el qué) y con `modelo`, estructura fija de las 10 secciones del análisis, reglas de diseño del CLAUDE.md, validación de Mermaid y plantilla de ADR.
- `CLAUDE.md`: el skill aparece en la estructura de carpetas.

**Decisión:** la carpeta se llama `analisis-diseno`, sin ñ, para evitar problemas de codificación en Windows y Git. El skill no exige rama de issue, porque el análisis es documentación, no implementación.

**Verificación:** el frontmatter se lee bien como YAML.

**Pendiente:** decidir con el PO el hueco de `nextOccurrenceDate` antes de hacer `TaskService` (#5); se puede plantear con `/analisis-diseno revisar`.

**Ficheros:** `.claude/skills/analisis-diseno/SKILL.md` (nuevo), `CLAUDE.md`, `docs/bitacora.md` (modificados).

## Paso 38 — RN-18: fecha de la siguiente ocurrencia al crear una tarea (2026-11-25)

**Qué hicimos:** con `/analisis-diseno revisar` detectamos que el análisis no decidía qué fecha de siguiente ocurrencia lleva una tarea repetitiva creada a mano (pendiente de los pasos 32 y 37). El PO decidió que sea **hoy + periodicidad**, igual que al instanciar una plantilla. Lo añadimos como RN-18 a la documentación funcional y al análisis.

**Cambios:**
- `docs/app/lista-de-tareas.md`: regla RN-18 (al crear, hoy + periodicidad; si cambia la periodicidad, se recalcula desde hoy; si deja de ser repetitiva, sin fecha) y la pregunta 10 del PO.
- `docs/analisis.md`: descripción de `nextOccurrenceDate` (§3 y diagrama ER), nuevo apartado `TaskService::create()` y `update()` en §5 y el caso en `TaskServiceTest` (§8). El diagrama Mermaid sigue siendo válido (tipo `er`).
- `CLAUDE.md`: rango RN-01 a RN-18 y fila nueva en "Pendientes de firma".

**Decisión:** si la periodicidad no cambia en un `PUT`, la fecha se conserva. La entidad sigue recibiendo la fecha ya calculada, porque el cálculo necesita el reloj y vive en el servicio.

**Otros hallazgos de la revisión, sin aplicar:** §6 no incluye un `category-api.service.ts` para la 0.2; §8 no tiene fila para los tests de entidad (`TaskTest`); §4 dice que Symfony "ya genera" `problem+json`, pero por defecto responde `application/json` (paso 30). La documentación funcional no aclara si se puede cambiar el título de una tarea completada.

**Ficheros:** `docs/app/lista-de-tareas.md`, `docs/analisis.md`, `CLAUDE.md`, `docs/bitacora.md` (modificados).

## Paso 39 — Skills dto, servicio y api para el backend (2026-11-25)

**Qué hicimos:** creamos los skills de proyecto `dto`, `servicio` y `api`, los tramos que faltaban entre `modelo` y el frontend para terminar el issue #5. Siguen el formato de `modelo`: modos `crear`, `actualizar` y `revisar`, tabla "Lee / Escribe / No toca / Prerrequisito / Verificación / Entregable" y fronteras con el tramo anterior y el siguiente.

**Cambios:**
- `dto`: `*Input` como `final readonly class` con `#[Assert\...]` y la regla en un comentario; `*Output` con `fromEntity()`, solo escalares, fechas ISO 8601 (`Y-m-d` para fechas sin hora) y relaciones como id. La entrada nunca lleva `id`, `completed`, `createdAt`, `deletedAt` ni `nextOccurrenceDate`.
- `servicio`: un servicio por recurso con autowiring, fechas siempre de `ClockInterface`, un único `flush()` por operación y excepciones de dominio: `DomainRuleViolation` (→ `409`), `ResourceNotFound` (→ `404`, también para tareas de la papelera) e `InvalidInput` (→ `422` para lo que solo se valida contra la base de datos).
- `api`: un controlador por recurso, `#[MapRequestPayload]`, códigos `200`/`201` + `Location`/`204`, excepciones mapeadas a códigos en `framework.exceptions` y prueba manual con el servidor mientras los tests estén suspendidos.
- `CLAUDE.md`: los tres skills en la estructura de carpetas.

**Decisión:**
- Los skills se crean justo antes de necesitarlos (el frontend y las pruebas, más adelante), para probarlos enseguida con un issue real.
- Los nombres `ResourceNotFound` e `InvalidInput` son detalle de implementación y no cambian el análisis.
- Si Symfony no envía `application/problem+json`, el skill `api` propone un *listener* en `src/EventListener/`, carpeta que no está en el CLAUDE.md: hay que aprobarla antes de crearla.

**Ficheros:** `.claude/skills/dto/SKILL.md`, `.claude/skills/servicio/SKILL.md`, `.claude/skills/api/SKILL.md` (nuevos), `CLAUDE.md`, `docs/bitacora.md` (modificados).

## Paso 40 — README del repositorio (2026-11-25)

**Qué hicimos:** a petición del usuario, añadimos un `README.md` en la raíz, porque el repositorio no tenía ninguno.

**Cambios:**
- `README.md`: qué es la demo y la aplicación, estado actual, cómo se trabaja (candado, firmas, ramas y PR, bitácora), tabla de documentos, stack, puesta en marcha del backend con los scripts de PowerShell, estructura y cadena de skills.
- `CLAUDE.md`: el `README.md` aparece en la estructura de carpetas.

**Decisión:** el README presenta el proyecto y remite al CLAUDE.md para el detalle, sin repetir las reglas, para que no haya dos fuentes que mantener.

**Pendiente:** actualizar la sección "Estado" del README cuando avancen los issues o se reactiven los tests.

**Ficheros:** `README.md` (nuevo), `CLAUDE.md`, `docs/bitacora.md` (modificados).

## Paso 41 — Issue #5: DTO, TaskService y TaskController (2026-11-25)

**Qué hicimos:** completamos el código del issue #5 en la rama `feature/5-gestionar-tareas`, siguiendo los skills `dto`, `servicio` y `api`: `GET /api/tasks`, `GET /api/tasks/{id}`, `POST` y `PUT`. Es la primera prueba de esos skills con un issue real. Con los tests suspendidos, **no escribimos ni ejecutamos tests**; probamos a mano con `curl`.

**Cambios:**
- `src/Dto/TaskInput.php`: `title` con `NotBlank` (recortando espacios) y `Length(max: 255)` (RN-01), y `recurrence` tipada con el enum (RN-03, RN-04). No acepta estado ni fechas.
- `src/Dto/TaskOutput.php`: campos base con `fromEntity()`, `createdAt` en ISO 8601 y `nextOccurrenceDate` como `Y-m-d`.
- `src/Service/RecurrenceCalculator.php`: suma 1 día, 1 semana o 1 mes; en meses, si el día no existe se usa el último del mes (RN-05, RN-18).
- `src/Service/TaskService.php`: `list()`, `getTask()`, `create()` (fecha hoy + periodicidad, RN-18) y `update()` (recalcula la fecha solo si cambia la periodicidad; sin ella, `null`). Fechas siempre de `ClockInterface`.
- `src/Service/Exception/ResourceNotFound.php` y, en `framework.yaml`, el mapeo `ResourceNotFound` → `404` y `DomainRuleViolation` → `409`.
- `src/Controller/TaskController.php`: cuatro acciones, `201` + `Location` al crear y `format: 'json'` en la ruta para que los errores salgan en JSON aunque la petición no mande `Accept`.

**Verificación:** `php -l`, `lint:container`, `doctrine:schema:validate` y `debug:router` (4 rutas `api_tasks_*`). A mano, con el servidor: `201` + `Location` y fecha `+7 días` para una semanal; `null` en una no repetitiva; `422` con título vacío y con `recurrence: "yearly"`; `400` con JSON roto; `404` en `GET` y `PUT` de un id inexistente; `PUT` a mensual recalcula la fecha, quitar la periodicidad la deja en `null` y `completed: true` se ignora.

**Decisión:**
- `TaskOutput` solo lleva los campos que ya tiene la entidad; `templateId` (#8), `deletedAt` (#7) y `categoryId` (#15) llegan con sus issues.
- Sin `Accept: application/json`, Symfony devolvía los errores en HTML. Lo resolvimos con `format: 'json'` en la ruta del controlador, sin código nuevo.

**Pendiente:**
- Los errores salen con `Content-Type: application/json` y no `application/problem+json`. La solución es un *listener* en `src/EventListener/`, carpeta que no está en el CLAUDE.md: falta la aprobación.
- Tests del #5 (servicio y endpoints) y los del paso 32, cuando se reactiven.
- Abrir la PR del #5.

**Ficheros:** `backend/src/Dto/TaskInput.php`, `backend/src/Dto/TaskOutput.php`, `backend/src/Service/RecurrenceCalculator.php`, `backend/src/Service/TaskService.php`, `backend/src/Service/Exception/ResourceNotFound.php`, `backend/src/Controller/TaskController.php` (nuevos), `backend/config/packages/framework.yaml`, `docs/bitacora.md` (modificados).

## Paso 42 — Reactivación de los tests y causa del "bloqueo" de PHPUnit (2026-11-25)

**Qué hicimos:** el usuario reactivó los tests en el chat. Antes de cambiar nada, investigamos el bloqueo de PHPUnit del paso 31 y ejecutamos las dos suites: **17 tests en verde** (Unit: 13, entre ellos los 11 de `TaskTest`, escritos sin ejecutar desde el paso 32; Functional: 4, en 11 segundos). Así se resuelven los pendientes de los pasos 31 y 32.

**Causa:** no era un fallo del código. El disco estaba al 99 % y Microsoft Defender escaneaba cada fichero que carga PHPUnit (más de 5.600 en `vendor/`), así que la ejecución tardaba tanto que parecía colgada. Además, `timeout` de Git Bash no mataba el proceso de PHP en Windows, que se quedaba vivo. También quedó encendido un servidor de Symfony de las pruebas manuales del paso 41 (`backend-stop.ps1` falló), que paramos a mano. El usuario desactivó temporalmente la protección en tiempo real; la recomendación es reactivarla con una exclusión para la carpeta del repositorio o usar una unidad de desarrollo (Dev Drive).

**Cambios:**
- `CLAUDE.md`: el aviso de la Fase 5 pasa a "tests reactivados el 2026-11-25"; la regla "No abrir PR si los tests no pasan" y su mención en "Firmas" vuelven a estar vigentes sin excepción.
- `scripts/backend-test.ps1`: PHPUnit vuelve a ejecutarse por defecto; `-SkipPhpUnit` lo omite.
- Skills `modelo`, `dto`, `servicio` y `api`: quitamos las notas de suspensión; los tests se escriben con el futuro skill `pruebas` y la PR solo se abre en verde.
- `README.md`: estado y uso del script actualizados.

**Pendiente:**
- Crear el skill `pruebas` y escribir los tests del #5 (`RecurrenceCalculatorTest`, `TaskServiceTest`, `TaskControllerTest`) antes de abrir su PR.
- Sigue en la consola la línea `[error] Uncaught ... NotFoundHttpException` del test de humo (paso 30).

**Ficheros:** `CLAUDE.md`, `scripts/backend-test.ps1`, `.claude/skills/modelo/SKILL.md`, `.claude/skills/dto/SKILL.md`, `.claude/skills/servicio/SKILL.md`, `.claude/skills/api/SKILL.md`, `README.md`, `docs/bitacora.md` (modificados).

## Paso 43 — Skill pruebas para escribir, ejecutar y revisar los tests (2026-11-25)

**Qué hicimos:** con los tests reactivados (paso 42), creamos el skill de proyecto `pruebas`, el tramo que faltaba antes del commit y la PR en la cadena de skills del backend.

**Cambios:**
- Tres modos: `crear` (tabla de cobertura criterio/regla → test, escribe los tests del issue y los ejecuta), `ejecutar` (lanza las suites e interpreta el resultado) y `revisar` (criterios y reglas sin test, sin tocar nada).
- Convenciones: unitarios de entidades, servicios (con `createMock`, `createStub` y `MockClock`) y calculadores; funcionales de endpoints con `WebTestCase`, `jsonRequest()`, DAMA y `ClockSensitiveTrait::mockTime()` para fijar la fecha.
- No toca código de producción: si un test descubre un fallo, se detiene y propone el arreglo con el skill del tramo.
- "Problemas conocidos": el falso bloqueo de PHPUnit por el antivirus y la línea de log del test de humo.
- `CLAUDE.md`: el skill aparece en la estructura de carpetas.

**Ficheros:** `.claude/skills/pruebas/SKILL.md` (nuevo), `CLAUDE.md`, `docs/bitacora.md` (modificados).

## Paso 44 — Tests del issue #5 y cabecera problem+json (2026-11-25)

**Qué hicimos:** con el skill `pruebas` escribimos los tests del issue #5 y resolvimos la cabecera `application/problem+json`, pendiente desde el paso 30. Las dos suites pasan: **42 tests y 94 aserciones**, en menos de un segundo de ejecución gracias a la exclusión de Defender.

**Cambios:**
- `tests/Unit/Service/RecurrenceCalculatorTest.php` (7 tests): diaria, semanal, mensual, 31 de enero → 28 de febrero, año bisiesto (29 de febrero), cambio de año y hora descartada (RN-05, RN-18).
- `tests/Unit/Service/TaskServiceTest.php` (7 tests): crear pendiente con la fecha del reloj y un único `flush` (RN-02), crear repetitiva con hoy + periodicidad, recalcular al cambiar la periodicidad, conservar la fecha si no cambia, borrarla al quitar la periodicidad (RN-03, RN-18), y `getTask()` con y sin resultado.
- `tests/Functional/Controller/TaskControllerTest.php` (11 tests): los seis criterios de aceptación del issue, más RN-18 de punta a punta, JSON roto → `400` y detalle de una tarea. La fecha se fija con `ClockSensitiveTrait::mockTime()`.
- `tests/Functional/ApiErrorFormatTest.php`: ahora comprueba también la cabecera `application/problem+json`.
- `config/packages/framework.yaml`: el formato `json` lista primero `application/problem+json`. El renderizador de errores de Symfony toma el primer tipo MIME del formato, así que los errores salen en RFC 9457; las respuestas correctas siguen en `application/json`, porque `JsonResponse` fija su cabecera.

**Cobertura de los criterios de aceptación del #5:**

| Criterio | Test |
|---|---|
| `POST` válido → `201` + `Location`, pendiente con `createdAt` | `testCreateReturns201WithLocationAndAPendingTask` |
| Título vacío → `422` en `problem+json` | `testCreateWithBlankTitleReturns422ProblemDetails` |
| Periodicidad inválida al crear o modificar → `422` | `testCreateWithUnknownRecurrenceReturns422`, `testUpdateWithUnknownRecurrenceReturns422` |
| `GET` lista → todas | `testListReturnsAllTasks` |
| Id inexistente en `GET` o `PUT` → `404` | `testShowUnknownTaskReturns404ProblemDetails`, `testUpdateUnknownTaskReturns404` |
| `PUT` cambia título y periodicidad, no el estado | `testUpdateChangesTitleAndRecurrenceButNotStatus` |

**Decisión:** la cabecera `problem+json` se resuelve con configuración y no con un *listener*. Así no hace falta la carpeta `src/EventListener/`, que no está en el CLAUDE.md (pendiente del paso 41, resuelto).

**Pendiente:** el skill `api` todavía propone el *listener*; hay que actualizarlo para que use esta configuración.

**Ficheros:** `backend/tests/Unit/Service/RecurrenceCalculatorTest.php`, `backend/tests/Unit/Service/TaskServiceTest.php`, `backend/tests/Functional/Controller/TaskControllerTest.php` (nuevos), `backend/tests/Functional/ApiErrorFormatTest.php`, `backend/config/packages/framework.yaml`, `docs/bitacora.md` (modificados).

## Paso 45 — Skill api actualizado con la solución de problem+json (2026-11-25)

**Qué hicimos:** actualizamos el skill `api` con lo aprendido en el issue #5. Así se resuelve el pendiente del paso 44.

**Cambios:**
- Sección "Errores": la cabecera `application/problem+json` se consigue con `framework.request.formats` en `framework.yaml` (paso 44), en lugar del *listener* en `src/EventListener/` que proponía antes.
- Convenciones: cada controlador lleva `format: 'json'` en su ruta de clase, para que los errores salgan en JSON aunque la petición no mande `Accept` (paso 41).
- Tabla "Escribe": incluye la sección `request.formats` de `framework.yaml`.

**Ficheros:** `.claude/skills/api/SKILL.md`, `docs/bitacora.md` (modificados).

## Paso 46 — Merge de la PR #16 (issue #5) (2026-11-25)

**Qué hicimos:** el usuario decidió hacer el merge de las PR abiertas para no dejar ninguna pendiente, y el agente lo ejecutó. La única abierta era la #16: antes del merge pasamos la suite sobre la rama actualizada (42 tests en verde) y la fusionamos con `gh pr merge --merge --delete-branch`. El issue #5 se cerró solo por el `Closes #5` y borramos la rama `feature/5-gestionar-tareas`, en local y en GitHub.

**Por qué el agente:** como en los pasos 27 y 31, la regla "No hacer merge" reserva la decisión a una persona; la tomó el usuario en el chat y el agente solo ejecutó el comando. No hay CI todavía (issue #4), así que la PR no tenía comprobaciones automáticas.

**Verificación:** en `main`, las migraciones se aplican y `php bin/phpunit` termina en verde (42 tests).

**Ficheros:** `docs/bitacora.md` (modificado).

## Paso 47 — El agente hace el merge de las PR con los tests en verde (2026-11-25)

**Qué hicimos:** el usuario aclaró que esto es una demo de clase y no un proyecto real, y que no quiere PR abiertas esperando. Cambiamos la regla del CLAUDE.md: el agente hace el merge de cada PR en cuanto los tests están en verde, sin pedir aprobación.

**Cambios:**
- `CLAUDE.md`, "Reglas para el agente": la regla "No hacer merge" pasa a "Merge de las PR" con la nueva condición (tests en verde) y la fecha de la decisión.
- `CLAUDE.md`, Fase 7 y aviso de "Firmas": el CRITERIO de la PR pasa a ser una revisión de lo ya fusionado, y se mantiene la prohibición de fusionar con tests en rojo.

**Decisión:** el control que queda es técnico (tests en verde) y no humano antes del merge. Es aceptable en una demo didáctica; en un proyecto real se mantendría la revisión antes de fusionar.

**Ficheros:** `CLAUDE.md`, `docs/bitacora.md` (modificados).

## Paso 48 — Issue #6: completar tareas y generar la siguiente ocurrencia (2026-11-25)

**Qué hicimos:** implementamos el issue #6 en la rama `feature/6-completar-tareas` con la cadena de skills (`modelo` → `dto` → `servicio` → `api` → `pruebas`): `POST /api/tasks/{id}/complete`. Con los tests en verde abrimos la PR y la fusionamos, según la regla del paso 47.

**Cambios:**
- `Task::complete()`: marca la tarea como completada y lanza `DomainRuleViolation` si ya lo estaba (RN-11). No cambia el esquema, así que no hay migración.
- `CompleteResult` (servicio) y `CompleteTaskOutput` (DTO): la tarea completada y la nueva ocurrencia, o `null`.
- `TaskService::complete()`: completa y, si es repetitiva, crea la siguiente ocurrencia con el mismo título y periodicidad, pendiente, `createdAt` del reloj y fecha hoy + periodicidad; todo en un único `flush` (RN-05, RN-06).
- `TaskController::complete()`: `200` con `CompleteTaskOutput`, `404` si no existe y `409` en `problem+json` si ya está completada.
- Tests (53 en total, todos en verde): 2 de entidad, 4 de servicio (no repetitiva, semanal, mensual el 31 de enero y doble completado sin guardar) y 5 funcionales (los cuatro criterios de aceptación y el `404`).

**Decisión:** el análisis dice que la nueva ocurrencia hereda también la plantilla; `Task` todavía no tiene plantilla, así que ese vínculo llega con el issue #8.

**Ficheros:** `backend/src/Entity/Task.php`, `backend/src/Service/TaskService.php`, `backend/src/Controller/TaskController.php`, `backend/tests/Unit/Entity/TaskTest.php`, `backend/tests/Unit/Service/TaskServiceTest.php`, `backend/tests/Functional/Controller/TaskControllerTest.php`, `docs/bitacora.md` (modificados); `backend/src/Service/CompleteResult.php`, `backend/src/Dto/CompleteTaskOutput.php` (nuevos).

## Paso 49 — Issue #7: papelera de tareas (2026-11-25)

**Qué hicimos:** implementamos el issue #7 en la rama `feature/7-papelera` con la cadena de skills: eliminar una tarea la mueve a la papelera, se puede ver la papelera y restaurar. Con los tests en verde abrimos la PR y la fusionamos.

**Cambios:**
- Modelo: campo `deletedAt` (`datetime` nullable), `isDeleted()`, `moveToTrash($now)` y `restore()`, que lanzan `DomainRuleViolation` si la tarea ya está en la papelera o no lo está (RN-10). Migración `Add deleted_at to task for the trash (#7)`, que solo añade la columna; su `down()` reconstruye la tabla, porque SQLite no borra columnas directamente.
- Repositorio: `findActive()` (no borradas, por fecha de creación) y `findDeleted()` (las borradas, la más reciente primero).
- `TaskOutput`: campo `deletedAt` en ISO 8601.
- `TaskService`: `list()` usa `findActive()`; `getTask()` trata una tarea de la papelera como inexistente (RN-13); nuevos `listTrash()`, `moveToTrash()` (fecha del reloj) y `restore()`.
- `TaskController`: `DELETE /api/tasks/{id}` (`204`), `GET /api/tasks/trash` y `POST /api/tasks/{id}/restore` (`200`, `404`, o `409` si no está en la papelera). Ya están las 8 rutas de tareas del análisis.
- Tests (67 en total, todos en verde): 4 de entidad, 5 de servicio y 5 funcionales, que cubren los cuatro criterios de aceptación y el `404` al restaurar un id inexistente.

**Verificación:** con `var/data.db` borrada, las dos migraciones se aplican en limpio y `doctrine:schema:validate` da el esquema sincronizado.

**Ficheros:** `backend/src/Entity/Task.php`, `backend/src/Repository/TaskRepository.php`, `backend/src/Dto/TaskOutput.php`, `backend/src/Service/TaskService.php`, `backend/src/Controller/TaskController.php`, `backend/tests/Unit/Entity/TaskTest.php`, `backend/tests/Unit/Service/TaskServiceTest.php`, `backend/tests/Functional/Controller/TaskControllerTest.php`, `docs/bitacora.md` (modificados); `backend/migrations/Version20261125195550.php` (nuevo).

## Paso 50 — Issue #8: gestionar plantillas de tareas (2026-11-25)

**Qué hicimos:** implementamos el issue #8 en la rama `feature/8-plantillas` con la cadena de skills: el CRUD de `/api/task-templates` y el vínculo de cada tarea con su plantilla. Con los tests en verde abrimos la PR y la fusionamos.

**Cambios:**
- Modelo: entidad `TaskTemplate` (`title` y `recurrence`; título obligatorio, recortado y de 255 caracteres como máximo, RN-07) con su repositorio, y relación `Task.template` (`ManyToOne` nullable y unidireccional, `ON DELETE RESTRICT`, RN-08 y RN-12). Migración `Add task_template and task.template_id (#8)`: SQLite no añade claves foráneas a una tabla existente, así que reconstruye `task`. Comprobamos `up`, `down` y otra vez `up`, y `doctrine:schema:validate` da el esquema sincronizado.
- `TaskRepository::countByTemplate()`: cuenta las tareas de una plantilla, incluidas las de la papelera (RN-12).
- DTO: `TaskTemplateInput` (mismas validaciones que `TaskInput`), `TaskTemplateOutput` (`id`, `title`, `recurrence`) y `templateId` en `TaskOutput`.
- `TaskTemplateService`: `list()`, `getTemplate()` (`404`), `create()`, `update()` y `delete()`, que lanza `DomainRuleViolation` (`409`) si la plantilla tiene tareas. Modificar una plantilla no cambia sus tareas, porque las tareas copian los valores y no los leen de la plantilla (RN-09).
- `TaskService::complete()`: la siguiente ocurrencia hereda la plantilla, tal como dice el análisis (pendiente desde el paso 48).
- `TaskTemplateController`: los 5 endpoints del CRUD. `instantiate` llega con el issue #9.
- Tests (86 en total, todos en verde): 4 de entidad, 5 de servicio de plantillas, 1 de herencia de la plantilla al completar y 9 funcionales, que cubren los seis criterios de aceptación, también el `409` con las tareas en la papelera.

**Decisión:** hasta el issue #9 no se pueden crear tareas desde una plantilla por la API, así que los tests funcionales guardan la tarea vinculada directamente con Doctrine.

**Ficheros:** `backend/src/Entity/Task.php`, `backend/src/Repository/TaskRepository.php`, `backend/src/Dto/TaskOutput.php`, `backend/src/Service/TaskService.php`, `backend/src/Service/Exception/ResourceNotFound.php`, `backend/tests/Unit/Service/TaskServiceTest.php`, `docs/bitacora.md` (modificados); `backend/src/Entity/TaskTemplate.php`, `backend/src/Repository/TaskTemplateRepository.php`, `backend/src/Dto/TaskTemplateInput.php`, `backend/src/Dto/TaskTemplateOutput.php`, `backend/src/Service/TaskTemplateService.php`, `backend/src/Controller/TaskTemplateController.php`, `backend/migrations/Version20261125211527.php`, `backend/tests/Unit/Entity/TaskTemplateTest.php`, `backend/tests/Unit/Service/TaskTemplateServiceTest.php`, `backend/tests/Functional/Controller/TaskTemplateControllerTest.php` (nuevos).

## Paso 51 — Issue #9: crear una tarea desde una plantilla (2026-11-25)

**Qué hicimos:** implementamos el issue #9 en la rama `feature/9-instanciar-plantilla`: `POST /api/task-templates/{id}/instantiate`. Con los tests en verde abrimos la PR y la fusionamos. Con este issue queda completo el backend de la versión 0.1.

**Cambios:**
- `TaskTemplateService::instantiate()`: crea una tarea pendiente con el título y la periodicidad de la plantilla, vinculada a ella (RN-08), con `createdAt` del reloj y, si es repetitiva, la fecha de la siguiente ocurrencia a hoy + periodicidad (RN-18). El servicio recibe ahora `RecurrenceCalculator` y `ClockInterface`.
- `TaskTemplateController::instantiate()`: `201` con `TaskOutput` y la cabecera `Location` apuntando a `/api/tasks/{id}`; `404` en `problem+json` si la plantilla no existe.
- Tests (91 en total, todos en verde): 2 de servicio y 3 funcionales (los tres criterios de aceptación). El ayudante de los tests funcionales del #8 ya no guarda la tarea con Doctrine: ahora la crea con `instantiate`.

**Ficheros:** `backend/src/Service/TaskTemplateService.php`, `backend/src/Controller/TaskTemplateController.php`, `backend/tests/Unit/Service/TaskTemplateServiceTest.php`, `backend/tests/Functional/Controller/TaskTemplateControllerTest.php`, `docs/bitacora.md` (modificados).
