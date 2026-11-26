# Plan del issue #15 — Categorías de tareas

- **Issue:** #15 · **Rama:** feature/15-categorias-de-tareas · **Fecha:** 2026-11-26

## Objetivo
Permitir al usuario gestionar categorías (listar, crear, renombrar, eliminar) y asignar a cada tarea cero o una categoría, en API y en Angular (F-15 a F-19, RN-14 a RN-17, versión 0.2).

## Criterios de aceptación
1. Dado un nombre válido, cuando hago `POST /api/categories`, entonces recibo `201` con la categoría y cabecera `Location`. (F-16)
2. Dado un nombre vacío, cuando creo o renombro, entonces recibo `422`. (RN-14)
3. Dado que existe "Casa", cuando creo o renombro otra categoría como " casa ", entonces recibo `422`. (RN-17)
4. Dado una categoría, cuando la renombro con su mismo nombre, entonces recibo `200`. (F-17, RN-17)
5. Dado categorías, cuando hago `GET /api/categories`, entonces las recibo todas. (F-15)
6. Dado una tarea, cuando la creo o modifico con `categoryId`, entonces queda con esa categoría; con `categoryId: null`, sin categoría. (F-19, RN-15)
7. Dado un `categoryId` inexistente, cuando creo o modifico una tarea, entonces recibo `422`. (F-19)
8. Dado una categoría con tareas (también en la papelera), cuando hago `DELETE`, entonces recibo `409`. (F-18, RN-16)
9. Dado una categoría sin tareas, cuando hago `DELETE`, entonces recibo `204` y se borra definitivamente. (F-18)
10. Dado el frontend, cuando abro `/categories`, entonces veo la lista y puedo crear, renombrar y eliminar, y veo el aviso si el servidor responde `409` o `422`. (F-15 a F-18, §6 del análisis; criterio derivado, el issue solo lista los de API)
11. Dado el formulario de tarea, cuando elijo, cambio o quito la categoría y guardo, entonces la tarea se envía con ese `categoryId` (o `null`). (F-19, §6 del análisis; criterio derivado)

## Alcance
| Capa | ¿Se toca? | Motivo |
|---|---|---|
| Análisis | no | §3 (`Category`, `Task.category`, `existsWithName`, `countByCategory`, índice `uniq_category_name`), §4 (`/api/categories`, `categoryId` en `TaskInput`/`TaskOutput`), §5 (validación y `CategoryService::delete`), §6 (`/categories`, selector) y §8 (tests de categorías) ya lo recogen. Único desajuste: el texto del issue dice "tests diferidos", obsoleto desde la reactivación de la Fase 5. |
| Backend: modelo | sí | No existe `Category` ni `Task.category` (solo `Task`, `TaskTemplate`, `Recurrence`). Hay que crear entidad, repositorio, relación, `TaskRepository::countByCategory()` y migración (hoy hay 3 migraciones, ninguna de categorías). |
| Backend: dto | sí | Crear `CategoryInput` y `CategoryOutput`; añadir `categoryId` a `TaskInput` y `TaskOutput` (el comentario de `TaskOutput` ya anticipa el cambio en #15). |
| Backend: servicio | sí | Crear `CategoryService` (list, get, create, rename, delete con RN-16, unicidad RN-17) y excepción `ResourceNotFound::category()`; `TaskService::create/update` resuelven `categoryId`. |
| Backend: api | sí | `CategoryController` con 4 rutas (hoy `debug:router` solo muestra tasks y task-templates); `TaskController` no cambia de rutas. |
| Frontend | sí | No hay modelo ni servicio de categorías ni carpeta `features/categories/`. Hay que añadir `Category`, `CategoryApiService`, `category-list`, la ruta `/categories`, enlace de navegación y el selector en `task-form`; ampliar `Task`/`TaskInput` con `categoryId`. Se reutilizan `MessageService`, el interceptor de errores (ya traduce `409` y `422`) y los patrones de `TemplateList`. |
| Plantillas | no | Fuera de alcance de la v0.2: la plantilla no tiene categoría y la tarea instanciada nace sin ella (documentación funcional, "Fuera de alcance"). |
| Pruebas | sí | PHPUnit (unitarios y funcionales) y Vitest; cada criterio con al menos un test. |

## Pasos
| # | Agente | Skill | Qué hace | Ficheros previstos |
|---|---|---|---|---|
| 1 | implementador-backend | modelo (crear) | Entidad `Category` (`id`, `name` varchar 100, `rename()` que recorta y rechaza vacío, RN-14) con atributos ORM e índice único `uniq_category_name`; `CategoryRepository::existsWithName(name, ?exceptId)` con `LOWER(TRIM(name))`; en `Task`, `?Category $category` (`ManyToOne`, `category_id` nullable, `ON DELETE RESTRICT`) con getter y setter; `TaskRepository::countByCategory()` (incluye papelera); migración. Comprobar `doctrine:schema:validate`. | `backend/src/Entity/Category.php`, `backend/src/Entity/Task.php`, `backend/src/Repository/CategoryRepository.php`, `backend/src/Repository/TaskRepository.php`, `backend/migrations/Version<fecha>.php` |
| 2 | implementador-backend | dto (crear) | `CategoryInput` (`name`: `NotBlank` con trim, `Length(max: 100)`) y `CategoryOutput` (`id`, `name`, `fromEntity`); `categoryId` (`?int`, por defecto `null`) en `TaskInput` y `categoryId` en `TaskOutput`. | `backend/src/Dto/CategoryInput.php`, `backend/src/Dto/CategoryOutput.php`, `backend/src/Dto/TaskInput.php`, `backend/src/Dto/TaskOutput.php` |
| 3 | implementador-backend | servicio (crear) | `CategoryService`: `list`, `getCategory` (404), `create` y `rename` (comprueban `existsWithName`; duplicado, `422` con violación en `name`; renombrar con el mismo nombre excluye el propio id), `delete` (RN-16, `DomainRuleViolation` → `409`). `ResourceNotFound::category()`. `TaskService::create/update` buscan la categoría por `categoryId` y devuelven `422` si no existe; `null` la quita. | `backend/src/Service/CategoryService.php`, `backend/src/Service/Exception/ResourceNotFound.php`, `backend/src/Service/TaskService.php` |
| 4 | implementador-backend | api (crear) | `CategoryController` con prefijo `/api/categories` y `format: 'json'`: `GET` lista, `POST` (`201` + `Location`), `PUT /{id}`, `DELETE /{id}` (`204`), con `requirements: id \d+`. Comprobar con `debug:router` que salen las 4 rutas. | `backend/src/Controller/CategoryController.php` |
| 5 | implementador-backend | pruebas (crear) | Tests PHPUnit de la tabla "Tests previstos" y ajuste de los tests existentes de `Task` que comparan el JSON de `TaskOutput` (campo nuevo `categoryId`). | `backend/tests/Unit/Entity/CategoryTest.php`, `backend/tests/Unit/Service/CategoryServiceTest.php`, `backend/tests/Unit/Service/TaskServiceTest.php`, `backend/tests/Functional/Repository/CategoryRepositoryTest.php`, `backend/tests/Functional/Controller/CategoryControllerTest.php`, `backend/tests/Functional/Controller/TaskControllerTest.php` |
| 6 | implementador-frontend | frontend (crear) | Modelo `Category` y `CategoryInput`; `categoryId: number \| null` en `Task` y `TaskInput`; `CategoryApiService` (`list`, `create`, `update`, `delete`). Ajustar a mano los `Task` de los specs existentes para que compilen. | `frontend/src/app/core/models/category.ts`, `frontend/src/app/core/models/task.ts`, `frontend/src/app/core/api/category-api.service.ts` |
| 7 | implementador-frontend | frontend (crear) | Componente `CategoryList`: estados de carga, error con "Reintentar" y vacío; crear con campo de nombre; renombrar en línea; eliminar con confirmación; errores `422` (nombre vacío o repetido) y `409` (con tareas) visibles; anuncios con `MessageService`. Ruta `categories` con carga perezosa, enlace "Categorías" en la navegación y comentario de `app.routes.ts` actualizado. | `frontend/src/app/features/categories/category-list/category-list.ts`, `.html`, `.css`, `frontend/src/app/app.routes.ts`, `frontend/src/app/app.html` |
| 8 | implementador-frontend | frontend (actualizar) | `TaskForm`: selector de categoría opcional ("Sin categoría" = `null`) cargado con `CategoryApiService.list()`; en edición preselecciona la actual; se envía `categoryId`. Mostrar o no la categoría en la lista de tareas según la pregunta abierta 3. | `frontend/src/app/features/tasks/task-form/task-form.ts`, `.html`, `.css` (y `task-list` si se decide) |
| 9 | implementador-frontend | frontend (crear) | Tests Vitest de la tabla "Tests previstos". | `frontend/src/app/core/api/category-api.service.spec.ts`, `frontend/src/app/features/categories/category-list/category-list.spec.ts`, `frontend/src/app/features/tasks/task-form/task-form.spec.ts`, `frontend/src/app/app.routes.spec.ts` |
| 10 | verificador | pruebas (ejecutar) | Ejecuta `scripts/backend-test.ps1` y `scripts/frontend-test.ps1`, cruza los 11 criterios con sus tests y comprueba `doctrine:schema:validate` con la migración aplicada en limpio. | — |
| 11 | orquestador | bitacora, mensaje-commit | Bitácora, commit `feat: categorías de tareas (#15)`, PR con `Closes #15` y merge con tests en verde. Actualizar en el CLAUDE.md el estado de la Fase 4 y la 6 solo si lo pide la persona. | `docs/bitacora.md` |

## Tests previstos
| Criterio | Test |
|---|---|
| 1 | `CategoryControllerTest::testCreateReturns201WithLocation` |
| 2 | `CategoryTest::testRenameRejectsBlankName`, `CategoryTest::testConstructorRejectsBlankName`, `CategoryControllerTest::testCreateWithBlankNameReturns422`, `CategoryControllerTest::testRenameWithBlankNameReturns422` |
| 3 | `CategoryRepositoryTest::testExistsWithNameIgnoresCaseAndSurroundingSpaces`, `CategoryServiceTest::testCreateRejectsDuplicateName`, `CategoryControllerTest::testCreateDuplicateNameReturns422`, `CategoryControllerTest::testRenameToExistingNameReturns422` |
| 4 | `CategoryRepositoryTest::testExistsWithNameExcludesOwnId`, `CategoryControllerTest::testRenameWithOwnNameReturns200` |
| 5 | `CategoryControllerTest::testListReturnsAllCategories` |
| 6 | `TaskServiceTest::testCreateAssignsCategory`, `TaskServiceTest::testUpdateChangesAndRemovesCategory`, `TaskControllerTest::testCreateAndUpdateWithCategoryId`, `TaskControllerTest::testUpdateWithNullCategoryIdRemovesCategory` |
| 7 | `TaskServiceTest::testCreateWithUnknownCategoryFails`, `TaskControllerTest::testCreateWithUnknownCategoryIdReturns422`, `TaskControllerTest::testUpdateWithUnknownCategoryIdReturns422` |
| 8 | `CategoryServiceTest::testDeleteWithTasksThrowsRuleViolation`, `CategoryControllerTest::testDeleteCategoryWithTasksReturns409`, `CategoryControllerTest::testDeleteCategoryWithTaskInTrashReturns409`, `CategoryRepositoryTest` / `TaskRepositoryTest::testCountByCategoryIncludesTrash` (en la clase de repositorio donde viva `countByCategory`) |
| 9 | `CategoryServiceTest::testDeleteWithoutTasksRemovesCategory`, `CategoryControllerTest::testDeleteCategoryWithoutTasksReturns204AndRemovesIt` |
| 6, 7, 9 (rutas) | `CategoryControllerTest::testUnknownIdReturns404ForRenameAndDelete` (código `404` del análisis §4) |
| 10 | `describe('CategoryApiService')` → un `it` por método (`list`, `create`, `update`, `delete`) con `HttpTestingController` |
| 10 | `describe('CategoryList')` → `it('should list the categories')`, `it('should show an empty message when there are no categories')`, `it('should show a retry button when loading fails')`, `it('should create a category and add it to the list')`, `it('should rename a category in line')`, `it('should remove the row when the category is deleted')`, `it('should keep the row and show the notice when the server answers 409')`, `it('should show the error when the server answers 422')` |
| 10 | `describe('routes')` → `it('should resolve /categories to CategoryList')` |
| 11 | `describe('TaskForm')` → `it('should list the categories and send the chosen categoryId')`, `it('should preselect the current category when editing')`, `it('should send categoryId null when "Sin categoría" is chosen')` |

## Dependencias, riesgos y preguntas abiertas
- Dependencias: la entidad `Task` (#5) ya está en `main`, así que se cumple la dependencia del issue. El frontend (pasos 6 a 9) depende del contrato de los pasos 1 a 4, que no cambia; puede trabajar en paralelo si se respeta §4.
- Riesgo: SQLite y `ON DELETE RESTRICT`. La migración de `ALTER TABLE ... ADD COLUMN` con FK en SQLite se rehace con tabla temporal; revisar la migración generada y probar `schema:validate` en limpio.
- Riesgo: `TaskInput` es `readonly` con valores por defecto; `categoryId` ausente y `categoryId: null` dan lo mismo (quitar la categoría en `PUT`). Es coherente con "PUT reemplaza" y se documenta en un test.
- Riesgo (análisis §9, punto 3): la carrera entre dos peticiones simultáneas con "Casa" y "casa" se acepta en una demo de un solo usuario.
- Riesgo: añadir `categoryId` a `TaskOutput` rompe tests y mocks existentes de backend y frontend; el paso 5 y el paso 6 los ajustan y el verificador los ejecuta todos.
- El skill `servicio` ya nombra `CategoryService`, así que no hace falta cambiar skills.
- Pregunta abierta 1: ¿cómo se produce el `422` de un `categoryId` inexistente? El análisis solo dice "id de una categoría existente". Opciones: (a) restricción de validación propia en `TaskInput` que consulta el repositorio; (b) `CategoryService`/`TaskService` lanzan una `ValidationFailedException` con la violación en `categoryId`; (c) excepción de dominio mapeada a `422`. **Recomendación: (b)**, mantiene el DTO simple y la regla en el servicio, y da la misma forma de `violations` que el resto de `422`. Lo mismo para el duplicado de nombre (RN-17).
- Pregunta abierta 2: ¿se pide especificación visual previa (`/disenar-ui`) para `/categories` y el selector? `docs/diseno/pantallas-tareas.md` los dejó fuera expresamente (su pregunta 1). Opciones: (a) reutilizar el sistema visual existente sin diseño; (b) ejecutar `/disenar-ui` antes del paso 7. **Recomendación: (a)**, es una lista con un campo y botones como `TemplateList`; el selector es un `select` más del formulario.
- Pregunta abierta 3: ¿la lista de tareas muestra la categoría de cada tarea? El análisis §6 no lo exige (el diseño dice "podría"), y el issue no lo pide ni lo criterios. Opciones: (a) no, solo selector en el formulario; (b) sí, etiqueta con el nombre (requiere cargar `/api/categories` en `TaskList` o un nombre en `TaskOutput`, que cambia el contrato). **Recomendación: (a)**, para no ampliar el contrato ni el alcance; (b) pasaría a un issue aparte.
- Pregunta abierta 4: la tarea de la papelera, ¿puede conservar una categoría que ya no existe? No puede: RN-16 impide borrar categorías con tareas, también en papelera, así que no hay hueco. Solo se registra para que la persona confirme que no hay que ofrecer reasignar al eliminar. **Recomendación: sin reasignación**, tal como define RN-16.
- Pregunta abierta 5: orden de `GET /api/categories`. No lo define la documentación. Opciones: (a) por `id` (orden de creación, igual que plantillas); (b) alfabético por nombre. **Recomendación: (a)**, coherente con `TaskTemplateService::list` y sin añadir reglas.
- Pregunta abierta 6: renombrar en línea en Angular, ¿con botón "Guardar" o al perder el foco? El análisis solo dice "crear y renombrar en línea". Opciones: (a) botón Editar que abre un campo con Guardar y Cancelar; (b) guardar al salir del campo. **Recomendación: (a)**, es más accesible y evita guardados accidentales.
