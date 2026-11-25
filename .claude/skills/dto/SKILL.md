---
name: dto
description: >-
  Crea y actualiza los DTO de entrada y salida de la API de DemoAgentes (Lista
  de Tareas) en backend/src/Dto, con sus reglas de validación (Symfony
  Validator), siempre a partir de las secciones "API REST" (formato de los DTO)
  y "Validación" de docs/analisis.md. Modo "crear": genera los DTO que el
  análisis define para un issue y todavía no existen. Modo "actualizar": aplica
  un cambio de contrato (campo, tipo, validación) primero en el análisis y
  después en el código. Modo "revisar": compara análisis y DTO sin tocar nada.
  Úsalo siempre que se hable de DTO, payloads, JSON de entrada o salida,
  validación de la API o errores 422, aunque el usuario no nombre el skill.
---

# DTO y validación

Los DTO son el **contrato JSON** de la API: lo que entra (`*Input`) y lo que sale (`*Output`). Su fuente de verdad es `docs/analisis.md`: §4 "Formato de los DTO" (campos y nombres) y §5 "Validación (DTO de entrada)" (reglas). Si el código y el análisis no coinciden, se corrige el código o, si el cambio es intencionado, primero el análisis (skill `analisis-diseno`).

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
| **Lee** | `docs/analisis.md` §4 (endpoints y formato de los DTO) y §5 (validación); reglas RN de `docs/app/lista-de-tareas.md`; entidades y enums de `backend/src/Entity/` |
| **Escribe** | `backend/src/Dto/` |
| **No toca** | Entidades, servicios, controladores ni frontend |
| **Prerrequisito** | El análisis define el DTO y sus campos, y las entidades que mapea ya existen (skill `modelo`). Si falta algo, el skill **se detiene** |
| **Verificación mínima** | `php -l` sin errores y el contenedor compila (`lint:container`) |
| **Entregable** | Los DTO del issue, con una tabla de qué regla (RN-xx) cubre cada restricción de validación |

**Frontera con el modelo:** la validación del DTO es la **primera barrera** y devuelve `422` con la lista de violaciones. La entidad repite la regla (por ejemplo, RN-01 en `Task::setTitle()`) como **segunda barrera**, para que ningún camino deje datos inválidos. Las dos citan la misma regla.

**Frontera con el servicio:** el DTO valida **forma** (obligatorio, longitud, valores permitidos). Lo que necesita la base de datos o el estado (una categoría existente, un nombre único, una tarea ya completada) es del servicio, aunque acabe en `422` o `409`.

---

## 0. Antes de tocar nada

1. **Lee** el CLAUDE.md, las secciones 4 y 5 del análisis y las entidades afectadas.
2. **Issue y rama:** no se implementa nada sin issue (`gh issue view <nº>`); trabaja en `feature/<nº>-descripcion`.
3. **Firmas:** comprueba la sección "Firmas" del CLAUDE.md. Si la regla de bloqueo está activa y el análisis no está firmado, detente. Si está suspendida, sigue y anota lo pendiente.
4. **Estado del repositorio:** `git status --short`. No mezcles cambios ajenos.

---

## Modo crear

1. **Inventario:** lista los DTO que el análisis define para los endpoints del issue y los que ya hay en `src/Dto/`. Crea solo lo que falte.
2. **DTO de entrada** (`<Recurso>Input`), según las convenciones de abajo.
3. **DTO de salida** (`<Recurso>Output` y los compuestos, como `CompleteTaskOutput`), con su método `fromEntity()`.
4. **Verifica** y **entrega**.

## Modo actualizar

1. Si el cambio **no está en el análisis**, es un cambio de contrato: aplícalo primero con `/analisis-diseno actualizar` (el análisis pierde la firma). Si cambia una regla de negocio, lo decide el PO.
2. Cambia el DTO y busca sus usos (`grep -rn "<Dto>" backend/src backend/tests`): servicios, controladores y tests.
3. Avisa si el cambio rompe el frontend (modelos de `frontend/src/app/core/models/`).
4. **Verifica** y **entrega**.

## Modo revisar

Solo lee y compara. Para cada DTO del análisis, compara nombre, campos, tipos, nulabilidad, nombres JSON y restricciones de validación. Devuelve:

| DTO | Campo | Análisis | Código | Qué hacer |
|---|---|---|---|---|

y termina proponiendo `crear` o `actualizar` para cada diferencia, sin aplicarlo.

---

## Convenciones

**Ubicación y nombres:** `src/Dto/<Recurso>Input.php` y `src/Dto/<Recurso>Output.php` (namespace `App\Dto`). Si un recurso acumula muchos DTO, subcarpeta por recurso (`src/Dto/Task/`). Nombres en inglés; propiedades en `camelCase`, que son los nombres JSON tal cual.

**Entrada (`*Input`):**
- `final readonly class` con propiedades públicas promovidas en el constructor y valores por defecto para los campos opcionales, para que `#[MapRequestPayload]` la construya.
- Restricciones con atributos `#[Assert\...]`, cada una con un comentario de la regla: `#[Assert\NotBlank] // RN-01`.
- Los enums se tipan con el enum (`?Recurrence $recurrence = null`): el serializer convierte `"weekly"` en `Recurrence::Weekly` y un valor desconocido acaba en `422`.
- **Nunca** incluye campos que el usuario no puede enviar: ni `id`, ni `completed` (solo cambia con `/complete`, RN-11), ni `createdAt` (RN-02), ni `deletedAt`, ni `nextOccurrenceDate` (la calcula el servicio, RN-18).
- Las referencias a otras entidades van como id (`?int $categoryId = null`); comprobar que existen es del servicio.

**Salida (`*Output`):**
- `final readonly class` con propiedades públicas y un `public static function fromEntity(<Entidad> $entity): self`.
- Solo tipos escalares, arrays u otros DTO: nunca una entidad. Las relaciones salen como id (`templateId`).
- Fechas como `string` en ISO 8601, formateadas en `fromEntity()`: `DATE_ATOM` para fecha y hora (`createdAt`, `deletedAt`) y `Y-m-d` para fechas sin hora (`nextOccurrenceDate`).
- Los enums salen con su valor (`$entity->getRecurrence()?->value`).
- Los compuestos se construyen con otros `*Output` (`CompleteTaskOutput` con `task` y `nextOccurrence`).

**Ejemplo:**

```php
final readonly class TaskInput
{
    public function __construct(
        #[Assert\NotBlank] // RN-01
        #[Assert\Length(max: Task::TITLE_MAX_LENGTH)] // RN-01
        public string $title = '',
        public ?Recurrence $recurrence = null, // RN-03, RN-04
    ) {
    }
}
```

## Verificación

```bash
cd backend
php -l src/Dto/<Fichero>.php        # cada fichero nuevo o cambiado
php bin/console lint:container
```

> Mientras el CLAUDE.md tenga los tests **suspendidos** (Fase 5), este skill no escribe ni ejecuta tests y lo indica en la entrega. Al reactivarlos, la validación de cada DTO se cubre en los tests funcionales del controlador (`422` con la violación en el campo correcto).

## Entrega

1. Tabla de DTO creados o cambiados, con sus campos y la regla (RN-xx) de cada restricción.
2. Si cambió el análisis, dilo: ha perdido la firma.
3. Siguiente tramo: `servicio`.
4. Registra el paso con `bitacora` y haz commit con `mensaje-commit` (`feat: … (#<nº>)`).
