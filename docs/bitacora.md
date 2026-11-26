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

## Paso 52 — Issue #4: CI con GitHub Actions y plantilla de PR (2026-11-25)

**Qué hicimos:** trabajamos el issue #4 en la rama `feature/4-ci`: PHPStan (nivel 6), PHP-CS-Fixer, la plantilla de PR y el workflow de GitHub Actions. GitHub rechazó el push del workflow porque el token de `gh` no tiene el permiso `workflow`. Como la CI no hace falta para el curso, hispafox decidió no ampliar el permiso: el workflow queda aparcado en `.github/ci-pendiente.yml` y fusionamos el resto. El issue #4 sigue abierto hasta activarlo.

**Cambios:**
- `.github/ci-pendiente.yml` (el futuro `.github/workflows/ci.yml`), con dos jobs:
  - `backend`: PHP 8.4 con SQLite, `composer install` con caché, PHP-CS-Fixer en modo `--dry-run`, PHPStan, `doctrine:schema:validate` y PHPUnit.
  - `frontend`: ejecuta `npm ci` y los tests de Angular en cuanto exista `frontend/package.json` (issue #3); hasta entonces solo informa de que no hay nada que probar.
- `.github/pull_request_template.md`: `Closes #<nº>`, qué incluye, resumen de tests y comprobaciones.
- Backend: PHPStan con las extensiones de Symfony y Doctrine incluidas a mano en `phpstan.dist.neon` (sin el plugin `extension-installer`), y PHP-CS-Fixer con las reglas `@Symfony` (receta de Flex). PHPStan encontró una aserción redundante en `TaskTest` y PHP-CS-Fixer, un PHPDoc mal alineado; los corregimos.
- `backend/.gitattributes` con `eol=lf`: en Windows los ficheros estaban en CRLF y PHP-CS-Fixer los marcaba todos. El repositorio ya los guardaba en LF, así que su contenido no cambia, y de paso desaparece el `reference.php` que salía modificado solo por los finales de línea.
- `scripts/backend-test.ps1` ejecuta también PHP-CS-Fixer y PHPStan, para comprobar en local lo mismo que la CI.
- `CLAUDE.md`: `.github/` marcado como existente, y la CI de la Fase 7 sigue sin marcar, con la nota de dónde está el workflow.

**Para activar la CI:** `gh auth refresh -h github.com -s workflow`, mover `.github/ci-pendiente.yml` a `.github/workflows/ci.yml` (quitando las tres líneas del principio) y subirlo.

**Ficheros:** `backend/composer.json`, `backend/composer.lock`, `backend/symfony.lock`, `backend/.gitignore`, `backend/src/Service/TaskService.php`, `backend/tests/Unit/Entity/TaskTest.php`, `scripts/backend-test.ps1`, `CLAUDE.md`, `docs/bitacora.md` (modificados); `.github/ci-pendiente.yml`, `.github/pull_request_template.md`, `backend/phpstan.dist.neon`, `backend/.php-cs-fixer.dist.php`, `backend/.gitattributes` (nuevos).

## Paso 53 — Skill `frontend` (2026-11-25)

**Qué hicimos:** creamos el skill `frontend`, el último de la cadena que faltaba, para poder abordar los issues de Angular (#3, #10, #11 y #12). Antes cerramos lo que se podía del issue #4 (PR #21): PHPStan, PHP-CS-Fixer y la plantilla de PR ya están en `main`, y el workflow queda aparcado en `.github/ci-pendiente.yml`, porque el token de `gh` no tiene el permiso `workflow` y la CI no hace falta para el curso. El issue #4 sigue abierto, con un comentario que explica cómo activarlo.

**Cambios:**
- `.claude/skills/frontend/SKILL.md`, con el mismo formato que los demás (tabla Lee/Escribe/No toca/Prerrequisito/Verificación/Entregable) y cuatro modos:
  - `proyecto`: el issue #3, con `ng new`, carpetas `core/`, `shared/` y `features/`, proxy a la API, interceptor de errores y scripts de PowerShell.
  - `crear`, `actualizar` y `revisar`.
- Convenciones del skill: componentes standalone con signals, `inject()` y el control de flujo nuevo (`@if`, `@for`); formularios reactivos tipados con las mismas validaciones del título que el backend; modelos copiados de los DTO de salida; un servicio HTTP por recurso; el interceptor traduce `problem+json` (`422`, `404` y `409`) a mensajes en castellano; tests con `HttpTestingController` y uno por criterio de aceptación.
- El skill usa el *test runner* que genere el CLI de Angular (Vitest en las versiones recientes) y pide anotar la diferencia con el "Jest/Karma" del CLAUDE.md cuando se cree el proyecto.
- Skills `api` y `modelo`: decían que el merge lo decide una persona; ahora remiten a la regla de merge del paso 47.
- `CLAUDE.md` (estructura de carpetas) y `README.md` (cadena de skills completa).

**Ficheros:** `.claude/skills/api/SKILL.md`, `.claude/skills/modelo/SKILL.md`, `CLAUDE.md`, `README.md`, `docs/bitacora.md` (modificados); `.claude/skills/frontend/SKILL.md` (nuevo).

## Paso 54 — Issue #3: proyecto Angular con proxy a la API (2026-11-25)

**Qué hicimos:** creamos el proyecto Angular en `frontend/` con el skill `frontend` en modo `proyecto`, en la rama `feature/3-proyecto-angular`. Con los tests en verde y el proxy comprobado contra el backend, abrimos la PR y la fusionamos.

**Cambios:**
- `ng new frontend` con Angular 22: TypeScript estricto, rutas, CSS, sin SSR y sin repositorio Git propio. El CLI trae **Vitest** como *test runner*, así que corregimos el "Jest/Karma" del CLAUDE.md. `npm test` ejecuta `ng test --watch=false`, una sola pasada.
- `proxy.conf.json`, enlazado en `angular.json`: `/api` va a `http://127.0.0.1:8000`, sin CORS.
- `core/`:
  - `messages/message.service.ts`: un *signal* con el último error.
  - `interceptors/error.interceptor.ts`: traduce `problem+json` a mensajes en castellano (`422` con las violaciones, `404`, `409` con el `detail`, sin conexión y genérico) y relanza el error.
  - `models/problem-details.ts`.
- Carpetas `core/api/`, `shared/` y `features/` preparadas para las pantallas.
- `app.config.ts` con `provideHttpClient(withInterceptors([errorInterceptor]))` y locale `es`. El componente raíz muestra la cabecera "Lista de tareas", el aviso de error con su botón de cerrar y el `router-outlet`. Quitamos la página de ejemplo del CLI y `.vscode/`.
- Tests (7, en verde): 5 del interceptor (`422`, `409`, `404`, error genérico y que relanza el error) y 2 del componente raíz.
- Scripts `frontend-setup.ps1`, `frontend-start.ps1` y `frontend-test.ps1` (tests y build), apuntados en el CLAUDE.md y el README. En `.github/ci-pendiente.yml`, el job de frontend usa `npm test`, porque Vitest no necesita navegador.

**Verificación:** `npm run build` sin errores. Con el backend y `ng serve` levantados, `GET http://localhost:4200/api/tasks` responde `200` a través del proxy, y un `404` llega con `application/problem+json`.

**Ficheros:** `CLAUDE.md`, `README.md`, `.github/ci-pendiente.yml`, `docs/bitacora.md` (modificados); `frontend/` (nuevo, sin `node_modules/`), `scripts/frontend-setup.ps1`, `scripts/frontend-start.ps1`, `scripts/frontend-test.ps1` (nuevos).

## Paso 55 — Skill orquestador `nueva-feature` (2026-11-25)

**Qué hicimos:** creamos el skill `nueva-feature`, el orquestador que describía `docs/skills-orquestacion.md` y que todavía faltaba. Recibe una petición en lenguaje natural o un issue, detecta qué capas toca y encadena los skills de esas capas hasta la PR fusionada, sin implementar nada por su cuenta. Lo usará el agente orquestador que hispafox creará en clase; los agentes de los documentos de arquitectura no se crean ahora.

**Cambios:**
- `.claude/skills/nueva-feature/SKILL.md`, en siete pasos:
  1. Entender la petición: tipo, fuera de alcance y preguntas al PO.
  2. Detectar el alcance con una tabla capa → skill → señales y reglas de propagación entre capas.
  3. Presentar el plan, que es un punto de control (`/nueva-feature plan …` termina aquí).
  4. Preparar el terreno: firmas, issue y rama.
  5. Ejecutar la cadena cargando cada skill con la herramienta `Skill`.
  6. Verificar el conjunto, con un bucle de corrección de 3 intentos como máximo.
  7. Cerrar: bitácora, commit, PR y merge con los tests en verde.
- Incluye ejemplos de alcance: un issue solo de frontend, una funcionalidad nueva que cruza todas las capas, un bug, un cambio técnico de contrato y una petición fuera de alcance.
- `CLAUDE.md` (estructura de carpetas) y `README.md` (cadena de skills).

**Ficheros:** `CLAUDE.md`, `README.md`, `docs/bitacora.md` (modificados); `.claude/skills/nueva-feature/SKILL.md` (nuevo).

## Paso 56 — Siete agentes de apoyo con sus comandos, y firmas en modo aviso (2026-11-25)

**Qué hicimos:** creamos y probamos siete agentes de apoyo en `.claude/agents/`, cada uno con un comando para lanzarlo por separado (`.claude/commands/`). Son agentes adicionales a los de `docs/ARQUITECTURA-AGENTES*.md`: esos (orquestador, planificador, implementadores, verificador…) los crea hispafox en clase, y estos quedan como base para incluir alguno en el flujo. No tocamos el código de `backend/` ni `frontend/`. También pasamos las firmas a modo aviso permanente, para que no bloqueen la formación.

**Agentes y comandos:**

| Comando | Agente | Qué hace | Prueba |
|---|---|---|---|
| `/refinar-backlog` | `refinador-backlog` | Propone issues Dado/Cuando/Entonces y preguntas cerradas al PO, sin crearlos | v0.2: el issue #15 no está listo, con 9 preguntas para el PO y 2 borradores (backend y frontend) |
| `/revisar-candado` | `guardian-candado` | Comprueba un cambio contra el CLAUDE.md: CUMPLE o NO CUMPLE | PR #22: CUMPLE, con un aviso (faltaba la fila de firmas del cambio de stack, ya añadida) |
| `/trazar-reglas` | `trazador-reglas` | Matriz RN/F → análisis → issue → código → test | RN-01 a RN-13 y RN-18 cubiertas en el backend; el frontend, pendiente (#10 a #12); la 0.2, fuera de la versión |
| `/probar-qa` | `qa-exploratorio` | Levanta el backend con `var/qa.db` en el puerto 8001 y prueba por HTTP | 54 pruebas de #8 y #9: 51 OK y 3 hallazgos |
| `/revisar-seguridad` | `revisor-seguridad` | Revisión OWASP, `composer audit` y `npm audit` | Sin vulnerabilidades en dependencias; `APP_SECRET` real en `.env.dev` y `APP_ENV=dev` por defecto (media) |
| `/disenar-ui` | `disenador-ui` | Especificación visual en `docs/diseno/` | `docs/diseno/pantallas-tareas.md` para el #10, con contraste AA |
| `/presentar` | `presentador` | Guion de la demo en `docs/presentaciones/` | `docs/presentaciones/2026-11-26-clase-agentes.md` (10 diapositivas, unos 15 minutos) |

Primero los probamos con subagentes genéricos que leían cada fichero de agente, porque la sesión carga los agentes al arrancar. Cuando la sesión los cargó, probamos un comando de punta a punta: `/trazar-reglas RN-12` lanzó el agente real `trazador-reglas`.

**Ajustes tras las pruebas:**
- `qa-exploratorio`: `export DATABASE_URL` no llegaba a `php -S`, porque el `php.ini` tiene `variables_order = GPCS`, y el primer `POST` de la prueba escribió una plantilla "Probe" en `var/data.db`. Ahora arranca con `php -d variables_order=EGPCS` y comprueba que `var/data.db` no cambia tras la primera escritura. Además pide resumir las trazas de `dev`, aclara que `recurrence` va en minúsculas y prueba con y sin cabecera `Accept`.
- `refinador-backlog`: puede marcar con `(pregunta N)` los criterios que dependen de una pregunta sin responder, y la línea final cita solo las preguntas que bloquean.

**Hallazgos de los agentes que quedan pendientes** (no se tocó código):
- QA: un id no numérico (`/api/tasks/abc`) responde `404` en HTML, no en `problem+json`, si la petición no manda `Accept: application/json`.
- QA: un `PUT` sin `recurrence` la pone a `null` (reemplazo total) y los campos desconocidos se ignoran sin avisar. Son decisiones a confirmar en el análisis.
- Seguridad: `APP_SECRET` real versionado en `backend/.env.dev`; `APP_ENV=dev` por defecto. Para debatir: en `prod`, el `detail` del `409` es solo "Conflict", así que el aviso del frontend perdería la explicación.
- Trazabilidad: RN-18 no la cita ningún issue, y `GET /api/tasks/trash` no tiene un test propio.

**Firmas en modo aviso:** el CLAUDE.md sustituye la "regla de bloqueo suspendida" por un modo aviso permanente. Si falta una firma, el agente avisa en una línea y sigue. Siguen siendo obligatorios: issue, tests en verde para la PR y para el merge. Lo aplicamos a los skills `analisis-diseno`, `modelo`, `dto`, `servicio`, `api`, `frontend` y `nueva-feature`, y al agente `guardian-candado` (las firmas son siempre un aviso, nunca bloqueantes).

**Ficheros:** `CLAUDE.md`, `README.md`, `docs/bitacora.md` y los `SKILL.md` de `analisis-diseno`, `modelo`, `dto`, `servicio`, `api`, `frontend` y `nueva-feature` (modificados); `.claude/agents/` (7 agentes), `.claude/commands/` (7 comandos), `docs/diseno/pantallas-tareas.md` y `docs/presentaciones/2026-11-26-clase-agentes.md` (nuevos).

## Paso 57 — Propuestas de skills y agentes nuevos (2026-11-25)

**Qué hicimos:** a petición de hispafox, escribimos dos propuestas detalladas para ampliar el sistema. Son solo documentos: no se ha creado ningún skill ni agente de estas listas.

**Cambios:**
- `docs/propuesta-skills.md`, con 17 skills: `github-flow`, `backlog-issues`, `datos-demo`, `firmas`, `depurar`, `e2e-playwright`, `documentacion-api`, `actualizar-documentacion`, `accesibilidad`, `ci-github-actions`, `refactor-seguro`, `release`, `aprendizajes`, `entorno-docker`, `migrar-postgresql`, `manual-usuario` y `ejercicios-clase`. Incluye una tabla resumen con prioridad y esfuerzo, una ficha por skill (propósito, qué lee, qué escribe, qué no toca, prerrequisito, modos, pasos, verificación, entregable, riesgos y valor didáctico), un diagrama de cómo encajan en la cadena y el orden recomendado.
- `docs/propuesta-agentes.md`, con 15 agentes: `triaje-bugs`, `evaluador-agentes`, `mentor`, `cronista`, `analista-funcional`, `arquitecto`, `tester-e2e`, `revisor-accesibilidad`, `documentador-tecnico`, `revisor-codigo`, `gestor-dependencias`, `release-manager`, `devops`, `migrador-bd` y `examinador`. Cada uno tiene comando propuesto y una ficha (propósito, cuándo, entradas, salidas, herramientas, qué puede editar, skills, relaciones, reglas, criterio de éxito, una prueba concreta y valor didáctico). Incluye además el diagrama del flujo completo con los agentes de la arquitectura, los de apoyo y los propuestos, el orden recomendado y una plantilla para crearlos.
- Los dos diagramas Mermaid se han validado.

**Ficheros:** `docs/bitacora.md` (modificado); `docs/propuesta-skills.md` y `docs/propuesta-agentes.md` (nuevos).

## Paso 58 — Skill `ui-ux-pro-max` instalado en el repositorio (2026-11-26)

**Qué hicimos:** instalamos el skill completo `ui-ux-pro-max`, solo en este repositorio y no a nivel global, con la aprobación de hispafox. Hasta ahora solo estaba su ficha de catálogo, sin datos ni scripts. También borramos de `var/data.db` la plantilla "Probe" que dejó la prueba del agente QA (paso 56); no tenía tareas.

**Cambios:**
- Origen: <https://github.com/nextlevelbuilder/ui-ux-pro-max-skill>, commit `b73ee96`, licencia MIT. Lo descargamos en una carpeta temporal vacía y revisamos los scripts antes de instalarlo: no hacen llamadas de red ni ejecutan comandos externos, y solo escriben ficheros temporales o, si se pide, un sistema de diseño.
- `.claude/skills/ui-ux-pro-max/`: `SKILL.md`, `data/` (estilos, paletas, tipografías, 141 guías de UX y guías por stack, Angular incluido), `references/`, `scripts/`, el `LICENSE` del original y un `ORIGEN.md` con la procedencia y cómo ejecutarlo desde la raíz.
- Pruebas: `--design-system` para "task list productivity app" genera un sistema de diseño completo (estilo, colores, tipografía…), y `--stack angular` devuelve guías de Angular 22, por ejemplo cómo mostrar los errores de validación.
- Agente `disenador-ui`: comando exacto del script en este repositorio y comprobación del contraste antes de adoptar la paleta. `CLAUDE.md` y `docs/propuesta-skills.md` actualizados.

**Ficheros:** `.claude/agents/disenador-ui.md`, `CLAUDE.md`, `docs/propuesta-skills.md`, `docs/bitacora.md` (modificados); `.claude/skills/ui-ux-pro-max/` (nuevo, 84 ficheros).

## Paso 59 — Lista de tareas del CLAUDE.md al día (2026-11-26)

**Qué hicimos:** pusimos al día la "Lista de tareas" del CLAUDE.md antes de la clase. Tenía sin marcar trabajo ya terminado de las Fases 4, 5 y 7.

**Cambios:**
- Marcadas como hechas, con una nota de qué las cubre:
  - Fase 0: el MCP de GitHub, sustituido por la CLI `gh`.
  - Fase 4: entidades y migraciones, servicios y API, validación y errores.
  - Fase 5: tests unitarios, tests funcionales y criterios de aceptación cubiertos.
  - Fase 7: una rama por issue y PR con `Closes #<nº>`.
- Anotado lo que falta en las tareas abiertas: el tablero de GitHub Projects (permiso `project` del token), el entorno Docker, los servicios HTTP y los tests de las pantallas (#10 a #12) y la CI aparcada.
- Nueva **Fase 8 — Agentes y skills**: hechos los skills por capa, el orquestador `nueva-feature`, los agentes de apoyo y `ui-ux-pro-max`. Pendientes: el agente orquestador y sus dependientes (en clase) y decidir qué propuestas se crean.
- Los CRITERIO siguen sin marcar: son firmas, y solo las da una persona.

**Ficheros:** `CLAUDE.md`, `docs/bitacora.md` (modificados).

## Paso 60 — Guion del lab del equipo de agentes (2026-11-26)

**Qué hicimos:** preparamos el guion de la clase para crear el agente orquestador y los que dependen de él, como un lab con una demo de principio a fin. Los agentes **no** se crean en `.claude/agents/`: los crea hispafox en clase. Solo hay una solución de referencia aparte, como plan B.

**Cambios:**
- `docs/formacion/lab-agentes-orquestador.md`, de unas 2 horas y 15 minutos:
  - Preparación y conceptos: skill, agente y comando; anatomía de un agente.
  - Cuatro labs con especificación, pasos, prueba con resultado esperado y una pregunta para el grupo:
    1. `verificador`
    2. `planificador`
    3. `implementador-backend` e `implementador-frontend`
    4. `orquestador` con su comando `/orquestar`
  - Demo `/orquestar #10` minuto a minuto, con los datos de ejemplo que hay que cargar antes y una tabla de plan B.
  - Extensiones, preguntas de repaso y checklist de evaluación.
- `docs/formacion/lab-agentes-orquestador-solucion.md`: el contenido completo de los cinco agentes y del comando `/orquestar`, listo para copiar si no da tiempo.
- Basado en `docs/ARQUITECTURA-AGENTES-V2.md`: plan en `docs/planes/`, implementación por capas con los skills, verificador con un máximo de 3 vueltas, y además `guardian-candado` antes del cierre y la regla de merge del CLAUDE.md.

**Comprobado en la documentación oficial de Claude Code** (consultada con el agente `claude-code-guide`):
- Un subagente sí puede lanzar otros, hasta tres niveles por defecto (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). El orquestador va en la conversación principal para poder preguntar en los CRITERIO, no por una limitación técnica. Corregimos el primer borrador del lab, que decía lo contrario.
- `claude --agent <nombre>` existe, y también la clave `"agent"` en `.claude/settings.json`.
- `model: inherit` es válido y la herramienta para lanzar subagentes se llama `Agent`.
- Los agentes nuevos se detectan sin reiniciar la sesión. En el paso 56 los vimos aparecer al cabo de un rato, no al instante.

**Ficheros:** `docs/bitacora.md` (modificado); `docs/formacion/lab-agentes-orquestador.md` y `docs/formacion/lab-agentes-orquestador-solucion.md` (nuevos).

## Paso 61 — Ensayo de la demo `/orquestar #10` (2026-11-26)

**Qué hicimos:** ensayamos la demo del lab en ramas locales, con los agentes de la solución de referencia copiados tal cual. No hicimos push, PR ni merge: el issue #10 sigue abierto para hacerlo en clase. El backend usó una base de datos propia (`var/ensayo.db`, borrada al terminar); `var/data.db` no se tocó.

**Resultado:**

| Paso | Agente | Tiempo | Resultado |
|---|---|---|---|
| Plan | planificador | 40 s | Plan con el backend descartado y sin preguntas de negocio |
| Implementar | implementador-frontend | 5,5 min | Pantallas, servicio, pipe y rutas; 42 tests de Vitest y build en verde |
| Verificar | verificador | 40 s | `APROBADO` a la primera |
| Revisar reglas | guardian-candado | 25 s | `CUMPLE` |
| Pantallas | a mano, en el navegador | 3 min | Los cinco criterios del issue funcionan |

**Lo que falló o no encajaba, y se corrigió en el guion y la solución:**
1. Los agentes nuevos tardaron unos 7 minutos en aparecer en la sesión; el comando, al momento. Mientras tanto, el planificador y el implementador se ensayaron como `general-purpose` con su fichero como instrucciones.
2. El id de la plantilla de los datos de ejemplo estaba escrito a mano y daba 404 con `data.db`. Ahora se toma de la respuesta, y se añade una tarea completada.
3. El verificador y el guardián miraban `main..HEAD`, pero el commit llega al final del flujo. Ahora revisan también los cambios sin commit.
4. El planificador asignó los tests a un agente inexistente (`implementador-pruebas`). Ahora solo puede usar los agentes que existen.
5. Los skills terminan con bitácora, commit y PR, lo que choca con los implementadores. Ahora se les dice que se salten esa parte.

**Ramas locales (sin push, no fusionar):** `ensayo/lab-orquestador` (los agentes) y `ensayo/10-pantallas-tareas` (el resultado, como plan B si la demo falla).

**Lo que el ensayo no cubrió:**
- El `implementador-backend` no llegó a trabajar, porque el #10 es solo de frontend.
- `/orquestar` no se lanzó como comando: la sesión principal hizo de orquestador siguiendo su fichero paso a paso.
- Los agentes no se volvieron a ensayar después de las correcciones; los datos de ejemplo nuevos sí se probaron.

**Ficheros:** `docs/formacion/lab-agentes-orquestador.md`, `docs/formacion/lab-agentes-orquestador-solucion.md` y `docs/bitacora.md` (modificados).

## Paso 62 — Errores en problem+json para rutas de la API que no existen (#23) (2026-11-26)

**Qué hicimos:** arreglamos el fallo que encontró el agente `qa-exploratorio`: sin cabecera `Accept`, los 404 y 405 de rutas de `/api` que no existen salían en HTML. Lo hicimos como **segundo ensayo del equipo de agentes**, esta vez de verdad: `/orquestar #23` lanzado como comando, con los agentes ya corregidos, creados sin commit en `.claude/agents/` como se hará en clase, y el implementador de backend con la cadena de skills.

**Cambios:**
- `ApiJsonFormatSubscriber` (`kernel.request`, prioridad 33, antes del router): fija `_format=json` para `/api` y `/api/*`, así que cualquier error de la API sale en `application/problem+json`. Fuera de `/api` no cambia nada.
- 4 tests funcionales nuevos en `ApiErrorFormatTest`, uno por criterio: ruta inexistente, `/api/tasks/abc`, `PATCH` (405 con `Allow`) y una ruta fuera de `/api`. Ahora hay 95 tests y 267 aserciones.
- `docs/analisis.md` §4 y §8: el 404 de rutas sin coincidencia, el 405 y la fila del test. Sigue pendiente de nueva firma; anotado en el CLAUDE.md.
- Plan en `docs/planes/plan-23-errores-problem-json.md`.

**Agentes y veredictos:**

| Agente | Tiempo | Resultado |
|---|---|---|
| planificador | 30 s | Plan: capa `api` y pruebas; frontend descartado |
| implementador-backend | 2,5 min | Skills `analisis-diseno`, `api` y `pruebas`; 95 tests en verde |
| verificador | 20 s | `APROBADO` a la primera |
| guardian-candado | 25 s | `CUMPLE` |

**Lo que salió en el ensayo:**
- Ningún agente del equipo podía actualizar el análisis: el planificador solo escribe en `docs/planes/`, el orquestador no edita y el implementador solo toca `backend/`. En el ensayo se dejó que el implementador lo hiciera con `analisis-diseno`, y así queda en la solución.
- El skill `api` decía "no hace falta un listener", y aquí hacía falta. Se corrige en el skill.
- El CLAUDE.md no cita el `405` en su lista de códigos. Es una decisión del candado, así que queda propuesto para que lo apruebe hispafox.

**Ficheros:** `backend/src/EventListener/ApiJsonFormatSubscriber.php`, `docs/planes/plan-23-errores-problem-json.md` (nuevos); `backend/src/Controller/TaskController.php`, `backend/src/Controller/TaskTemplateController.php`, `backend/tests/Functional/ApiErrorFormatTest.php`, `docs/analisis.md`, `CLAUDE.md` y `docs/bitacora.md` (modificados).

## Paso 63 — Correcciones del segundo ensayo y planes B (2026-11-26)

**Qué hicimos:** aplicamos lo aprendido en el segundo ensayo (paso 62) y ordenamos los planes B de la clase.

**Cambios:**
- **Skills de capa** (antes del ensayo, commit aparte): su apartado "Entrega" ya no cierra por su cuenta cuando los carga un orquestador, para que haya un solo cierre. `nueva-feature` también lo dice en su paso 5. Se quitaron dos restos de la "regla de bloqueo" de firmas, en `analisis-diseno` y `modelo`.
- **Skill `api`:** explica que `format: 'json'` solo vale cuando la ruta coincide, y que el resto lo cubre `ApiJsonFormatSubscriber` (#23).
- **Agentes de la solución:** los implementadores pueden tocar `docs/analisis.md` con `analisis-diseno` si el plan lo pide, y el planificador asigna ese paso al implementador, nunca al orquestador. El planificador usa el modo `plan` de `nueva-feature`.
- **Copia de referencia** de los agentes en `docs/formacion/agentes-referencia/`: ficheros listos para copiar, sincronizados con la solución.
- **Guion:** sección del segundo ensayo y tabla de **planes B**: la carpeta de referencia, la solución en texto, la rama `ensayo/10-pantallas-tareas` (pantallas ya hechas) y la rama `ensayo/lab-orquestador` (primera versión de los agentes). Se mantienen las dos ramas.
- Los agentes temporales del ensayo se quitaron de `.claude/agents/` y `.claude/commands/`: siguen sin existir en el repositorio hasta la clase.

**Pendiente:** que hispafox apruebe añadir el `405` a la lista de códigos del CLAUDE.md (candado). Lo aprobó y se hizo en el paso 64.

**Ficheros:** `.claude/skills/api/SKILL.md`, `docs/formacion/lab-agentes-orquestador.md`, `docs/formacion/lab-agentes-orquestador-solucion.md`, `docs/formacion/agentes-referencia/` y `docs/bitacora.md` (modificados).

## Paso 64 — Código 405 en las convenciones de la API del CLAUDE.md (2026-11-26)

**Qué hicimos:** con la aprobación de hispafox, añadimos el `405` (método no permitido, con cabecera `Allow`) a la lista de códigos de la sección "API REST" del CLAUDE.md. El código ya lo devolvía Symfony y desde el #23 sale en `problem+json`; el análisis lo documentaba desde el paso 62, pero el candado no lo citaba.

**Cambios:**
- `CLAUDE.md`, "API REST": `405` en la lista de códigos.
- "Pendientes de firma": nueva fila para este cambio del CLAUDE.md.

**Ficheros:** `CLAUDE.md` y `docs/bitacora.md` (modificados).

## Paso 65 — Presentación de la clase con el agente presentador y el skill pptx (2026-11-26)

**Qué hicimos:** preparamos la presentación de apertura de la clase (unos 20 minutos, 10 diapositivas) que desemboca en el lab.
- El agente `presentador` rehízo el guion con los pasos 1 a 64. El anterior era de una prueba de ayer y llegaba al paso 55.
- Con el skill `pptx` generamos el PowerPoint.

**Cambios:**
- `docs/presentaciones/2026-11-26-clase-agentes.md`: guion con diapositivas, notas del orador, una demo corta (`/revisar-candado #24`) y una tabla de cifras con su fuente.
- `docs/presentaciones/2026-11-26-clase-agentes.pptx`: las 10 diapositivas con las notas del orador.
  - Se generó con pptxgenjs, instalado con permiso en la carpeta temporal de la sesión, no en el repositorio.
  - Hubo tres pasadas de revisión visual con subagentes sobre imágenes exportadas desde PowerPoint. Se corrigieron títulos que se montaban, números de Georgia a distinta altura (ahora Cambria), huecos, contraste y textos.
- Cifras comprobadas contra GitHub y la bitácora: 14 issues (5 abiertos), 10 PR fusionadas, 95 tests y 9 firmas pendientes.
- Corregido "unos 8 minutos" de agentes del primer ensayo: eran 435 s, unos 7 minutos (guion del lab y presentación).
- Corregidas dos incoherencias que encontró el presentador: el guion del lab decía 91 tests (son 95) y el `README.md` decía que el merge lo decide una persona (el `CLAUDE.md` dice que lo hace el agente con los tests en verde).

**Licencias:** los skills `docx`, `pdf`, `pptx` y `xlsx` de `.claude/skills/` son de Anthropic, con todos los derechos reservados, y su licencia prohíbe distribuirlos. Siguen sin añadir a Git, porque el repositorio es público. Esta sesión también los tiene como plugin oficial (`anthropic-skills:*`).

**Ficheros:** `docs/presentaciones/2026-11-26-clase-agentes.pptx` (nuevo); `docs/presentaciones/2026-11-26-clase-agentes.md`, `docs/formacion/lab-agentes-orquestador.md`, `README.md` y `docs/bitacora.md` (modificados).

## Paso 66 — Presentación extendida de la clase (2026-11-26)

**Qué hicimos:** preparamos una versión extendida, "con todo lujo de detalles", de la presentación de la clase: 40 diapositivas en 12 secciones, unos 55 minutos con la demo en vivo, más la portada.

**Cambios:**
- `docs/presentaciones/2026-11-26-clase-agentes-extendida.md`: guion del agente `presentador`.
  - Una diapositiva separadora por sección.
  - Extractos reales de código: `CLAUDE.md`, el issue #6, `ApiJsonFormatSubscriber`, `ApiErrorFormatTest`, un `SKILL.md` y el frontmatter de `guardian-candado`.
  - Una diapositiva por agente de apoyo con su resultado real.
  - Los dos ensayos con datos y los 7 fallos con su corrección.
  - Tabla de cifras con su fuente.
- `docs/presentaciones/img/`: dos capturas reales de las pantallas del primer ensayo, la lista y el formulario con el error.
  - Se sacaron con la rama `ensayo/10-pantallas-tareas` en un *worktree* aparte y una base de datos de usar y tirar, con Edge sin ventana.
  - Los datos de ejemplo se cargaron con el bloque del guion del lab, que así quedó probado otra vez.
- `docs/presentaciones/2026-11-26-clase-agentes-extendida.pptx`: el PowerPoint, generado con el skill `pptx` (pptxgenjs).
  - Un script lee el guion en Markdown y aplica a cada diapositiva la plantilla de su tipo de visual: código, tabla, diagrama, cifras o captura.
  - Se revisó en tres pasadas visuales, dos de ellas con subagentes en paralelo.
  - Se corrigieron una tabla que se salía, columnas que partían rutas, código demasiado pequeño, capturas ilegibles (ahora recortadas), la numeración (1 a 40) y viñetas de color distinto.
  - En las diapositivas de código y de tablas largas se dejan 3 puntos y el resto pasa a las notas del orador.

**Avisos:**
- En la diapositiva 22, la fila de RN-12 es la traza esperada según el análisis y el plan de tests, no la salida literal del agente. La diapositiva lo dice; se puede regenerar con `/trazar-reglas RN-12`.
- Al preparar las capturas aparecieron dos servidores `ng serve` del primer ensayo que seguían vivos (puertos 4200 y 4210): el `TaskStop` cerraba la consola, pero no el proceso `node`. Se pararon.
- Una sustitución de texto en el guion cambió por error cinco `: ` entre dos fragmentos de código; se restauraron.

**Ficheros:** `docs/presentaciones/2026-11-26-clase-agentes-extendida.md`, `docs/presentaciones/2026-11-26-clase-agentes-extendida.pptx`, `docs/presentaciones/img/captura-lista.png` y `docs/presentaciones/img/captura-formulario.png` (nuevos); `docs/bitacora.md` (modificado).

## Paso 67 — Presentación de toda la bitácora (2026-11-26)

**Qué hicimos:** preparamos una presentación que cuenta la bitácora completa, agrupada por etapas, con un anexo que lista todos los pasos.

**Cambios:**
- `docs/presentaciones/2026-11-26-bitacora.md`: guion del agente `presentador`, unos 25 minutos.
  - 26 diapositivas en 9 secciones: tres días en cifras, línea de tiempo y ocho etapas (pasos 1 a 15, 16 a 24, 25 a 33, 34 a 38, 39 a 52, 53 a 55, 56 a 58 y 59 a 66).
  - Cada paso cae en una sola etapa.
  - Lleva extractos reales de `mensaje-commit`, `framework.yaml`, `ApiJsonFormatSubscriber` y el skill `bitacora`.
  - Cierra con "lo que nos enseñó la bitácora" y cómo se lleva.
- `docs/presentaciones/2026-11-26-bitacora.pptx`: el PowerPoint, generado con el skill `pptx`.
  - El generador de la versión extendida se hizo genérico: portada configurable, número de secciones calculado a partir del guion y un anexo automático.
  - El anexo lee las cabeceras `## Paso N — título (fecha)` de `docs/bitacora.md` y crea una tabla de 11 pasos por diapositiva. Si la bitácora crece, el anexo se regenera solo.
- Cifras comprobadas contra la bitácora y GitHub, entre ellas los tests acumulados por issue: 53, 67, 86 y 91 (pasos 48 a 51).
- Revisión visual con un subagente: se unificó la cuenta a 67 pasos (el guion decía 66 y dejaba fuera este mismo paso), se corrigió "cuatro" por "cinco" cambios de diseño y el rango de pasos de cada separadora pasó a la etiqueta superior para que el título no se partiera.

**Ficheros:** `docs/presentaciones/2026-11-26-bitacora.md` y `docs/presentaciones/2026-11-26-bitacora.pptx` (nuevos); `docs/bitacora.md` (modificado).

## Paso 68 — Pantallas de tareas en Angular: lista, formulario y completar (#10) (2026-11-26)

**Qué hicimos:** implementamos el issue #10 con el orquestador `/nueva-feature`: la lista `/tasks` (pendientes y completadas, completar y eliminar) y el formulario `/tasks/new` y `/tasks/:id/edit`, con su servicio HTTP, el pipe `recurrenceLabel` y 26 tests nuevos de Vitest (33 en total).

**Por qué:** era el siguiente issue de la v0.1; la API de `/api/tasks` ya estaba fusionada (#5 a #9).

**Cambios:**
- Alcance detectado: solo la capa `frontend`. Se descartaron `analisis-diseno`, `modelo`, `dto`, `servicio` y `api` porque §4 y §6 del análisis ya cubrían el issue y el backend no cambia.
- `core/models/task.ts` copia `TaskOutput` y `CompleteTaskOutput`; `TaskApiService` tiene un método por cada uno de los 8 endpoints de `/api/tasks` (también `trash()` y `restore()`, que usará #11).
- `TaskList`: estados cargando, vacío, error de carga con "Reintentar" y botones deshabilitados mientras hay una acción en curso. La siguiente ocurrencia se toma de la respuesta de `/complete` (RN-05); el frontend no calcula fechas.
- `TaskForm`: formulario reactivo tipado; título obligatorio, sin contar los espacios (como `NotBlank`), y de 255 caracteres como máximo; "Semanal" preseleccionado al marcar "repetitiva" (RN-03) y `recurrence: null` al desmarcarlo. En edición, un `404` muestra "No se ha encontrado la tarea."
- `MessageService` gana `status` y `announce()`: una región `role="status"` oculta anuncia "Tarea completada.", "Tarea movida a la papelera.", etc.
- `styles.css` recoge las variables y los componentes base de `docs/diseno/pantallas-tareas.md`; `app.css` pasa a usar variables y la cabecera tiene la navegación (solo "Tareas"; los enlaces de "Papelera" y "Plantillas" llegan con sus issues).
- Rutas perezosas (`loadComponent`) y `''` redirigida a `/tasks`.
- Los tests de componentes usan `HttpTestingController` con el interceptor real, así el criterio "se muestra el mensaje de la API" se prueba de punta a punta.
- Verificación: `frontend-test.ps1` (33 tests y build) y `backend-test.ps1` (95 tests) en verde. Prueba de humo con backend y `ng serve`: por el proxy, crear, completar una repetitiva (devuelve `nextOccurrence`), `409` y `422` en `problem+json`. Las 2 tareas de prueba se borraron de la base de datos de desarrollo.

**Decisión:** para las preguntas abiertas del diseño se aplicó lo que proponía la especificación: anuncio de éxito en `role="status"`, `confirm` nativo antes de eliminar y el orden que da la API. El selector de categoría (F-19) queda para #15.

**Pendiente:** revisión funcional de las pantallas (CRITERIO de la Fase 6) y firma de `docs/diseno/pantallas-tareas.md`. La prueba manual en el navegador la hace la persona.

**Ficheros:** `frontend/src/app/core/models/task.ts`, `frontend/src/app/core/api/task-api.service.ts` y `.spec.ts`, `frontend/src/app/shared/recurrence-label.pipe.ts` y `.spec.ts`, `frontend/src/app/features/tasks/task-list/*` y `frontend/src/app/features/tasks/task-form/*` (nuevos); `frontend/src/app/app.ts`, `app.html`, `app.css`, `app.routes.ts`, `frontend/src/app/core/messages/message.service.ts`, `frontend/src/styles.css`, `CLAUDE.md` y `docs/bitacora.md` (modificados); `.gitkeep` de `core/api/`, `shared/` y `features/` (eliminados).

## Paso 69 — Prueba E2E del #10 con el MCP de Playwright y guion repetible (2026-11-26)

**Qué hicimos:** comprobamos que el issue #10 está bien cerrado y recorrimos en el navegador, con el MCP de Playwright, sus cinco criterios de aceptación. Pasaron los cinco. Después guardamos la prueba como guion para poder repetirla. Con esto queda hecha la prueba en el navegador que el paso 68 dejaba pendiente; la revisión funcional (CRITERIO de la Fase 6) sigue en manos de la persona.

**Por qué:** lo pidió hispafox para estrenar el MCP de Playwright (`.mcp.json`) y validar las pantallas de verdad, más allá de los tests de Vitest.

**Cambios:**
- En GitHub, el #10 está `CLOSED` desde las 09:10:05, cerrado por el merge de la PR #25 (09:10:03).
- En el navegador: lista vacía y con datos; título vacío, que da error y no hace `POST`; completar una repetitiva diaria, que pasa a Completadas sin botón "Completar" y crea la siguiente ocurrencia; eliminar con confirmación; y `/tasks/999/edit`, que responde `404` y muestra "No se ha encontrado el elemento." y "No se ha encontrado la tarea."
- Dos falsas alarmas descartadas: la nueva ocurrencia tiene la misma fecha que la original porque RN-05 calcula desde el día en que se completa; y el `404` tardó unos segundos en pintarse por la lentitud del equipo, no por el código.
- `docs/pruebas/e2e-10-pantallas-tareas.md`: guion con preparación, 9 pasos (acción, herramienta MCP y resultado esperado), avisos, limpieza y registro de ejecuciones. Se puede repetir pidiéndoselo a un agente o a mano.

**Decisión:** el guion se escribió como documento en Markdown y no como test de `@playwright/test`. Automatizarlo pide dependencias nuevas y un issue propio.

**Pendiente:** las tareas de prueba 3 (completada) y 4 (en la papelera) siguen en `backend/var/data.db`. Falta firmar el guion.

**Ficheros:** `docs/pruebas/e2e-10-pantallas-tareas.md` (nuevo); `CLAUDE.md` (fila en "Pendientes de firma") y `docs/bitacora.md` (modificados).

## Paso 70 — Generador de presentaciones en el repositorio (2026-11-26)

**Qué hicimos:** guardamos en el repositorio el generador de diapositivas de los pasos 65 a 67, que estaba en la carpeta temporal de la sesión, para poder regenerar las presentaciones cuando cambie un guion o la bitácora.

**Cambios:**
- `scripts/presentaciones/`:
  - `generar.js` lee un guion del `presentador` y aplica a cada diapositiva la plantilla de su línea `Visual:`.
  - `corta.js` genera la versión corta.
  - `config/` tiene la portada de cada presentación y el anexo automático de la bitácora.
  - `capturas.js` saca capturas con Edge sin ventana.
  - `exportar-imagenes.ps1` exporta las diapositivas a PNG para revisarlas.
  - El `README.md` explica el formato del guion.
- `scripts/presentaciones-generar.ps1`: genera las tres presentaciones de una vez (`-Solo` para una). La primera vez instala pptxgenjs (MIT) en `scripts/presentaciones/node_modules/`, que no se sube a Git.
- `docs/presentaciones/img/recorte-*.png`: los recortes de las capturas que usa la diapositiva de pantallas.
- Comprobado: el script regenera las tres presentaciones (10, 41 y 34 diapositivas con la portada). No se suben los `.pptx` regenerados: los de los pasos 65 a 67 siguen siendo los publicados.

**Decisión:** el generador es código propio y solo depende de pptxgenjs, que es MIT. No incluye nada del skill `pptx` de Anthropic, cuya licencia no permite distribuirlo, así que puede estar en el repositorio público.

**Aviso:** este paso se registró mientras otra sesión tenía sin commit su paso 69 (prueba E2E del #10 con Playwright) y su fila de `CLAUDE.md`. El commit de este paso no incluye esos cambios.

**Ficheros:** `scripts/presentaciones/` (`generar.js`, `corta.js`, `capturas.js`, `exportar-imagenes.ps1`, `config/extendida.json`, `config/bitacora.json`, `package.json`, `package-lock.json` y `README.md`), `scripts/presentaciones-generar.ps1` y `docs/presentaciones/img/recorte-lista.png` y `recorte-formulario.png` (nuevos); `.gitignore` y `docs/bitacora.md` (modificados).

## Paso 71 — Agente planificador, primer agente del equipo (2026-11-26)

**Qué hicimos:** empezamos a montar la arquitectura de agentes de `docs/ARQUITECTURA-AGENTES-V2.md` por el **planificador**, y solo por él. El orquestador, los implementadores y el verificador vienen después. Partimos de la solución de referencia del lab (`docs/formacion/agentes-referencia/agents/planificador.md`), que ya se había ensayado en los pasos 61 y 62.

**Cambios:**
- `.claude/agents/planificador.md`: lee el issue con `gh`, el CLAUDE.md, la documentación funcional, el análisis y el código actual. Detecta el alcance con `nueva-feature` en modo `plan` y escribe `docs/planes/plan-<nº>-<slug>.md` con una plantilla fija: objetivo, criterios, alcance por capa, pasos con agente y skill, tests por criterio y riesgos. Solo escribe en `docs/planes/`.
- Ajustes sobre la referencia, sacados de las notas del plan del #23:
  - No espera el visto bueno que pide `nueva-feature`, porque un subagente no puede preguntar. La revisión del plan la hace la persona después (CRITERIO).
  - No menciona las firmas: a petición de hispafox, el planificador no las comprueba ni las anota.
  - Si una petición no tiene issue, hace `plan-sin-issue-<slug>.md` y pide crear el issue antes de implementar.
  - No sobrescribe un plan que ya existe (guarda una `-v2`).
  - Lista los skills válidos y dice qué script ejecuta el verificador.
- `.claude/commands/planificar.md`: comando `/planificar #<nº>` para lanzarlo suelto, como los agentes de apoyo.

**Prueba con el #11 (papelera)**, lanzada con `/planificar el numero 11`: unos 35 segundos y 5 llamadas a herramientas.
- Plan en `docs/planes/plan-11-pantalla-papelera-tareas.md`.
- Alcance: frontend y pruebas. Descarta el análisis (ya recoge la ruta y la pantalla) y el backend (`GET /api/tasks/trash` y `POST /api/tasks/{id}/restore` existen con sus tests).
- Detecta que `trash()` y `restore()` ya están en `TaskApiService` (#10), así que la primera tarea del issue sobra.
- Pasos: 3 del `implementador-frontend`, 1 del `verificador` (`frontend-test.ps1`) y 1 del `orquestador` (cierre).
- Preguntas abiertas, cada una con su recomendación:
  1. ¿Hace falta diseño previo del `disenador-ui`? Recomienda reutilizar el estilo de la lista.
  2. ¿Restaurar pide confirmación? Recomienda que no.
  3. ¿Qué hace la pantalla si `restore` da 409? Recomienda mostrar el aviso y recargar.
- Comprobado con `git status`: solo creó el fichero del plan.

**Pendiente:** revisar el plan y responder las tres preguntas antes de implementar el #11.

**Ficheros:** `.claude/agents/planificador.md`, `.claude/commands/planificar.md`, `docs/planes/plan-11-pantalla-papelera-tareas.md` (nuevos); `CLAUDE.md` y `docs/bitacora.md` (modificados).

## Paso 72 — Skills de documentos y guía del MCP de Playwright, sin registrar hasta ahora (2026-11-26)

**Qué hicimos:** registramos y commiteamos varios ficheros que estaban en el repositorio sin aparecer en ningún paso, junto con lo que el paso 69 dejó sin commitear (`docs/pruebas/` y `.mcp.json`).

**Cambios:**
- `.claude/skills/docx`, `pdf`, `pptx` y `xlsx`: skills de documentos de Anthropic copiados en el repositorio (licencia propietaria, en el `LICENSE.txt` de cada uno). El `presentador` usa `pptx` para las diapositivas; los demás sirven para generar material de la clase.
- `docs/herramientas-mcp-playwright.docx`: guía en Word de las herramientas del MCP de Playwright (`@playwright/mcp` 0.0.86) y de cómo usarlas para probar la Lista de Tareas. Complementa el paso 69.

**Ficheros:** `.claude/skills/docx/`, `.claude/skills/pdf/`, `.claude/skills/pptx/`, `.claude/skills/xlsx/`, `docs/herramientas-mcp-playwright.docx` (nuevos); `docs/bitacora.md` (modificado).

## Paso 73 — Agentes de desarrollo: implementador-backend e implementador-frontend (2026-11-26)

**Qué hicimos:** creamos a la vez los dos agentes de desarrollo de `docs/ARQUITECTURA-AGENTES-V2.md`, con la misma estructura. Partimos de las soluciones de referencia del lab (`docs/formacion/agentes-referencia/agents/`), como con el planificador.

**Por qué a la vez:** son casi simétricos. Los dos leen el plan de `docs/planes/`, delegan en los skills de su capa, terminan con su script de tests en verde y no tocan Git. Solo cambian la carpeta (`backend/` o `frontend/`) y los skills. Ejecutarlos en paralelo es otra cosa: solo es seguro si el contrato de la API (`docs/analisis.md` §4) ya está cerrado, y eso lo decide el orquestador.

**Cambios:**
- `.claude/agents/implementador-backend.md`: hace los pasos del plan en el orden `analisis-diseno` → `modelo` → `dto` → `servicio` → `api` → `pruebas`, cada uno con su skill, y termina con `backend-test.ps1` en verde.
- `.claude/agents/implementador-frontend.md`: hace los pasos con el skill `frontend` y la especificación de `docs/diseno/` (si no existe, reutiliza el estilo de las pantallas que ya hay) y termina con `frontend-test.ps1` en verde. Lee el contrato de la API pero no lo toca.
- Ajustes sobre la referencia:
  - Comprueban que están en la rama del plan, pero no la crean ni cambian de rama: eso es del orquestador.
  - Un subagente no puede preguntar: si un skill dice "espera el visto bueno", siguen cuando la duda está resuelta y, si no, devuelven el paso como bloqueo. Para las preguntas abiertas del plan, aplican la respuesta que les pasen o, si no hay respuesta, la recomendación del plan, y lo dicen.
  - El contrato manda: ninguno de los dos cambia endpoints ni DTO por su cuenta. El backend informa de los cambios de contrato, y el frontend informa de los endpoints que consume, para el verificador.
  - Máximo 3 intentos para dejar los tests en verde; si siguen en rojo, devuelven "bloqueado" con la salida.
  - Nada fuera del plan; las mejoras que vean van a "Notas".
  - No mencionan las firmas.
- No añadimos comandos `/implementar-…`: se lanzan desde el orquestador.

**Pendiente:** probarlos con el #11 (solo frontend) cuando estén respondidas las tres preguntas del plan; quedan el verificador y el orquestador.

**Ficheros:** `.claude/agents/implementador-backend.md`, `.claude/agents/implementador-frontend.md` (nuevos); `CLAUDE.md` (nota en la Fase 8) y `docs/bitacora.md` (modificados).

## Paso 74 — Prueba de los implementadores con el #11 (2026-11-26)

**Qué hicimos:** probamos los dos implementadores del paso 73, sin comandos: los lanzamos directamente con la herramienta `Agent`, en paralelo, sobre `docs/planes/plan-11-pantalla-papelera-tareas.md`, en la rama `feature/11-pantalla-papelera-tareas`. Hicimos de orquestador: creamos la rama y les pasamos las respuestas a las preguntas abiertas (las tres recomendaciones del plan).

**Cambios:**
- `implementador-backend` (prueba negativa, unos 43 s y 5 herramientas): vio que el plan no tenía pasos de backend, no editó nada (comprobado con `git status`) y confirmó que `trash` y `restore` existen con sus tests y que el 409 de RN-10 ya está. Aun así ejecutó `backend-test.ps1` (PHPUnit 95/95, PHPStan sin errores), aunque no hacía falta.
- `implementador-frontend` (unos 3 min 20 s y 14 herramientas): creó `TaskTrash` (carga, vacío, error con "Reintentar", "Restaurar" por fila y recarga con 409), la ruta perezosa `tasks/trash` antes de `tasks/:id/edit` y el enlace "Papelera". Reutilizó `trash()` y `restore()` de `TaskApiService`. Añadió 10 tests y `frontend-test.ps1` quedó en verde al primer intento (Vitest 43/43 y build), algo que comprobamos ejecutándolo también nosotros. Solo tocó `frontend/`.
- Prueba en el navegador con el MCP de Playwright (backend y frontend levantados):
  - Criterio 1: `/tasks/trash` muestra la tarea 4 (que quedó en la papelera en el paso 69) con "Pendiente" y "Eliminada el 26 nov 2026, 10:30".
  - Criterio 2: al pulsar "Restaurar" sale "Tarea restaurada." y luego "La papelera está vacía.". En `/tasks`, la tarea vuelve a Pendientes.
  - Detalle visto: el aviso "Tarea restaurada." sigue en pantalla al volver a `/tasks`, porque los avisos son globales.
- Notas del frontend: el enlace "Tareas" usa ahora `exact: true` (ya no se marca en `/tasks/new` ni en la edición); un 404 al restaurar no recarga la papelera, porque el plan solo lo pide para el 409; y el CSS repite el de `task-list`.

**Pendiente:**
- Ajustar al implementador-backend: si no hay pasos suyos, que termine sin ejecutar los tests.
- Cerrar el #11 (verificación, commit, PR y merge) y hacer la revisión funcional de la pantalla.

**Ficheros:** `frontend/src/app/features/tasks/task-trash/*` y `frontend/src/app/app.routes.spec.ts` (nuevos); `frontend/src/app/app.html`, `app.routes.ts`, `app.spec.ts` y `docs/bitacora.md` (modificados).

## Paso 75 — Agente orquestador (2026-11-26)

**Qué hicimos:** creamos el **orquestador** de `docs/ARQUITECTURA-AGENTES-V2.md`, el agente que coordina al resto. Partimos de la solución de referencia del lab (`docs/formacion/agentes-referencia/agents/orquestador.md`), como con los anteriores.

**Cambios:**
- `.claude/agents/orquestador.md`: flujo en seis pasos (preparar, planificar, implementar, verificar con un máximo de 3 vueltas, revisar reglas con `guardian-candado` y cerrar con bitácora, commit, PR y merge). No edita ficheros: los cambios los hacen los implementadores. Tiene que ir en la conversación principal (`claude --agent orquestador`) para poder preguntar en los CRITERIO.
- Ajustes sobre la referencia, sacados de los pasos 71 a 74:
  - Si la rama del issue ya existe, sigue desde lo que haya, sin descartar los cambios sin commit (caso del #11).
  - Si ya hay plan en `docs/planes/`, lo reutiliza y no relanza al planificador.
  - Pregunta a la persona las preguntas abiertas del plan y pasa las respuestas a los implementadores.
  - Solo lanza a los implementadores que tienen pasos en el plan (en el paso 74, el de backend ejecutó los tests sin tener nada que hacer).
  - Hace el merge sin pedir permiso con los tests en verde, como dice el CLAUDE.md.
  - No comprueba ni menciona las firmas.
- Sin comando `/orquestar` por ahora.

**Pendiente:** crear el `verificador`, del que depende el paso 4 del flujo, y probar el orquestador cerrando el #11.

**Ficheros:** `.claude/agents/orquestador.md` (nuevo); `CLAUDE.md` (nota en la Fase 8) y `docs/bitacora.md` (modificados).

## Paso 76 — Agente verificador (2026-11-26)

**Qué hicimos:** creamos el **verificador** de `docs/ARQUITECTURA-AGENTES-V2.md`, el agente del que depende el paso 4 del orquestador (pendiente del paso 75). Partimos de la solución de referencia del lab (`docs/formacion/agentes-referencia/agents/verificador.md`), como con los anteriores.

**Por qué:** antes de probar el orquestador con el #11 hacía falta su verificador. Se decidió crearlo y parar, sin tocar todavía el #11.

**Cambios:**
- `.claude/agents/verificador.md`: lee el plan y los cambios (con y sin commit), ejecuta los tests, cruza cada criterio de aceptación con su test y devuelve `APROBADO` o `REVISAR` con los defectos asignados a backend o frontend. No edita, no hace commits ni cambia de rama. Modelo `sonnet`, como la referencia.
- Ajustes sobre la referencia:
  - Solo ejecuta los scripts de las capas tocadas por el plan o el diff (la referencia lanzaba siempre `backend-test.ps1`); con cambios solo de documentación no ejecuta nada. Es lo mismo que se ajustó en el orquestador tras el paso 74.
  - Quitamos el `doctrine:schema:validate` aparte: `backend-test.ps1` ya valida el mapeo.
  - Añadimos la comprobación del contrato: los endpoints que consume el frontend tienen que estar en `docs/analisis.md` §4 y en un `#[Route]` del backend (lo pedía la arquitectura V2 y lo preparan los informes del implementador-frontend).
  - Los ficheros fuera del plan son observaciones, no defectos.
  - Un fallo de entorno (disco lento, puerto ocupado) se repite una vez y, si sigue, se informa como bloqueo de entorno, no como defecto de una capa (lección del paso 31).
  - No arranca la aplicación ni prueba en el navegador: eso es de `qa-exploratorio` y de la revisión funcional.
- Sin comando `/verificar`: se lanza desde el orquestador.

**Pendiente:** probar el orquestador (con el verificador) cerrando el #11; queda en la rama el trabajo sin commit del paso 74.

**Ficheros:** `.claude/agents/verificador.md` (nuevo); `CLAUDE.md` (nota en la Fase 8) y `docs/bitacora.md` (modificados).

## Paso 77 — Comando `/orquestar` (2026-11-26)

**Qué hicimos:** creamos el comando `/orquestar` para el agente orquestador del paso 75, a partir de la solución de referencia del lab (`docs/formacion/agentes-referencia/commands/orquestar.md`).

**Cambios:**
- `.claude/commands/orquestar.md`: la conversación principal hace de orquestador, leyendo `.claude/agents/orquestador.md` y siguiendo su flujo. No se lanza como subagente, porque tiene que poder preguntar a la persona en los CRITERIO. Recibe el número del issue; si no se le pasa, pregunta cuál y enseña los issues abiertos (`gh issue list --state open`).

**Pendiente:** probar `/orquestar` cerrando el #11, con el trabajo sin commit del paso 74 que sigue en la rama.

**Ficheros:** `.claude/commands/orquestar.md` (nuevo); `CLAUDE.md` (nota en la Fase 8) y `docs/bitacora.md` (modificados).

## Paso 78 — Issue #11 cerrado con `/orquestar` (2026-11-26)

**Qué hicimos:** probamos por primera vez el comando `/orquestar` (paso 77) cerrando el #11, la pantalla de papelera de tareas. Así se resuelve el pendiente de los pasos 74 a 77. La conversación principal hizo de orquestador y siguió los seis pasos de `.claude/agents/orquestador.md`.

**Cambios:**
- Preparar: el issue estaba abierto y la rama ya existía, con el trabajo del paso 74 sin commit. Seguimos desde ahí, sin descartar nada.
- Planificar: ya existía `docs/planes/plan-11-pantalla-papelera-tareas.md`, así que no se lanzó al planificador. En el CRITERIO, hispafox aceptó las tres recomendaciones de las preguntas abiertas: estilo de la lista sin diseño previo, restaurar sin confirmación, y aviso más recarga ante un 409.
- Implementar: no se relanzó a ningún implementador, porque el frontend ya estaba hecho (paso 74) y el plan no tenía pasos de backend.
- Verificar, vuelta 1: `verificador` → **APROBADO**, unos 78 s. `frontend-test.ps1` pasó con Vitest 43/43 en 8 ficheros y build correcto. Los dos criterios tienen test, el contrato es correcto y no hay defectos.
- Revisar reglas: `guardian-candado` → **CUMPLE**, sin hallazgos bloqueantes. Las firmas no se evaluaron porque el proyecto está en modo aviso.
- Cerrar: dos commits en la rama (agentes y comando por un lado, el feat del #11 por otro), PR con `Closes #11` y merge.

**Decisión:** los agentes `orquestador` y `verificador`, el comando `/orquestar` y sus notas en CLAUDE.md (pasos 75 a 77) seguían sin commit en esta rama, así que entran en la misma PR, en un commit `docs:` aparte del `feat:`.

**Pendiente:** revisión funcional de la pantalla `/tasks/trash` (ya se probó con Playwright en el paso 74).

**Ficheros:** `docs/bitacora.md` (modificado).

## Paso 79 — Vista en vivo del orquestador con hooks y grabaciones (2026-11-26)

**Qué hicimos:** montamos una página HTML que dibuja con Mermaid el flujo del orquestador y lo colorea en tiempo real (agente en marcha, hecho, REVISAR o NO CUMPLE, vuelta del verificador). Cada flujo queda grabado y se puede reproducir después. Escribimos también un documento Word que explica el proceso y la base de los hooks de Claude Code.

**Por qué:** hispafox quería ver en marcha el diagrama del orquestador durante la clase, en lugar de seguir solo los mensajes de la terminal.

**Cambios:**
- `.claude/settings.json` (nuevo, del proyecto): hooks `PreToolUse` y `PostToolUse` (matcher `Agent|Task|Bash|PowerShell|AskUserQuestion|Skill`), `SubagentStart` y `SubagentStop`, todos con `node "$CLAUDE_PROJECT_DIR/scripts/orquestador-vivo/hook.js"`.
- `hook.js`: traduce cada evento a un nodo del diagrama (subagentes por `subagent_type`; `gh issue view`, `git commit`, `gh pr create` y `gh pr merge` por el texto del comando; `AskUserQuestion` como CRITERIO; skill `bitacora`) y lee la línea `Veredicto:` del verificador y del guardián. Escribe `estado.json` y la grabación del flujo (`grabaciones/<fecha>-issue-<nº>.json`), que se abre con cada `gh issue view`. Siempre sale con 0 para no interferir.
- `servidor.js`: servidor Node sin dependencias en el puerto 4300 (`/`, `/estado.json`, `/grabaciones`, `/grabaciones/<fichero>`, `/reiniciar`).
- `index.html`: diagrama Mermaid (CDN) con `classDef` por estado y `linkStyle` en rojo para las vueltas atrás, polling cada segundo, lista de eventos, botón **Simular**, selector de grabaciones con **Reproducir** y botón **Limpiar** (no borra grabaciones).
- `scripts/orquestador-vivo.ps1`: arranca el servidor y abre el navegador.
- `docs/formacion/orquestador-en-vivo-hooks.docx`: qué es, la base de los hooks (eventos, niveles de `settings.json`, matcher, JSON por stdin, códigos de salida, seguridad), los hooks del proyecto, la página, las grabaciones, cómo usarlo en clase y limitaciones.
- `.gitignore`: excluye `estado.json` y `grabaciones/`.

**Decisión:** hooks de Claude Code en vez del Claude Agent SDK (que hispafox preguntó): el orquestador se sigue lanzando igual (`claude --agent orquestador` o `/orquestar`), los CRITERIO se contestan en la terminal y no hay dependencias nuevas. El SDK queda descrito en el documento como alternativa.

**Pruebas:** eventos falsos enviados al hook (inicio, agentes y veredictos), simulación y reproducción de una grabación en el navegador con Playwright. Los hooks se activaron en la propia sesión: un comando que contenía `gh issue view` abrió un flujo de verdad.

**Pendiente:** ver un flujo real del orquestador en la vista (el #11 se cerró a las 12:16, antes de crear los hooks). Comprobar qué campos trae `SubagentStop` en esta versión de Claude Code (2.1.27); el hook tiene respaldos si faltan.

**Ficheros:** `.claude/settings.json`, `scripts/orquestador-vivo/hook.js`, `scripts/orquestador-vivo/servidor.js`, `scripts/orquestador-vivo/index.html`, `scripts/orquestador-vivo.ps1`, `docs/formacion/orquestador-en-vivo-hooks.docx` (nuevos); `.gitignore`, `CLAUDE.md` (comando en "Comandos") y `docs/bitacora.md` (modificados).

## Paso 80 — Issue #12 cerrado con `/orquestar`: pantallas de plantillas (2026-11-26)

**Qué hicimos:** cerramos el #12 (pantallas de plantillas y crear tarea desde plantilla, F-07 a F-12) con el flujo del orquestador, seguido en directo en la vista del paso 79.

**Cambios:**
- Preparar: issue abierto; rama `feature/12-pantallas-plantillas` desde `main` actualizado.
- Planificar: `planificador` → `docs/planes/plan-12-pantallas-plantillas.md`. Solo frontend y pruebas; el backend ya tenía los 6 endpoints de `/api/task-templates`, con `409` (RN-12) e `instantiate` (RN-08).
- CRITERIO: hispafox aceptó las cinco recomendaciones: estilo de las pantallas de tareas sin `disenador-ui`; tras "Crear tarea" navegar a `/tasks`; `confirm()` nativo al eliminar; texto propio ante el 409 ("Esta plantilla tiene tareas asociadas y no se puede eliminar"); sin pantalla de detalle (F-08 se cubre en el formulario de edición).
- Implementar: `implementador-frontend` → `TaskTemplateApiService`, modelo `TaskTemplate`, `TemplateList`, `TemplateForm`, rutas perezosas `/templates`, `/templates/new` y `/templates/:id/edit`, enlace "Plantillas" y sus tests.
- Verificar, vuelta 1: `verificador` → **APROBADO**. Vitest 66/66 en 11 ficheros, build correcto, los 4 criterios con test y contrato correcto.
- Revisar reglas: `guardian-candado` → **CUMPLE**, sin hallazgos.

**Pendiente:** revisión funcional de `/templates` con el backend levantado. Posible mejora: `TemplateForm` repite casi entero `TaskForm` (validador `notBlank`, `busy` y CSS); se podría sacar a `shared/`.

**Ficheros:** `docs/planes/plan-12-pantallas-plantillas.md`; `CLAUDE.md` (Fase 6 marcada); `frontend/src/app/core/models/task-template.ts`, `frontend/src/app/core/api/task-template-api.service.ts` y su spec, `frontend/src/app/features/task-templates/template-list/*` y `template-form/*` (nuevos); `frontend/src/app/app.routes.ts`, `app.routes.spec.ts`, `app.html` y `app.spec.ts` (modificados); `docs/bitacora.md` (modificado).

## Paso 81 — Correcciones del hook de la vista en vivo (2026-11-26)

**Qué hicimos:** corregimos dos fallos de `scripts/orquestador-vivo/hook.js` que aparecieron al seguir en directo el flujo del #12 (paso 80). Así se resuelve el pendiente del paso 79 de ver un flujo real.

**Cambios:**
- Los hooks también se disparan dentro de los subagentes: el planificador ejecutó `gh issue view 12` y se abrió un segundo flujo, con la grabación partida en dos. Ahora un `gh issue view` del mismo issue, con el flujo ya pasado de Preparar y sin merge, no abre flujo nuevo.
- `SubagentStop` también salta cuando un subagente se para a esperar trabajo en segundo plano (tests): el verificador salió como "hecho" a los 3 segundos. Ahora solo cuenta el informe final: `Veredicto:` en el verificador y el guardián, "terminado" o "bloqueado" en los implementadores y la ruta del plan en el planificador.
- Reparamos a mano la grabación del #12 (un solo flujo, sin los dos "hecho" prematuros).

**Ficheros:** `scripts/orquestador-vivo/hook.js` y `docs/bitacora.md` (modificados).
