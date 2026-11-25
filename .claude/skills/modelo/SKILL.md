---
name: modelo
description: >-
  Crea y actualiza el modelo de datos de DemoAgentes (Lista de Tareas):
  entidades y enums Doctrine en backend/src/Entity, sus repositorios, las
  migraciones y los tests de dominio, siempre a partir de la sección "Modelo de
  datos" de docs/analisis.md. Modo "crear": genera en el código lo que el
  análisis define y todavía no existe. Modo "actualizar": aplica un cambio del
  modelo (campo, entidad, relación o regla) primero en el análisis y después en
  el código y la migración. Modo "revisar": compara análisis y código y avisa de
  las diferencias sin tocar nada. Úsalo siempre que se hable de entidades,
  campos, tablas, relaciones, enums, migraciones o del modelo de la aplicación,
  aunque el usuario no nombre el skill.
---

# Modelo de datos

El modelo de la aplicación tiene **una sola fuente de verdad**: la sección **"3. Modelo de datos"** de `docs/analisis.md`. El código (`backend/src/Entity/`, `backend/src/Repository/`, `backend/migrations/`) es su traducción a Doctrine. Nunca al revés: si el código y el análisis no coinciden, se corrige el código o, si el cambio es intencionado, primero el análisis.

Elige el modo según el argumento:
- `crear` → **Modo crear**
- `actualizar <cambio>` → **Modo actualizar**
- `revisar` o sin argumento → **Modo revisar**

---

## Lugar en la orquestación de skills

Sigue el modelo de `docs/skills-orquestacion.md` y `docs/skills-orquestacion-v2.md`: cada skill cubre un tramo de capas, lee los artefactos anteriores como fuente de verdad y nunca inventa contratos ni reglas. Ese esquema venía de otros proyectos; aquí se adapta al CLAUDE.md (capas `Controller → Service → Repository → Entity`, mapeo con atributos y no con XML).

```
análisis firmado ──► modelo ──► DTO y validación ──► servicios ──► controladores/API ──► frontend ──► pruebas ──► commit
 (docs/analisis.md)   (este skill)
```

`modelo` reúne en un solo tramo lo que en las referencias eran `modelo` + `base-de-datos` (AppTodoList) o `dominio-backend` + `persistencia-doctrine` (tstcln-reservas): en Doctrine con atributos, la entidad y su mapeo viven en el mismo fichero.

| | |
|---|---|
| **Lee** | `docs/analisis.md` §3 (modelo) y §8 (plan de tests); reglas RN de `docs/app/lista-de-tareas.md`; ADR de `docs/decisiones/` |
| **Escribe** | `backend/src/Entity/` (entidades, enums y excepciones de dominio), `backend/src/Repository/`, `backend/migrations/`, `backend/tests/Unit/Entity/`, `backend/tests/Functional/Repository/` |
| **No toca** | DTO, servicios, controladores ni frontend. Esos tramos van después y dependen de lo que salga de aquí |
| **Prerrequisito** | El análisis define la entidad o el campo. Si no lo define, el skill **se detiene**: no infiere el modelo a partir del código, del issue ni de la conversación |
| **Verificación mínima** | Mapeo válido, migración aplicada en limpio y reglas de dominio cubiertas por tests |
| **Entregable** | Entidades, repositorios y una migración por issue, con un resumen de qué regla RN cubre cada método y cada test |

**Frontera con los servicios:** los métodos de dominio cambian el estado de **una** entidad y protegen sus invariantes (`complete()` lanza una excepción si ya está completada, RN-11). Lo que coordina varias entidades o necesita el repositorio y el reloj (generar la siguiente ocurrencia, RN-05, o impedir borrar una plantilla con tareas, RN-12) es de `TaskService`/`TaskTemplateService`, fuera de este skill. El repositorio sí ofrece aquí las consultas que esos servicios necesitarán (`countByTemplate()`).

---

## 0. Antes de tocar nada (todos los modos que escriben)

1. **Lee** el CLAUDE.md, la sección 3 de `docs/analisis.md`, las reglas RN de `docs/app/lista-de-tareas.md` que cite cada campo y los ADR de `docs/decisiones/`.
2. **Issue:** no se implementa nada sin issue de GitHub. Identifica el issue (`gh issue view <nº>`) y trabaja en su rama `feature/<nº>-descripcion`. Si no hay issue para el cambio, detente y propón crearlo.
3. **Firmas (aviso):** mira la sección "Firmas" del CLAUDE.md. Si el análisis o el backlog no están firmados, avisa en una línea ("⚠️ Sin firmar: …") y sigue; las firmas nunca bloquean.
4. **Estado del repositorio:** `git status --short`. No mezcles el modelo con cambios ajenos.

---

## Modo crear

Genera en el código las piezas del modelo que el análisis define y todavía no existen. Si el issue solo cubre una parte (por ejemplo, `Task` sin papelera en el #5), crea solo esa parte y dilo.

1. **Inventario.** Lista lo que define el análisis (enums, entidades, campos, relaciones, métodos de dominio, métodos de repositorio) y lo que ya hay en `src/Entity/` y `src/Repository/`. Crea solo lo que falte.
2. **Enums** en `src/Entity/<Nombre>.php`: `enum X: string`, casos en `PascalCase` y valores en minúsculas, tal como los fija el análisis.
3. **Entidades** en `src/Entity/<Nombre>.php`, siguiendo las convenciones de abajo y la tabla de tipos.
4. **Repositorios** en `src/Repository/<Nombre>Repository.php`, que extienden `ServiceEntityRepository`, con los métodos de consulta que cite el análisis (`findActive()`, `findDeleted()`, `countByTemplate()`…).
5. **Migración** (ver "Migraciones").
6. **Tests de dominio** (ver "Tests").
7. **Verifica** (ver "Verificación") y **entrega** (ver "Entrega").

---

## Modo actualizar

Para cualquier cambio del modelo: un campo nuevo, un tipo distinto, una relación, una regla en un método de dominio o una entidad nueva.

1. **Clasifica el cambio:**
   - **Ya está en el análisis** (el código va por detrás): ve directamente al paso 4.
   - **No está en el análisis:** es un cambio de diseño. Sigue con el paso 2.
2. **Impacto funcional.** Si el cambio altera una regla de negocio o una funcionalidad de `docs/app/lista-de-tareas.md`, eso lo decide el PO: detente y pregunta antes de seguir.
3. **Actualiza primero el análisis** (sección 3 y, si aplica, las secciones 4, 5, 8 y 9). Si el cambio contradice una decisión registrada, propón un ADR nuevo en `docs/decisiones/` en lugar de editar el antiguo. Un análisis firmado que cambia **pierde la firma**: pon su cabecera en `Estado: pendiente de nueva firma` y avisa al usuario. Si la regla de bloqueo está activa, espera la nueva firma antes de tocar el código.
4. **Aplica el cambio en el código:** entidad, enum, repositorio y DTO afectados. Busca todos los usos (`grep -rn "<campo>" backend/src backend/tests`) para no dejar nada roto.
5. **Migración nueva** (ver "Migraciones"). Nunca edites una migración que ya esté en `main`.
6. **Tests:** ajusta los existentes y añade uno por cada regla nueva o modificada.
7. **Verifica** y **entrega**.

---

## Modo revisar

Solo lee y compara; no modifica ningún fichero.

1. Para cada entidad y enum del análisis, compara con el código: nombre de clase y de tabla, campos, tipos PHP, tipo y nulabilidad de cada columna, longitudes, valores por defecto, relaciones y su `onDelete`, métodos de dominio y métodos de repositorio.
2. Ejecuta, si el backend está instalado:

   ```bash
   cd backend
   php bin/console doctrine:schema:validate
   php bin/console doctrine:migrations:status
   php bin/console doctrine:migrations:diff --dry-run   # en versiones que lo admitan; si no, omítelo
   ```

3. Devuelve una tabla con las diferencias:

   | Elemento | Análisis | Código | Qué hacer |
   |---|---|---|---|

   Además, indica qué partes del análisis aún no tienen código y a qué issue pertenecen.
4. Termina proponiendo el modo (`crear` o `actualizar`) que resolvería cada diferencia. No lo apliques sin confirmación.

---

## Convenciones de las entidades

- Código, clases, propiedades, tablas y columnas en **inglés** (ADR-0002). Clases en `PascalCase`, propiedades en `camelCase`, tablas y columnas en `snake_case` (la estrategia `underscore` de Doctrine las convierte sola).
- Mapeo con **atributos PHP** (`#[ORM\Entity]`, `#[ORM\Column]`…) y `#[ORM\Table(name: '…')]` con el nombre de tabla del análisis.
- Propiedades `private` y tipadas. El `id` es `?int` con `#[ORM\Id, ORM\GeneratedValue, ORM\Column]`.
- **Constructor** con los datos obligatorios; los valores que asigna el sistema (como `createdAt`) se pasan como argumento (`DateTimeImmutable $now`), sin llamar a `new DateTimeImmutable()` dentro de la entidad, para que los tests puedan fijar la fecha.
- **Sin setters para el estado.** El estado cambia con métodos de dominio con nombre de negocio (`complete()`, `moveToTrash()`, `restore()`), que lanzan una excepción de dominio cuando la regla no lo permite. Solo hay setters para lo que el usuario puede editar libremente (`title`, `recurrence`).
- Métodos derivados (`isRecurring()`, `isDeleted()`) en lugar de columnas redundantes.
- Las entidades **no** se serializan en la API: para eso están los DTO de `src/Dto/`.
- Cada método de dominio lleva en su docblock la regla que implementa: `/** RN-11: a completed task cannot be completed again. */`.

## Tabla de tipos (análisis → Doctrine)

Usa solo tipos portables entre SQLite (versión 0.1, ADR-0003) y PostgreSQL (ADR-0001).

| En el análisis | Tipo PHP | Atributo Doctrine |
|---|---|---|
| `varchar(N)` not null | `string` | `#[ORM\Column(length: N)]` |
| `boolean` default false | `bool` | `#[ORM\Column(options: ['default' => false])]` y valor inicial `false` en la propiedad |
| `timestamp` not null | `DateTimeImmutable` | `#[ORM\Column(type: Types::DATETIME_IMMUTABLE)]` |
| `timestamp` null | `?DateTimeImmutable` | `#[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]` |
| `date` null | `?DateTimeImmutable` | `#[ORM\Column(type: Types::DATE_IMMUTABLE, nullable: true)]` |
| enum en `varchar(10)` null | `?Recurrence` | `#[ORM\Column(length: 10, nullable: true, enumType: Recurrence::class)]` |
| FK nullable `ON DELETE RESTRICT` | `?TaskTemplate` | `#[ORM\ManyToOne]` + `#[ORM\JoinColumn(nullable: true, onDelete: 'RESTRICT')]` |

No uses tipos propios de un motor (`json` nativo de PostgreSQL, `ENUM` de MySQL, arrays) ni `columnDefinition`.

**Claves foráneas en SQLite:** SQLite solo aplica las FK si están activadas en la conexión. Las reglas como RN-12 se garantizan **primero en el servicio** (por ejemplo, `countByTemplate()` antes de borrar); la FK es la segunda barrera. Si un test necesita comprobar la FK en SQLite, activa las claves foráneas en la conexión de test y documéntalo en la bitácora.

## Migraciones

```bash
cd backend
php bin/console make:migration            # o doctrine:migrations:diff
php bin/console doctrine:migrations:migrate --no-interaction
```

1. Genera la migración **después** de terminar las entidades, no a mitad.
2. **Léela entera** antes de darla por buena: solo debe contener los cambios del modelo de este issue. Si aparecen tablas o columnas inesperadas, para y averigua por qué.
3. Rellena `getDescription()` en inglés con el cambio y el issue: `'Create task table (#5)'`.
4. Una migración por issue. Nunca modifiques una que ya esté en `main`: crea otra.
5. Comprueba que se aplica en limpio: borra `var/data.db`, ejecuta `migrate` y después `doctrine:schema:validate`.
6. Las migraciones se generan contra SQLite. Al adoptar PostgreSQL (ADR-0001) habrá que regenerarlas; no metas SQL específico de SQLite a mano.

## Tests

- Un test unitario por entidad con reglas: `tests/Unit/Entity/<Entidad>Test.php`, con un método `test<Comportamiento>` por caso y la regla en el nombre o en un comentario (`testCompleteTwiceThrows` → RN-11).
- Cubre cada método de dominio: el camino feliz y la excepción de cada regla.
- Los métodos de repositorio con consultas propias se prueban en `tests/Functional/Repository/`.
- Si PHPUnit todavía no está instalado (issue #2), dilo en la entrega y no abras la PR: el CLAUDE.md prohíbe abrir PR con tests sin pasar.

## Verificación

Desde la raíz del repositorio:

```powershell
.\scripts\backend-test.ps1
```

Comprueba el contenedor, el mapeo de Doctrine y PHPUnit. Además:

```bash
cd backend
php bin/console doctrine:schema:validate          # mapeo correcto y base de datos sincronizada
php bin/console doctrine:migrations:status        # sin migraciones pendientes
```

No des el modelo por terminado si alguna de estas comprobaciones falla.

## Entrega

1. Resume qué entidades, campos, relaciones y migraciones se crearon o cambiaron, y qué reglas (RN) cubre cada test.
2. Si cambió el análisis, dilo de forma explícita: ha perdido la firma.
3. Registra el paso con el skill `bitacora`.
4. Commit con el skill `mensaje-commit` (`feat: … (#<nº>)`), y PR con `Closes #<nº>` solo si los tests están en verde. El agente la fusiona en cuanto los tests están en verde (regla de merge del CLAUDE.md).
