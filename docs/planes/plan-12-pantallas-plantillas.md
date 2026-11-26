# Plan del issue #12 — Pantallas de plantillas y crear tarea desde plantilla

- **Issue:** #12 · **Rama:** feature/12-pantallas-plantillas · **Fecha:** 2026-11-26

## Objetivo
Pantallas Angular `/templates`, `/templates/new` y `/templates/:id/edit` para listar, crear, editar y eliminar plantillas y crear tareas desde ellas (F-07 a F-12).

## Criterios de aceptación
1. Dado plantillas, cuando abro `/templates`, entonces las veo con botones crear tarea, editar y eliminar. (F-07, F-10, F-11, F-12)
2. Dado el formulario de plantilla, cuando guardo con título vacío, entonces veo el error. (F-09, RN-07)
3. Dado una plantilla, cuando pulso "crear tarea", entonces se crea y la veo en `/tasks`. (F-12, RN-08)
4. Dado una plantilla con tareas, cuando pulso eliminar, entonces veo el aviso de que no se puede (`409`). (F-11, RN-12)

## Alcance
| Capa | ¿Se toca? | Motivo |
|---|---|---|
| Análisis | no | §4 (`/api/task-templates`, 6 rutas) y §6 (rutas `/templates`, `/templates/new`, `/templates/:id/edit`; carpetas `template-list/` y `template-form/`; `task-template-api.service.ts`) ya lo recogen. |
| Backend: modelo · dto · servicio · api | no | Los 6 endpoints existen (`debug:router`: list, show, create, update, delete, instantiate) con `TaskTemplateService` (RN-09, RN-12) y sus tests. `DELETE` ya responde `409` y `instantiate` ya vincula la plantilla (RN-08). |
| Frontend | sí | Faltan `TaskTemplateApiService`, el modelo `TaskTemplate`, los componentes `template-list` y `template-form`, las rutas y el enlace "Plantillas" en la navegación. Lo que existe y se reutiliza: `MessageService`, el interceptor de errores (ya traduce `409` y `422`), el pipe `recurrenceLabel` y los patrones de `TaskList`/`TaskForm`. |
| Pruebas | sí | Vitest del servicio, los dos componentes y las rutas. Los tests de backend ya cubren los endpoints. |

## Pasos
| # | Agente | Skill | Qué hace | Ficheros previstos |
|---|---|---|---|---|
| 1 | implementador-frontend | frontend (crear) | Modelo `TaskTemplate` (`id`, `title`, `recurrence`) y `TaskTemplateInput` (`title`, `recurrence`); `TaskTemplateApiService` con un método por endpoint: `list`, `get`, `create`, `update`, `delete`, `instantiate` (devuelve `Task`). | `frontend/src/app/core/models/task-template.ts`, `frontend/src/app/core/api/task-template-api.service.ts` |
| 2 | implementador-frontend | frontend (crear) | Componente `TemplateList`: carga `api.list()`; estados de carga, error con "Reintentar" y vacío; por fila título y periodicidad (pipe `recurrenceLabel`) y botones "Crear tarea", "Editar" y "Eliminar" (con `busy` por id). "Crear tarea" llama a `instantiate(id)`, anuncia "Tarea creada." y navega a `/tasks`. "Eliminar" pide confirmación, llama a `delete(id)`, quita la fila y anuncia; si falla con `409` conserva la fila y deja visible el aviso del interceptor (RN-12). | `frontend/src/app/features/task-templates/template-list/template-list.ts`, `.html`, `.css` |
| 3 | implementador-frontend | frontend (crear) | Componente `TemplateForm` (crear y editar según `:id`, como `TaskForm`): título obligatorio y máximo 255 (RN-07), check "repetitiva" y selector de periodicidad; error de título vacío con foco; al guardar anuncia y navega a `/templates`; en `404` al editar muestra "no encontrada". | `frontend/src/app/features/task-templates/template-form/template-form.ts`, `.html`, `.css` |
| 4 | implementador-frontend | frontend (crear) | Rutas `templates`, `templates/new`, `templates/:id/edit` (carga perezosa) y enlace "Plantillas" en la navegación; actualizar el comentario de `app.routes.ts`. | `frontend/src/app/app.routes.ts`, `frontend/src/app/app.html` |
| 5 | implementador-frontend | frontend (crear) | Tests Vitest (ver "Tests previstos"). | `frontend/src/app/core/api/task-template-api.service.spec.ts`, `.../template-list/template-list.spec.ts`, `.../template-form/template-form.spec.ts`, `frontend/src/app/app.routes.spec.ts` |
| 6 | verificador | frontend (ejecutar `frontend-test.ps1`) | Ejecuta `scripts/frontend-test.ps1` (Vitest y build) y cruza criterios con tests. No hace falta `backend-test.ps1`: el backend no cambia. | — |
| 7 | orquestador | bitacora, mensaje-commit | Bitácora, commit `feat: pantallas de plantillas y crear tarea desde plantilla (#12)`, PR con `Closes #12` y merge con tests en verde. | `docs/bitacora.md` |

## Tests previstos
| Criterio | Test |
|---|---|
| 1 | `describe('TaskTemplateApiService')` → `it('should GET /api/task-templates when listing')` y un `it` por método restante (`get`, `create`, `update`, `delete`, `instantiate` con `POST .../instantiate`) |
| 1 | `describe('TemplateList')` → `it('should list the templates with create task, edit and delete buttons')` |
| 1 | `describe('TemplateList')` → `it('should show an empty message when there are no templates')` y `it('should show a retry button when loading fails')` |
| 2 | `describe('TemplateForm')` → `it('should show the title error and not call the API when saving with an empty title')` |
| 2 | `describe('TemplateForm')` → `it('should create the template and go back to /templates when the form is valid')` y `it('should load the template and send PUT when editing')` |
| 3 | `describe('TemplateList')` → `it('should call POST instantiate and navigate to /tasks when creating a task')` |
| 3 | `describe('routes')` (en `app.routes.spec.ts`) → `it('should resolve /templates to TemplateList')` y `it('should show the new task in /tasks after instantiating')` (nueva petición `GET /api/tasks`) |
| 4 | `describe('TemplateList')` → `it('should keep the row and show the 409 notice when the template has tasks')` |
| 4 | `describe('TemplateList')` → `it('should remove the row when the template is deleted')` (caso feliz de F-11) |

## Dependencias, riesgos y preguntas abiertas
- Dependencias: endpoints de `/api/task-templates` listos (v0.1), `MessageService`, interceptor y `recurrenceLabel` ya existen. Se parte de `main` con #10 y #11 fusionados.
- Riesgo menor: `docs/diseno/pantallas-tareas.md` no cubre plantillas. Se reutilizan las clases y patrones visuales de la lista y el formulario de tareas.
- Riesgo menor: el criterio 4 se apoya en el mensaje genérico del interceptor para `409` ("La acción no está permitida en el estado actual. (detalle)"). Si el `detail` del backend no explica RN-12, el aviso será poco claro; se comprueba al implementar.
- Pregunta abierta 1: ¿se pide especificación visual previa (agente `disenador-ui`)? Opciones: (a) reutilizar el estilo de tareas, sin diseño; (b) ejecutar `/disenar-ui` antes del paso 2. **Recomendación: (a)**, son pantallas casi idénticas a las de tareas.
- Pregunta abierta 2: tras "Crear tarea", ¿qué hace la pantalla? Opciones: (a) navegar a `/tasks` (encaja con el criterio "la veo en `/tasks`"); (b) quedarse en `/templates` con un aviso y enlace. **Recomendación: (a)**.
- Pregunta abierta 3: ¿eliminar una plantilla pide confirmación? Opciones: (a) `confirm` nativo, como en `TaskList`, porque el borrado es definitivo (sin papelera de plantillas); (b) sin confirmación. **Recomendación: (a)**.
- Pregunta abierta 4: ¿el aviso del `409` se queda en el mensaje global del interceptor o hay un texto propio de la plantilla? Opciones: (a) mensaje global, sin código extra; (b) texto específico ("Esta plantilla tiene tareas asociadas y no se puede eliminar") en `TemplateList`. **Recomendación: (b)**, es más claro para el criterio 4 y no cambia la API; el interceptor sigue mostrando su aviso o se sustituye solo en esta pantalla.
- Pregunta abierta 5: el formulario de plantilla, ¿muestra el detalle (F-08) con una pantalla propia? Opciones: (a) no, el detalle se cubre al cargar el formulario de edición con `get(id)`; (b) pantalla de detalle aparte. **Recomendación: (a)**, §6 solo define lista y formulario.
