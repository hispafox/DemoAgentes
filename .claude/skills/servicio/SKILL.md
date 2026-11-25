---
name: servicio
description: >-
  Crea y actualiza los servicios de lógica de negocio de DemoAgentes (Lista de
  Tareas) en backend/src/Service: TaskService, TaskTemplateService,
  CategoryService, RecurrenceCalculator y sus excepciones, siempre a partir de
  la sección "Lógica de negocio" de docs/analisis.md. Modo "crear": genera los
  métodos de servicio que el análisis define para un issue. Modo "actualizar":
  aplica un cambio de lógica primero en el análisis y después en el código.
  Modo "revisar": compara análisis y servicios sin tocar nada. Úsalo siempre
  que se hable de servicios, lógica de negocio, reglas entre entidades,
  recurrencia, papelera, transacciones o del reloj (ClockInterface), aunque el
  usuario no nombre el skill.
---

# Servicios de negocio

Los servicios aplican las reglas de negocio que no caben en una sola entidad: coordinan varias entidades, consultan el repositorio, usan el reloj y confirman los cambios en la base de datos. Su fuente de verdad es `docs/analisis.md` §5 "Lógica de negocio": un apartado por método, con la regla que aplica y el error que provoca.

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
| **Lee** | `docs/analisis.md` §5 (lógica), §3 (modelo) y §8 (plan de tests); reglas RN de `docs/app/lista-de-tareas.md`; entidades, repositorios y DTO ya creados |
| **Escribe** | `backend/src/Service/` (servicios, `RecurrenceCalculator` y `Service/Exception/`) y, si el análisis lo pide, consultas nuevas en `backend/src/Repository/` |
| **No toca** | Entidades (salvo avisar si falta un método de dominio), DTO, controladores ni frontend |
| **Prerrequisito** | El análisis define el método y su regla, y existen las entidades (skill `modelo`) y los DTO (skill `dto`) que usa. Si algo falta, el skill **se detiene** y no inventa reglas |
| **Verificación mínima** | `php -l` sin errores y el contenedor compila (`lint:container`), con el servicio autoinyectable |
| **Entregable** | Los métodos del issue, con una tabla de qué regla (RN-xx) aplica cada uno y qué excepción lanza |

**Frontera con el modelo:** lo que cambia el estado de **una** entidad y protege sus invariantes es un método de dominio (`Task::complete()` lanza una excepción si ya está completada, RN-11). El servicio lo llama, no lo reimplementa. Si falta el método de dominio, detente y propón `/modelo actualizar`.

**Frontera con la API:** el servicio no sabe nada de HTTP. No recibe `Request`, no devuelve `Response` ni DTO de salida, y no lanza excepciones HTTP. Lanza excepciones de dominio; el skill `api` las traduce a `404`, `409` o `422`.

---

## 0. Antes de tocar nada

1. **Lee** el CLAUDE.md, las secciones 3, 5 y 8 del análisis, las entidades, los repositorios y los DTO afectados.
2. **Issue y rama:** no se implementa nada sin issue (`gh issue view <nº>`); trabaja en `feature/<nº>-descripcion`.
3. **Firmas (aviso):** mira la sección "Firmas" del CLAUDE.md. Si el análisis no está firmado, avisa en una línea ("⚠️ Sin firmar: …") y sigue; las firmas nunca bloquean.
4. **Estado del repositorio:** `git status --short`. No mezcles cambios ajenos.

---

## Modo crear

1. **Inventario:** lista los métodos de §5 que cubre el issue y los que ya existen en `src/Service/`. Crea solo lo que falte.
2. **Huecos:** si un método necesita una decisión que el análisis no toma (quién calcula un valor, qué pasa con los datos relacionados), **detente** y propón `/analisis-diseno revisar`. No lo decidas en el código.
3. **Implementa** según las convenciones de abajo.
4. **Consultas de repositorio** que cite el análisis y aún no existan (`findActive()`, `countByTemplate()`…): añádelas con QueryBuilder o DQL portable.
5. **Verifica** y **entrega**.

## Modo actualizar

1. Si el cambio **no está en el análisis**, aplícalo primero con `/analisis-diseno actualizar`. Si cambia una regla de negocio, lo decide el PO.
2. Cambia el servicio y busca sus usos (`grep -rn "<Servicio>::\|<metodo>(" backend/src backend/tests`).
3. **Verifica** y **entrega**.

## Modo revisar

Solo lee y compara. Para cada apartado de §5, comprueba que existe el método, que aplica la regla en el orden descrito y que lanza la excepción indicada. Devuelve:

| Método | Análisis | Código | Qué hacer |
|---|---|---|---|

y termina proponiendo `crear` o `actualizar` para cada diferencia, sin aplicarlo.

---

## Convenciones

- **Clases:** `final class <Recurso>Service` en `src/Service/` (namespace `App\Service`). Un servicio por recurso (`TaskService`, `TaskTemplateService`, `CategoryService`) y servicios pequeños para cálculos puros (`RecurrenceCalculator`).
- **Inyección por constructor** con autowiring: `EntityManagerInterface`, los repositorios y `Psr\Clock\ClockInterface`. Nada de `new` para dependencias ni acceso al contenedor.
- **Fechas:** siempre del reloj (`$this->clock->now()`), nunca `new \DateTimeImmutable()`. Así los tests fijan la fecha con `MockClock`. La fecha "de hoy" para RN-05 y RN-18 sale de `now()->setTime(0, 0)`.
- **Entrada y salida:** los métodos reciben DTO de entrada o entidades (`create(TaskInput $input)`, `complete(Task $task)`) y devuelven entidades o resultados de dominio (`CompleteResult`). El controlador los convierte en DTO de salida.
- **Persistencia:** el servicio hace `persist()` y un único `flush()` al final de cada operación, para que todo se guarde en la misma transacción (completar y crear la siguiente ocurrencia, RN-05).
- **Búsqueda por id:** `get<Recurso>(int $id)` busca en el repositorio y lanza `ResourceNotFound` si no existe. Para tareas, solo busca entre las activas: una tarea de la papelera cuenta como inexistente salvo en `restore()` (RN-13).
- **Excepciones de dominio:**
  - `App\Entity\Exception\DomainRuleViolation`: el estado no permite la acción o se rompe una regla (→ `409`). El mensaje empieza por la regla: `'RN-12: a template with tasks cannot be deleted.'`.
  - `App\Service\Exception\ResourceNotFound`: el recurso no existe o está en la papelera (→ `404`).
  - Datos que solo se pueden validar con la base de datos (nombre duplicado RN-17, `categoryId` inexistente): `App\Service\Exception\InvalidInput` con el campo afectado (→ `422` con la violación en ese campo).
- **Docblock** de cada método público con la regla que aplica: `/** RN-11, RN-05: completes the task and, if recurring, creates the next occurrence. */`.
- **Claridad:** pasos en el mismo orden que el análisis, métodos cortos y sin lógica en los constructores.

## Verificación

```bash
cd backend
php -l src/Service/<Fichero>.php        # cada fichero nuevo o cambiado
php bin/console lint:container
php bin/console debug:container 'App\Service\<Servicio>'   # se registra con autowiring
```

**Tests:** cada método se cubre con los tests unitarios de §8 (`TaskServiceTest`, `RecurrenceCalculatorTest`…), con `MockClock` para fijar la fecha, usando el skill `pruebas`.

## Entrega

1. Tabla de métodos creados o cambiados: regla (RN-xx), excepción que lanza y código HTTP que le corresponderá.
2. Si cambió el análisis, dilo: ha perdido la firma.
3. Siguiente tramo: `api`.
4. Registra el paso con `bitacora` y haz commit con `mensaje-commit` (`feat: … (#<nº>)`).
