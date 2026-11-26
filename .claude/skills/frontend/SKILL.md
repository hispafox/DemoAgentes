---
name: frontend
description: >-
  Crea y actualiza el frontend Angular de DemoAgentes (Lista de Tareas) en
  frontend/: proyecto, proxy a la API, modelos, servicios HTTP, interceptor de
  errores problem+json, pipes, pantallas, rutas y sus tests, siempre a partir de
  la sección "Frontend Angular" de docs/analisis.md (§6) y de los endpoints de §4.
  Modo "proyecto": crea el proyecto Angular (issue #3). Modo "crear": genera las
  pantallas y servicios que el análisis define para un issue. Modo "actualizar":
  aplica un cambio de pantalla primero en el análisis y después en el código.
  Modo "revisar": compara análisis, API y frontend sin tocar nada. Úsalo siempre
  que se hable de Angular, frontend, pantallas, componentes, formularios, rutas,
  servicios HTTP, proxy o tests de componentes, aunque el usuario no nombre el
  skill.
---

# Frontend Angular

El frontend es una aplicación Angular que consume la API REST del backend. Su fuente de verdad es `docs/analisis.md` §6 "Frontend Angular" (carpetas, rutas y pantallas) y §4 "API REST" (endpoints, formato de los DTO y errores), más las convenciones de Angular del CLAUDE.md.

Elige el modo según el argumento:
- `proyecto` → **Modo proyecto** (solo una vez, issue #3)
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
| **Lee** | `docs/analisis.md` §4 (endpoints y DTO) y §6 (pantallas y rutas); CLAUDE.md (convenciones de Angular); los DTO de salida del backend (`backend/src/Dto/*Output.php`), que son el contrato real |
| **Escribe** | `frontend/` (código, tests y configuración) |
| **No toca** | El backend. Si la pantalla necesita algo que la API no da, se para y lo propone con `analisis-diseno` y `api` |
| **Prerrequisito** | Los endpoints que usa la pantalla existen y están fusionados en `main` (`php bin/console debug:router`). Si no, el skill **se detiene** |
| **Verificación mínima** | `npm run build` sin errores, `npm test` en verde y una prueba manual con el backend levantado |
| **Entregable** | Las pantallas del issue, con una tabla ruta → componente → endpoints → funcionalidad (F-xx) |

**Frontera con el backend:** las reglas de negocio viven en el backend. El frontend valida para la experiencia de uso (título obligatorio, longitud máxima), pero nunca decide por su cuenta lo que decide la API: la siguiente ocurrencia, si se puede borrar una plantilla o la fecha de creación salen siempre de la respuesta.

---

## 0. Antes de tocar nada

1. **Lee** el CLAUDE.md, las secciones 4 y 6 del análisis y el issue (`gh issue view <nº>`), sobre todo sus criterios de aceptación.
2. **Issue y rama:** no se implementa nada sin issue; trabaja en `feature/<nº>-descripcion`.
3. **Firmas (aviso):** mira la sección "Firmas" del CLAUDE.md. Si el análisis no está firmado, avisa en una línea ("⚠️ Sin firmar: …") y sigue; las firmas nunca bloquean.
4. **Estado del repositorio:** `git status --short`. No mezcles cambios ajenos.
5. **Versiones:** `node -v` (Node 22 LTS o superior) y `npx @angular/cli version`. Usa la última versión estable de Angular y lo que genere su CLI por defecto; no copies patrones de versiones antiguas (NgModules, `*ngIf`, constructor con todos los servicios).

---

## Modo proyecto (issue #3)

1. **Crear** desde la raíz del repositorio, sin repositorio Git propio:

   ```bash
   npx @angular/cli@latest new frontend --routing --style=css --skip-git --ssr=false --strict
   ```

   Si el CLI pregunta algo más, acepta lo recomendado. Usa el *test runner* que trae el proyecto nuevo (Vitest en las versiones recientes) y apunta cuál es en la bitácora: el CLAUDE.md dice "Jest/Karma", así que propón corregirlo si no coincide.
2. **Carpetas** vacías con su papel: `src/app/core/` (api, interceptors, models), `src/app/shared/` y `src/app/features/`.
3. **Proxy** en `frontend/proxy.conf.json`, enlazado en `angular.json` (`serve.options.proxyConfig`), para que `/api` llegue al backend sin CORS:

   ```json
   { "/api": { "target": "http://127.0.0.1:8000", "secure": false } }
   ```

4. **`HttpClient`** en `app.config.ts`: `provideHttpClient(withInterceptors([errorInterceptor]))`.
5. **Interceptor de errores** (`core/interceptors/error.interceptor.ts`): traduce las respuestas `application/problem+json` a un mensaje en castellano y lo deja en un servicio de mensajes que muestra la pantalla (ver "Errores").
6. **Scripts:** `npm start` sirve en `localhost:4200` con el proxy y `npm test` ejecuta los tests una vez, sin modo *watch*, para que valga para la CI (`.github/ci-pendiente.yml`; ajusta allí el comando si cambia).
7. **`scripts/`:** añade `frontend-setup.ps1` (`npm install`), `frontend-start.ps1` (`npm start`) y `frontend-test.ps1` (`npm test`), con el mismo estilo que los del backend, y apúntalos en "Comandos" del CLAUDE.md y en el README.
8. **Verifica** (con el backend levantado, `GET /api/tasks` desde `localhost:4200` responde sin error de CORS) y **entrega**.

## Modo crear

1. **Inventario:** lista las rutas y pantallas de §6 que cubre el issue y lo que ya existe en `frontend/src/app/`. Crea solo lo que falte.
2. **Modelos** en `core/models/`, copiados de los DTO de salida del backend (ver "Modelos").
3. **Servicio HTTP** del recurso en `core/api/`, un método por endpoint de §4 que use la pantalla.
4. **Pantallas** en `features/<bloque>/<pantalla>/` y sus rutas en `app.routes.ts`.
5. **Pipes y componentes reutilizables** en `shared/` (por ejemplo, `recurrenceLabel`: `daily` → "Diaria").
6. **Tests** (ver "Tests").
7. **Verifica** y **entrega**.

## Modo actualizar

1. Si el cambio **no está en el análisis**, aplícalo primero con `/analisis-diseno actualizar`.
2. Si necesita un cambio de la API, se hace antes en el backend, con su issue, y aquí se adapta el modelo y el servicio HTTP.
3. Cambia la pantalla y sus tests. **Verifica** y **entrega**.

## Modo revisar

Solo lee y compara:
- Rutas de `app.routes.ts` frente a la tabla de rutas de §6.
- Métodos de los servicios HTTP frente a los endpoints de §4 (verbo, ruta y tipo de respuesta).
- Modelos frente a los DTO de salida del backend (nombres y tipos de los campos).
- Criterios de aceptación de los issues de frontend frente a los tests.

Devuelve:

| # | Dónde | Análisis / API | Frontend | Qué hacer |
|---|---|---|---|---|

y termina proponiendo `crear` o `actualizar` para cada diferencia, sin aplicarlo.

---

## Convenciones

- **Componentes standalone**, con los nombres de fichero y clase que genera `ng generate` en la versión instalada (`ng g c features/tasks/task-list`). No se usan NgModules.
- **Estado con signals** (`signal`, `computed`) en los componentes; plantillas con el control de flujo nuevo (`@if`, `@for` con `track`, `@empty`).
- **Inyección con `inject()`** en lugar de parámetros del constructor.
- **Formularios reactivos tipados** (`FormGroup` con `FormControl<string>` y `nonNullable: true`), con `Validators.required` y `Validators.maxLength(255)` en el título, como en el backend (RN-01, RN-07). El botón de guardar no envía si el formulario no es válido, y los errores se muestran junto al campo.
- **Periodicidad:** un check "repetitiva" y un selector con `daily`, `weekly` y `monthly`; si no es repetitiva, se envía `recurrence: null`.
- **Rutas** perezosas por bloque (`loadComponent`), con los caminos de §6 (`/tasks`, `/tasks/new`, `/tasks/:id/edit`, `/tasks/trash`, `/templates`…) y `''` redirigido a `/tasks`.
- **Textos de la interfaz en castellano**; código, nombres y comentarios en inglés (ADR-0002).
- **Fechas:** se reciben en ISO 8601 y se muestran con el pipe `date` y el formato español; no se calculan en el frontend.
- **Claridad antes que sofisticación:** es una demo didáctica. Sin librerías de estado ni de componentes salvo que se decida con un ADR; CSS sencillo.
- **Cada componente y servicio** lleva un comentario con lo que cubre: `// F-06: complete a task`.

## Modelos

Los modelos son interfaces TypeScript que copian los DTO de salida (`backend/src/Dto/*Output.php`) y la entrada de §4:

```ts
export type Recurrence = 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;          // ISO 8601
  recurrence: Recurrence | null;
  nextOccurrenceDate: string | null; // YYYY-MM-DD
  templateId: number | null;
  deletedAt: string | null;
}

export interface TaskInput {
  title: string;
  recurrence: Recurrence | null;
}

export interface CompleteTaskResult {
  task: Task;
  nextOccurrence: Task | null;
}
```

Si el backend cambia un DTO, el modelo cambia en el mismo issue.

## Servicios HTTP

Un servicio por recurso, con la ruta relativa `/api/...` (el proxy hace el resto) y un método por endpoint:

| Servicio | Métodos |
|---|---|
| `TaskApiService` | `list()`, `get(id)`, `create(input)`, `update(id, input)`, `complete(id)`, `delete(id)`, `trash()`, `restore(id)` |
| `TaskTemplateApiService` | `list()`, `get(id)`, `create(input)`, `update(id, input)`, `delete(id)`, `instantiate(id)` |
| `CategoryApiService` *(v0.2)* | `list()`, `create(input)`, `rename(id, input)`, `delete(id)` |

Devuelven `Observable` tipados (`this.http.get<Task[]>('/api/tasks')`). No guardan estado ni muestran mensajes.

## Errores

- El **interceptor** lee las respuestas de error. Si son `application/problem+json`:
  - `422`: une los `violations[].title` en un mensaje y deja disponibles las violaciones por `propertyPath` para marcar el campo.
  - `404`: "No se ha encontrado el elemento."
  - `409`: el `detail` de la respuesta en un mensaje claro según la pantalla (por ejemplo, "No se puede eliminar una plantilla que tiene tareas.").
  - Cualquier otro: "Ha ocurrido un error inesperado."
- El mensaje se publica en un `MessageService` de `core/` (un `signal` con el último error) que el componente raíz muestra en un aviso. El interceptor relanza el error para que la pantalla pueda reaccionar (por ejemplo, no navegar).
- Los textos de los mensajes son de la interfaz, así que van en castellano.

## Tests

Con el *test runner* del proyecto (`npm test`) y `TestBed`:
- **Servicios HTTP:** con `provideHttpClientTesting()` y `HttpTestingController`; cada método llama al verbo y la ruta de §4.
- **Interceptor:** un `422`, un `409` y un `404` en `problem+json` producen el mensaje esperado.
- **Componentes:** con el servicio HTTP sustituido por un doble. Al menos un test por criterio de aceptación del issue (por ejemplo: "en las completadas no hay botón completar", "con título vacío no se envía").
- **Pipes:** cada valor del enum y `null`.

Nombres: `describe('TaskList')` e `it('should …')` en inglés, un `it` por comportamiento.

## Verificación

```bash
cd frontend
npm run build
npm test
```

Prueba manual: `.\scripts\backend-start.ps1` y `npm start`. Recorre en `http://localhost:4200` el camino feliz de cada pantalla del issue y al menos un error de la API (`422` con título vacío si se fuerza el envío, `409` al borrar una plantilla con tareas), y comprueba en las herramientas del navegador que no hay errores de CORS ni de consola.

## Entrega

> **Si te ha cargado un orquestador** (el skill `nueva-feature` o un agente), devuelve solo los puntos de resumen: la bitácora, el commit y la PR los hace quien orquesta, una sola vez al final. Los pasos de bitácora, commit y PR de abajo son para cuando el skill trabaja solo.

1. Tabla ruta → componente → endpoints → funcionalidad (F-xx), y el resultado de `npm test` y de la prueba manual.
2. Si cambió el análisis, dilo: ha perdido la firma.
3. El CRITERIO de la Fase 6 es la **revisión funcional de las pantallas**: deja a la persona los pasos para verlas.
4. Registra el paso con `bitacora` y haz commit con `mensaje-commit` (`feat: … (#<nº>)`). La PR lleva `Closes #<nº>` y solo se abre con los tests en verde; el agente la fusiona en cuanto lo están (regla de merge del CLAUDE.md).
