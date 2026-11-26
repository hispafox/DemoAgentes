---
name: api
description: >-
  Crea y actualiza la API REST de DemoAgentes (Lista de Tareas): controladores
  Symfony en backend/src/Controller, rutas, códigos HTTP, cabecera Location y
  errores en application/problem+json, siempre a partir de la sección "API
  REST" de docs/analisis.md. Modo "crear": genera los endpoints que el análisis
  define para un issue. Modo "actualizar": aplica un cambio de endpoint primero
  en el análisis y después en el código. Modo "revisar": compara las rutas
  registradas con el análisis sin tocar nada. Úsalo siempre que se hable de
  controladores, endpoints, rutas, códigos de estado, errores 404/409/422 o
  problem+json, aunque el usuario no nombre el skill.
---

# API REST

Los controladores son la capa HTTP: reciben la petición, delegan en el servicio y devuelven un DTO de salida con el código correcto. Su fuente de verdad es `docs/analisis.md` §4 "API REST" (una tabla de endpoints por recurso, con ruta, verbo, respuesta y errores) y las convenciones de API del CLAUDE.md.

Elige el modo según el argumento:
- `crear` → **Modo crear**
- `actualizar <cambio>` → **Modo actualizar**
- `revisar` o sin argumento → **Modo revisar**

---

## Lugar en la orquestación de skills

```
analisis-diseno ──► modelo ──► dto ──► servicio ──► api ──► frontend ──► pruebas ──► commit
                                                   (este skill)
```

| | |
|---|---|
| **Lee** | `docs/analisis.md` §4 (endpoints, DTO y formato de errores); CLAUDE.md (convenciones de API); servicios y DTO ya creados |
| **Escribe** | `backend/src/Controller/` y la configuración de errores (`backend/config/packages/framework.yaml`, secciones `exceptions` y `request.formats`) |
| **No toca** | Entidades, servicios, DTO ni frontend |
| **Prerrequisito** | El análisis define el endpoint, y existen el servicio (skill `servicio`) y los DTO (skill `dto`) que usa. Si falta algo, el skill **se detiene** |
| **Verificación mínima** | `php -l`, `lint:container`, `debug:router` con las rutas del análisis y una prueba manual con el servidor de desarrollo |
| **Entregable** | Los endpoints del issue, con una tabla ruta → método del servicio → códigos → funcionalidad (F-xx) |

**Frontera con el servicio:** el controlador no contiene lógica de negocio ni toca el repositorio o el `EntityManager`. Si necesita decidir algo más que "qué servicio llamar y qué código devolver", esa decisión es del servicio.

---

## 0. Antes de tocar nada

1. **Lee** el CLAUDE.md, la sección 4 del análisis y los servicios y DTO afectados.
2. **Issue y rama:** no se implementa nada sin issue (`gh issue view <nº>`); trabaja en `feature/<nº>-descripcion`.
3. **Firmas (aviso):** mira la sección "Firmas" del CLAUDE.md. Si el análisis no está firmado, avisa en una línea ("⚠️ Sin firmar: …") y sigue; las firmas nunca bloquean.
4. **Estado del repositorio:** `git status --short`. No mezcles cambios ajenos.

---

## Modo crear

1. **Inventario:** lista los endpoints de §4 que cubre el issue y compáralos con `php bin/console debug:router`. Crea solo lo que falte.
2. **Controlador** del recurso, según las convenciones de abajo.
3. **Errores:** comprueba que cada excepción de dominio que lanza el servicio tiene su código (ver "Errores"). Si falta, añádela a la configuración.
4. **Verifica** y **entrega**.

## Modo actualizar

1. Si el cambio **no está en el análisis**, aplícalo primero con `/analisis-diseno actualizar`.
2. Cambia el controlador y avisa si rompe el frontend (servicios HTTP de `frontend/src/app/core/api/`).
3. **Verifica** y **entrega**.

## Modo revisar

Solo lee y compara. Cruza `php bin/console debug:router` con las tablas de §4: verbo, ruta, nombre de la ruta, código de éxito, cabecera `Location` y errores. Devuelve:

| Endpoint | Análisis | Código | Qué hacer |
|---|---|---|---|

y termina proponiendo `crear` o `actualizar` para cada diferencia, sin aplicarlo.

---

## Convenciones

- **Un controlador por recurso:** `final class TaskController extends AbstractController` en `src/Controller/`, con `#[Route('/api/tasks', name: 'api_tasks_', format: 'json')]` en la clase y una acción por endpoint. El `format: 'json'` hace que los errores salgan en JSON aunque la petición no mande `Accept: application/json`; sin él, Symfony los devuelve en HTML (bitácora, paso 41).
- **Rutas** con verbo y requisito de id: `#[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]`. Las rutas fijas (`/trash`) van antes que las de `{id}` o llevan el requisito para no confundirse.
- **Entrada:** `#[MapRequestPayload] TaskInput $input`. Symfony devuelve solo `400` si el JSON está mal formado y `422` con la lista de violaciones si no pasa la validación.
- **Carga del recurso:** por id con el servicio (`$this->taskService->getTask($id)`), no con `#[MapEntity]`, para que una tarea de la papelera responda `404` (RN-13).
- **Salida:** siempre un DTO de salida, nunca una entidad: `return $this->json(TaskOutput::fromEntity($task));`.
- **Códigos:**
  - `200` con el DTO en lecturas, modificaciones y acciones (`/complete`, `/restore`).
  - `201` con el DTO y la cabecera `Location` al crear: `$this->json($output, 201, ['Location' => $this->generateUrl('api_tasks_show', ['id' => $task->getId()])])`.
  - `204` sin cuerpo al borrar: `return new Response(null, 204);`.
- **Acciones con efectos** como subrecurso `POST` (`/{id}/complete`, `/{id}/restore`, `/{id}/instantiate`).
- **Cada acción** lleva un comentario con la funcionalidad: `// F-06: complete a task (RN-05, RN-11)`.

## Errores

Todas las respuestas de error van en `application/problem+json` (RFC 9457).

1. **Excepciones de dominio → código**, en `config/packages/framework.yaml`, sin que el dominio sepa nada de HTTP:

   ```yaml
   framework:
       exceptions:
           App\Service\Exception\ResourceNotFound: { status_code: 404 }
           App\Entity\Exception\DomainRuleViolation: { status_code: 409 }
   ```

2. **`InvalidInput` → `422`** con la violación en su campo: la acción la captura y lanza una `ValidationFailedException` con un `ConstraintViolationList`, para que salga con el mismo formato que la validación del DTO.
3. **Cabecera `application/problem+json`:** el renderizador de errores de Symfony usa el primer tipo MIME del formato de la petición. Ya está configurado en `framework.yaml` para que el formato `json` liste primero `application/problem+json` (bitácora, paso 44):

   ```yaml
   framework:
       request:
           formats:
               json: ['application/problem+json', 'application/json']
   ```

   Las respuestas correctas no cambian, porque `JsonResponse` fija su propio `application/json`. El `format: 'json'` solo se aplica cuando la ruta **coincide**; para las peticiones de `/api` que no coinciden con ninguna ruta (id no numérico, ruta inexistente o método no permitido) está `src/EventListener/ApiJsonFormatSubscriber.php`, que fija el formato JSON antes del router (issue #23). Cada controlador nuevo solo necesita `format: 'json'` en su ruta, y sus tests funcionales comprueban la cabecera con `assertResponseHeaderSame('Content-Type', 'application/problem+json')`.

## Verificación

```bash
cd backend
php -l src/Controller/<Fichero>.php
php bin/console lint:container
php bin/console debug:router | grep api_
```

Prueba manual con el servidor (`.\scripts\backend-start.ps1`) y `curl` o `Invoke-RestMethod`: el camino feliz de cada endpoint y al menos un `404`, un `422` y, si aplica, un `409`, comprobando código, cuerpo y cabecera. Para los `422` y `404`, con `curl -i` se ve la cabecera `Content-Type`.

**Tests:** la prueba manual no sustituye a los tests funcionales de §8 (`TaskControllerTest`…), que se escriben con el skill `pruebas` antes de abrir la PR.

## Entrega

> **Si te ha cargado un orquestador** (el skill `nueva-feature` o un agente), devuelve solo los puntos de resumen: la bitácora, el commit y la PR los hace quien orquesta, una sola vez al final. Los pasos de bitácora, commit y PR de abajo son para cuando el skill trabaja solo.

1. Tabla de endpoints creados o cambiados: verbo, ruta, método del servicio, códigos y funcionalidad (F-xx), y el resultado de la prueba manual.
2. Si cambió el análisis, dilo: ha perdido la firma.
3. Siguiente tramo: `frontend` (servicios HTTP y pantallas) o la PR del issue.
4. Registra el paso con `bitacora` y haz commit con `mensaje-commit` (`feat: … (#<nº>)`). La PR lleva `Closes #<nº>` y solo se abre con los tests en verde. El agente la fusiona en cuanto los tests están en verde (regla de merge del CLAUDE.md).
