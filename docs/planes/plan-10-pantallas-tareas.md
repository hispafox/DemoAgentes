# Plan del issue #10 — Pantallas de tareas: lista, formulario y completar

- **Issue:** #10 · **Rama:** feature/10-pantallas-tareas · **Fecha:** 2026-11-26

## Objetivo
Pantallas Angular para listar, crear, editar, completar y eliminar tareas (F-01, F-03 a F-06), consumiendo la API que ya existe.

## Criterios de aceptación
1. Con tareas en la API, `/tasks` muestra pendientes y completadas (F-01).
2. En `/tasks/new`, guardar con título vacío muestra el error y no envía la petición (RN-01).
3. Completar una tarea pendiente la deja completada; si es repetitiva aparece la nueva ocurrencia; en las completadas no hay botón "Completar" (RN-05, RN-06, RN-11).
4. Eliminar una tarea la hace desaparecer de la lista (RN-10).
5. Ante un error de la API se muestra su mensaje (interceptor problem+json ya existente).

## Alcance
| Capa | ¿Se toca? | Motivo |
|---|---|---|
| Análisis | no | §6 ya define rutas, componentes y pantallas; `docs/diseno/pantallas-tareas.md` (pendiente de firma) no lo contradice. |
| Backend: modelo · dto · servicio · api | no | `/api/tasks` (8 rutas) ya existe (#5 a #9); los DTO `TaskOutput`, `CompleteTaskOutput` y `TaskInput` bastan. |
| Frontend | sí | Modelos, `TaskApiService`, pipe `recurrenceLabel`, `task-list`, `task-form`, rutas, navegación y estilos globales. |
| Pruebas | sí | Vitest: servicio con `HttpTestingController`, pipe y componentes; `frontend-test.ps1` (tests y build). |

## Pasos
| # | Agente | Skill | Qué hace | Ficheros previstos |
|---|---|---|---|---|
| 1 | implementador-frontend | `frontend` (crear) | Modelos (`Task`, `TaskInput`, `CompleteTaskResult`, `Recurrence`) y `TaskApiService` (list, get, create, update, delete, complete) | `frontend/src/app/core/models/task.ts`, `core/api/task-api.service.ts` |
| 2 | implementador-frontend | `frontend` (crear) | Pipe `recurrenceLabel` (daily/weekly/monthly → Diaria/Semanal/Mensual) | `frontend/src/app/shared/recurrence-label.pipe.ts` |
| 3 | implementador-frontend | `frontend` (crear) | Estilos globales y variables del diseño; navegación con enlace "Tareas"; rutas `/tasks`, `/tasks/new`, `/tasks/:id/edit` y redirección de `/` | `frontend/src/styles.css`, `app.html`, `app.css`, `app.routes.ts` |
| 4 | implementador-frontend | `frontend` (crear) | `task-list`: grupos Pendientes/Completadas, completar (solo pendientes), eliminar con `confirm`, estados cargando/vacío/error, anuncios `role="status"` | `features/tasks/task-list/task-list.{ts,html,css}` |
| 5 | implementador-frontend | `frontend` (crear) | `task-form`: formulario reactivo tipado (título requerido, check repetitiva, selector de periodicidad obligatorio si repetitiva), modo crear/editar según `:id` | `features/tasks/task-form/task-form.{ts,html,css}` |
| 6 | implementador-pruebas | `pruebas` (frontend, vía `frontend`) | Tests Vitest de servicio, pipe, `task-list` y `task-form`; ejecutar `frontend-test.ps1` | `*.spec.ts` junto a cada fichero |
| 7 | verificador | — | Cruza criterios de aceptación con tests y ejecuta `frontend-test.ps1` | — |
| 8 | orquestador | `bitacora`, `mensaje-commit` | Bitácora, commit `feat: … (#10)`, PR con `Closes #10` y merge con tests en verde | `docs/bitacora.md` |

## Tests previstos
| Criterio | Test |
|---|---|
| 1 | `TaskListComponent`: con respuesta simulada de `GET /api/tasks` muestra "Pendientes (n)" y "Completadas (n)" |
| 1 | `TaskApiServiceTest` (spec): `list()` hace `GET /api/tasks` |
| 2 | `TaskFormComponent`: título vacío marca el campo con error y no llama a `create` |
| 2 | `TaskFormComponent`: repetitiva sin periodicidad no se envía (RN-03) |
| 3 | `TaskApiService`: `complete()` hace `POST /api/tasks/{id}/complete` |
| 3 | `TaskListComponent`: tras completar, la tarea pasa a Completadas y `nextOccurrence` aparece en Pendientes |
| 3 | `TaskListComponent`: las filas completadas no tienen botón "Completar" |
| 4 | `TaskListComponent`: eliminar (con `confirm` aceptado) llama a `DELETE` y quita la fila; si se cancela, no hace nada |
| 5 | Ya cubierto por `error.interceptor.spec.ts`; test de componente: un error de la API se refleja en `MessageService` |
| — | `RecurrenceLabelPipe`: los tres valores y `null` |

## Dependencias, riesgos y preguntas abiertas
- Dependencia: API de tareas ya en `main` (#5 a #9) e interceptor/`MessageService` del #3.
- Aviso: `docs/diseno/pantallas-tareas.md` está pendiente de firma (modo aviso, no bloquea). Las firmas de backlog v0.1 también están pendientes.
- Riesgo: el diseño pide `confirm` nativo, que en Vitest/jsdom hay que simular (`vi.spyOn(window, 'confirm')`).
- Riesgo: formato de fecha `d MMM y` en español exige registrar el locale `es` (`registerLocaleData`) en `app.config.ts`.
- Riesgo: el diseño toca estilos globales usados por el `.alert` ya existente; no romper `app.spec.ts`.
- Fuera de este issue: papelera (#11), plantillas (#12) y categorías (v0.2); no enlazar rutas inexistentes.
- Preguntas abiertas: ninguna sobre reglas de negocio. Detalle menor: el diseño no dice si el selector de periodicidad se oculta o se deshabilita cuando "repetitiva" está desmarcado (se propone ocultarlo y vaciar el valor).

## Notas del ensayo
- El skill `nueva-feature` está pensado para ejecutar la cadena completa (rama, issue, commits, PR, merge). Mi papel solo cubre sus pasos 1 a 3; la rama ya existía y el issue también, así que el paso 4 no aplicaba. La frontera está explícita en `planificador.md`, pero el skill no la menciona.
- El skill pide "esperar el visto bueno" en el paso 3 según el tipo de petición; un subagente no puede preguntar, así que el plan queda escrito sin esa aprobación (el issue ya está refinado, por lo que no se exige).
- La plantilla pide una columna "Agente", pero los agentes del equipo (implementador-frontend, implementador-pruebas, verificador) no existen aún en `.claude/agents/`; los nombres de la tabla son propuestos.
- La plantilla solo contempla "Backend: modelo · dto · servicio · api" en una fila; aquí es una sola decisión (no se toca), pero con otra petición habría que desglosarlo.
- Leí `docs/diseno/pantallas-tareas.md`, que no se cita como obligatorio en "Qué hago", solo en "Qué lees" (condicional); sin él faltaría detalle para el plan.
- No ejecuté `php bin/console debug:router`; me basé en §4 del análisis y en el CLAUDE.md (que declara las 8 rutas hechas). Con Bash disponible era posible, pero lento y innecesario para una tarea solo de frontend.
- El archivo de bitácora (`bitacora`) está en la lista de pasos del skill, pero yo no puedo escribir fuera de `docs/planes/`; lo delego al orquestador.
