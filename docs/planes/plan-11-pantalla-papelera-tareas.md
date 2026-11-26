# Plan del issue #11 — Pantalla de papelera de tareas

- **Issue:** #11 · **Rama:** feature/11-pantalla-papelera-tareas · **Fecha:** 2026-11-26

## Objetivo
Pantalla Angular `/tasks/trash` para ver las tareas eliminadas y restaurarlas (F-13, F-14).

## Criterios de aceptación
1. Dado tareas eliminadas, cuando abro `/tasks/trash`, entonces las veo. (F-13, RN-10)
2. Dado una tarea en la papelera, cuando pulso restaurar, entonces desaparece de la papelera y vuelve a `/tasks`. (F-14, RN-10)

## Alcance
| Capa | ¿Se toca? | Motivo |
|---|---|---|
| Análisis | no | §4 (`GET /api/tasks/trash`, `POST /api/tasks/{id}/restore`) y §6 (ruta `/tasks/trash`, carpeta `task-trash/`) ya lo recogen. |
| Backend: modelo · dto · servicio · api | no | Los dos endpoints ya existen en `TaskController` (`trash`, `restore`) con `TaskService::restore()` y sus tests. |
| Frontend | sí | Falta el componente `task-trash`, su ruta y el enlace "Papelera" en la navegación. Los métodos `trash()` y `restore()` de `TaskApiService` (primera tarea del issue) ya existen y tienen test (`task-api.service.spec.ts`), por lo que se descartan. |
| Pruebas | sí | Tests Vitest del componente y de la ruta/navegación. Los tests de backend ya cubren los endpoints. |

## Pasos
| # | Agente | Skill | Qué hace | Ficheros previstos |
|---|---|---|---|---|
| 1 | implementador-frontend | frontend (crear) | Componente standalone `TaskTrash`: carga `api.trash()` al iniciar; lista título, estado (completada/pendiente) y fecha de borrado (`deletedAt`); estados de carga, error con "Reintentar" y vacío ("La papelera está vacía"); botón "Restaurar" por fila (con `busy` por id como en `TaskList`) que llama a `api.restore(id)`, quita la fila y anuncia "Tarea restaurada." con `MessageService`. Sin editar ni completar (RN-13). | `frontend/src/app/features/tasks/task-trash/task-trash.ts`, `.html`, `.css` |
| 2 | implementador-frontend | frontend (crear) | Ruta `tasks/trash` (carga perezosa) y enlace "Papelera" en la navegación principal; actualizar el comentario de `app.routes.ts`. Colocar la ruta sin conflicto con `tasks/:id/edit`. | `frontend/src/app/app.routes.ts`, `frontend/src/app/app.html` |
| 3 | implementador-frontend | frontend (crear) | Tests Vitest del componente (ver "Tests previstos"). | `frontend/src/app/features/tasks/task-trash/task-trash.spec.ts` |
| 4 | verificador | frontend (ejecutar `frontend-test.ps1`) | Ejecuta `scripts/frontend-test.ps1` (Vitest y build) y cruza criterios con tests. No hace falta `backend-test.ps1`: el backend no cambia. | — |
| 5 | orquestador | bitacora, mensaje-commit | Bitácora, commit `feat: pantalla de papelera de tareas (#11)`, PR con `Closes #11` y merge con tests en verde. | `docs/bitacora.md` |

## Tests previstos
| Criterio | Test |
|---|---|
| 1 | `describe('TaskTrash')` → `it('should list the tasks returned by the trash endpoint')` (mock de `GET /api/tasks/trash`, comprueba filas con título) |
| 1 | `describe('TaskTrash')` → `it('should show an empty message when the trash has no tasks')` |
| 1 | `describe('TaskTrash')` → `it('should show a retry button when loading fails')` |
| 2 | `describe('TaskTrash')` → `it('should call POST restore and remove the row when restoring a task')` |
| 2 | `describe('TaskTrash')` → `it('should keep the row and re-enable the button when restore fails')` |
| 2 | `describe('routes')` (en `app.spec.ts` o spec de rutas) → `it('should resolve /tasks/trash to TaskTrash')`; `it('should show the restored task in /tasks')` en `TaskList` ya queda cubierto porque `TaskList` recarga `api.list()` en cada `ngOnInit` (comprobar con un test de navegación `/tasks/trash` → `/tasks` que verifique una nueva petición `GET /api/tasks`) |

## Dependencias, riesgos y preguntas abiertas
- Dependencias: `TaskApiService.trash()/restore()`, `MessageService` y el interceptor de errores ya existen; endpoints del backend listos (v0.1).
- Riesgo menor: `docs/diseno/pantallas-tareas.md` no especifica la pantalla de papelera (solo deja preparado el enlace). Se reutilizan las clases y patrones visuales de la lista.
- Pregunta abierta 1: ¿se pide especificación visual previa (agente `disenador-ui`) o se reutiliza el estilo de la lista? Opciones: (a) reutilizar el estilo de la lista, sin diseño; (b) ejecutar `/disenar-ui` antes del paso 1. **Recomendación: (a)**, la pantalla es una lista simple y el issue no pide más.
- Pregunta abierta 2: ¿restaurar pide confirmación? Opciones: (a) sin confirmación, es reversible (se puede volver a eliminar); (b) `confirm` nativo. **Recomendación: (a)**.
- Pregunta abierta 3: si `restore` devuelve `409` (la tarea ya no está en la papelera, p. ej. restaurada en otra pestaña), ¿qué hace la pantalla? Opciones: (a) mostrar el aviso global del interceptor y recargar la papelera; (b) solo el aviso. **Recomendación: (a)**.
