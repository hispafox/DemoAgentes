---
name: analisis-diseno
description: >-
  Crea, actualiza y revisa el análisis técnico de DemoAgentes (Lista de Tareas)
  en docs/analisis.md y los ADR de docs/decisiones/, siempre a partir de la
  documentación funcional firmada (docs/app/lista-de-tareas.md) y del CLAUDE.md.
  Modo "crear": añade al análisis lo que una funcionalidad nueva necesita
  (modelo, endpoints, lógica, pantallas, plan de tests y riesgos), con
  trazabilidad F-xx y RN-xx. Modo "actualizar": aplica un cambio funcional o
  técnico al análisis y propone un ADR si contradice una decisión registrada.
  Modo "revisar": compara documentación funcional, análisis y CLAUDE.md, y avisa
  de huecos y contradicciones sin tocar nada. Úsalo siempre que se hable del
  análisis, del diseño técnico, de endpoints, pantallas, plan de tests, riesgos
  o ADR, o cuando una funcionalidad nueva todavía no esté en docs/analisis.md,
  aunque el usuario no nombre el skill.
---

# Análisis y diseño

El análisis técnico (`docs/analisis.md`) traduce **qué** hace la aplicación (`docs/app/lista-de-tareas.md`) a **cómo** se construye con el stack y las convenciones del CLAUDE.md. Es la fuente de verdad de todos los skills que vienen después (`modelo`, DTO, servicios, API, frontend y pruebas): lo que no está en el análisis, no se implementa.

Elige el modo según el argumento:
- `crear <funcionalidad>` → **Modo crear**
- `actualizar <cambio>` → **Modo actualizar**
- `revisar` o sin argumento → **Modo revisar**

---

## Lugar en la orquestación de skills

Es el primer tramo de la cadena de `docs/skills-orquestacion.md` y `docs/skills-orquestacion-v2.md` (allí se llama `diseño-analisis` o `analisis-diseno`). Aquí se adapta al CLAUDE.md: la documentación funcional y el análisis son documentos separados, y cada uno tiene su firma.

```
doc. funcional firmada ──► analisis-diseno ──► backlog (issues) ──► modelo ──► DTO ──► servicios ──► API ──► frontend ──► pruebas ──► commit
 (docs/app/)                (este skill)
```

| | |
|---|---|
| **Lee** | `CLAUDE.md` (stack, arquitectura, API, nombres), `docs/app/lista-de-tareas.md` (F-xx, RN-xx, casos de uso, fuera de alcance), `docs/analisis.md`, `docs/decisiones/` |
| **Escribe** | `docs/analisis.md` y ADR nuevos en `docs/decisiones/` |
| **No toca** | Código (`backend/`, `frontend/`), la documentación funcional ni los issues. Si hace falta cambiarlos, lo dice y lo propone |
| **Prerrequisito** | La funcionalidad está en la documentación funcional. Si no lo está, o una regla es ambigua, el skill **se detiene** y pregunta al PO: no inventa reglas de negocio |
| **Verificación mínima** | Cada F-xx y RN-xx del alcance tiene su sitio en el análisis; los diagramas Mermaid se validan; no hay contradicciones con el CLAUDE.md ni con los ADR |
| **Entregable** | El análisis actualizado (y los ADR, si los hay), con una tabla de trazabilidad de qué sección cubre cada F-xx y RN-xx |

**Frontera con la documentación funcional:** el PO decide el *qué* (funcionalidades, reglas, alcance); este skill decide el *cómo* (entidades, tipos, endpoints, códigos HTTP, pantallas, tests). Si para diseñar algo hace falta una regla que no existe, es una pregunta para el PO, no una decisión técnica.

**Frontera con `modelo`:** este skill define el modelo en la sección 3 del análisis; `modelo` lo traduce a Doctrine. Si al diseñar el modelo aparece una duda de tipos o de mapeo, se resuelve aquí, en el análisis.

---

## 0. Antes de tocar nada (todos los modos que escriben)

1. **Lee** el CLAUDE.md, la documentación funcional completa, el análisis completo y los ADR.
2. **Firmas (aviso):** mira la sección "Firmas" del CLAUDE.md. El análisis depende de la documentación funcional firmada: si no lo está, avisa en una línea ("⚠️ Sin firmar: …") y sigue. Anota en "Pendientes de firma" lo que quede sin firmar; las firmas nunca bloquean.
3. **Issue:** el análisis es documentación, no implementación, así que no exige rama de issue. Si el cambio pertenece a un issue (por ejemplo, una funcionalidad nueva del backlog), cítalo en el commit: `docs: … (#<nº>)`.
4. **Estado del repositorio:** `git status --short`. No mezcles el análisis con cambios ajenos. Si estás en una rama de feature y el cambio no es de ese issue, propón hacerlo en `main` con un worktree temporal (como en el paso 34 de la bitácora), para no perder de vista los ficheros de la rama.

---

## Modo crear

Añade al análisis lo que necesita una funcionalidad (o un bloque) de la documentación funcional que todavía no está diseñada.

1. **Inventario.** Lista las F-xx, RN-xx y casos de uso del alcance pedido, y busca cuáles ya aparecen en el análisis (`grep -n "F-15\|RN-14" docs/analisis.md`). Diseña solo lo que falte.
2. **Preguntas abiertas.** Para cada regla, comprueba que se puede diseñar sin suponer nada: valores límite, qué pasa al borrar, unicidad, quién asigna cada fecha, estados permitidos. Si algo no está claro, **detente** y pregunta al PO con preguntas cerradas (opciones concretas). Sus respuestas van primero a la documentación funcional (tabla "Preguntas de negocio resueltas" y reglas RN nuevas), no al análisis.
3. **Diseña cada sección afectada**, siguiendo la estructura fija del análisis (ver "Estructura del análisis"):
   - §3 Modelo: entidades, campos con tipo PHP y columna, regla RN de cada campo, métodos de dominio, consultas de repositorio, relaciones con su `onDelete` y el diagrama ER.
   - §4 API: endpoints con método, ruta, entrada, salida y códigos; formato de los DTO.
   - §5 Lógica: métodos de servicio con la regla que aplican y el error que devuelven; validación de los DTO.
   - §6 Frontend: rutas, pantallas y componentes.
   - §8 Plan de tests: qué test cubre cada regla.
   - §10 Riesgos y preguntas abiertas.
4. **Marca la versión** si la funcionalidad no es de la versión actual: `*(versión 0.2)*` en el título de la sección o `*(v0.2)*` en la fila.
5. **ADR:** si el diseño elige entre alternativas con consecuencias (motor, formato, librería, estrategia de borrado…), propón un ADR (ver "ADR").
6. **Verifica** y **entrega**.

---

## Modo actualizar

Para cualquier cambio del análisis: una regla nueva o modificada, un campo, un endpoint, un código de error o una pantalla.

1. **Clasifica el cambio:**
   - **Funcional** (cambia una regla, una funcionalidad o el alcance): lo decide el PO. Si la documentación funcional no lo recoge todavía, **detente** y pregunta. Con la respuesta, actualiza primero la documentación funcional (y su firma), y después el análisis.
   - **Técnico** (cambia el cómo, no el qué): sigue con el paso 2.
2. **Contradicciones.** Si el cambio contradice una decisión registrada en un ADR o en el CLAUDE.md:
   - ADR: propón un ADR nuevo que sustituya al anterior; no edites el antiguo salvo su estado (`sustituido por ADR-000N`).
   - CLAUDE.md: es el candado. Propón el cambio y espera la aprobación del usuario antes de tocarlo.
3. **Aplica el cambio en todas las secciones afectadas.** Un campo nuevo suele tocar §3 (modelo y diagrama), §4 (DTO), §5 (validación), §6 (formulario) y §8 (tests). Busca todas las menciones (`grep -n "<campo>\|RN-xx" docs/analisis.md`) para no dejar nada desfasado.
4. **Firma:** si el análisis estaba firmado y el contenido cambia, pierde la firma: cabecera `Estado: pendiente de nueva firma — firmado por <persona> el <fecha>; cambiado después para <motivo>`. Las erratas que no cambian el contenido no anulan la firma. Si la regla de bloqueo está suspendida, añade la fila en "Pendientes de firma" del CLAUDE.md.
5. **Impacto aguas abajo.** Avisa de lo que queda desfasado: código ya escrito (propón `/modelo revisar` o `/modelo actualizar`), issues cuyos criterios de aceptación cambian y tests afectados.
6. **Verifica** y **entrega**.

---

## Modo revisar

Solo lee y compara; no modifica ningún fichero.

1. **Funcional → análisis:** cada F-xx, RN-xx y caso de uso tiene sitio en el análisis. Lo que falte, con su versión.
2. **Análisis → funcional:** nada del análisis introduce reglas de negocio que no estén en la documentación funcional.
3. **Huecos de diseño:** reglas que se pueden implementar de varias formas porque el análisis no decide (quién calcula un valor, si un campo es obligatorio en un caso concreto, qué código HTTP devuelve un error, qué pasa con los datos relacionados).
4. **Coherencia interna:** las tablas de §3 coinciden con el diagrama ER; cada endpoint de §4 tiene su lógica en §5 si la necesita; cada regla tiene un test en §8.
5. **CLAUDE.md y ADR:** convenciones de API (prefijo, plural, `camelCase`, códigos, problem+json), nombres en inglés y decisiones vigentes.
6. Devuelve una tabla:

   | # | Tipo | Dónde | Hallazgo | Qué hacer |
   |---|---|---|---|---|

   Tipos: `falta`, `sobra`, `hueco`, `contradicción`, `incoherencia`.
7. Termina proponiendo para cada hallazgo el modo (`crear` o `actualizar`) o la pregunta al PO que lo resolvería. No lo apliques sin confirmación.

---

## Estructura del análisis

Mantén las secciones y su orden. Si una funcionalidad nueva no encaja, añade una subsección, no una sección nueva.

| § | Sección | Qué contiene |
|---|---|---|
| 1 | Stack | Versiones y librerías |
| 2 | Arquitectura del backend | Capas y responsabilidades |
| 3 | Modelo de datos | Diagrama ER, enums, una tabla por entidad (campo, tipo PHP, columna, descripción, regla), métodos de dominio y relaciones |
| 4 | API REST | Una tabla de endpoints por recurso, formato de los DTO y formato de errores |
| 5 | Lógica de negocio | Un apartado por método de servicio con reglas y errores; validación de entrada |
| 6 | Frontend Angular | Rutas, pantallas y componentes |
| 7 | Requisitos no funcionales | Seguridad, rendimiento, accesibilidad… |
| 8 | Plan de tests | Una fila por clase de test con las reglas que cubre |
| 9 | Diferencias con el análisis de referencia | Solo si cambia algo respecto a `docs/analisis-diseño.md` |
| 10 | Riesgos y preguntas abiertas | Numerados; los resueltos se tachan o se mueven, no se borran sin dejar rastro |

## Reglas de diseño (del CLAUDE.md)

- **Nombres:** código, tablas, rutas y propiedades JSON en inglés (ADR-0002); el texto del análisis, en castellano. Clases en `PascalCase`, propiedades en `camelCase`, tablas y columnas en `snake_case`.
- **Capas:** `Controller → Service → Repository → Entity`, con `Dto/` para entrada y salida. Las reglas que afectan a una sola entidad van en sus métodos de dominio; las que coordinan varias entidades, el repositorio o el reloj, en el servicio.
- **API:** prefijo `/api`, recursos en plural, acciones con efectos como subrecurso `POST`; JSON en `camelCase`; fechas ISO 8601; códigos `200`, `201` (+ `Location`), `204`, `400` (JSON mal formado), `404`, `409` (el estado no permite la acción), `422` (validación); errores en `application/problem+json`.
- **Tipos portables** entre SQLite (ADR-0003) y PostgreSQL (ADR-0001): nada de tipos propios de un motor.
- **Fechas** con `DateTimeImmutable` y `ClockInterface`: el diseño dice quién asigna cada fecha.
- **Mapeo de Doctrine** con atributos PHP en la entidad.
- **Trazabilidad:** cada campo, método, endpoint y test cita la regla (RN-xx) o la funcionalidad (F-xx) que lo justifica.
- **Claridad antes que sofisticación:** es una demo didáctica. Si dos diseños cumplen la regla, elige el más fácil de leer y dilo.

## Diagramas

- El diagrama ER de §3 se mantiene en Mermaid (`erDiagram`) y refleja exactamente las tablas: si cambia una tabla, cambia el diagrama.
- Valida cada diagrama con un renderizador de Mermaid antes de darlo por bueno y dilo en la entrega.

## ADR

Un ADR por decisión, en `docs/decisiones/NNNN-titulo-en-minusculas.md`, con el siguiente número libre:

```markdown
# ADR-NNNN — Título

- **Estado:** pendiente de firma
- **Fecha:** AAAA-MM-DD

## Contexto

Qué problema hay y qué alternativas se consideraron.

## Decisión

Qué se elige.

## Consecuencias

Qué cambia, qué se gana y qué se pierde.
```

Un ADR se firma como cualquier entregable (estado `aceptado — firmado por <persona> el <fecha>`). Nunca se borra: si deja de valer, se marca `sustituido por ADR-NNNN`.

## Verificación

1. Tabla de trazabilidad: cada F-xx y RN-xx del alcance aparece en al menos una sección del análisis y en una fila del plan de tests.
2. `grep` de los identificadores tocados para comprobar que no quedan menciones desfasadas.
3. Diagramas Mermaid validados.
4. Sin contradicciones con el CLAUDE.md ni con los ADR vigentes.

## Entrega

1. Resume qué secciones cambiaron y la tabla de trazabilidad (F-xx/RN-xx → sección del análisis → test).
2. Si el análisis o la documentación funcional cambiaron de contenido, dilo de forma explícita: han perdido la firma.
3. Indica qué queda desfasado aguas abajo (issues, código, tests) y propón el siguiente paso (`/modelo revisar`, actualizar un issue…).
4. Registra el paso con el skill `bitacora`.
5. Commit con el skill `mensaje-commit` (`docs: … (#<nº>)` si hay issue).
