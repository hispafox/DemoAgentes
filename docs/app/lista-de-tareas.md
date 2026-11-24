# Lista de Tareas — Documentación funcional

> Fase 1 (DOC). Describe **qué** hace la aplicación, sin hablar de tecnología. El **cómo** está en `docs/analisis.md`.
>
> Origen: parte funcional de `docs/analisis-diseño.md` (AppTodoList), que se conserva como referencia.
>
> Estado: **pendiente de nueva firma** — firmado por hispafox (PO) el 2026-11-24 (CRITERIO de la Fase 1); cambiado después para añadir las categorías de tareas (versión 0.2, Bloque C).

## 1. Objetivo

Aplicación web para gestionar tareas personales. Permite crear, consultar, modificar, completar y eliminar tareas. Además ofrece **plantillas** reutilizables y **tareas repetitivas**: al completar una de ellas se genera automáticamente la siguiente.

Es una demo didáctica, así que se prioriza que el código sea claro antes que sofisticado.

## 2. Actores

| Actor | Descripción |
|---|---|
| Usuario | Persona que gestiona sus tareas. Hay un único usuario y no inicia sesión (ver "Fuera de alcance"). |

## 3. Conceptos

| Concepto | Descripción |
|---|---|
| **Tarea** | Algo que hay que hacer. Tiene título, estado (pendiente o completada) y fecha de creación. |
| **Tarea repetitiva** | Tarea con una periodicidad (diaria, semanal o mensual). Al completarla se crea la siguiente ocurrencia. |
| **Plantilla** | Modelo con valores por defecto (título, si es repetitiva y su periodicidad) para crear tareas rápidamente. |
| **Periodicidad** | Cada cuánto se repite una tarea: diaria, semanal o mensual. |
| **Categoría** *(v0.2)* | Agrupación que el usuario define (por ejemplo, Casa, Trabajo, Compras). Una tarea puede tener una categoría o ninguna. |

## 4. Funcionalidades

### Bloque A — Tareas

| Id | Funcionalidad |
|---|---|
| F-01 | Listar todas las tareas. |
| F-02 | Consultar el detalle de una tarea. |
| F-03 | Crear una tarea, indicando título y, opcionalmente, que es repetitiva y su periodicidad. |
| F-04 | Modificar el título o la periodicidad de una tarea. |
| F-05 | Eliminar una tarea (va a la papelera). |
| F-06 | Completar una tarea. Si es repetitiva, se crea automáticamente la siguiente ocurrencia. |
| F-13 | Ver la papelera: las tareas eliminadas. |
| F-14 | Restaurar una tarea de la papelera. |

### Bloque B — Plantillas

| Id | Funcionalidad |
|---|---|
| F-07 | Listar todas las plantillas. |
| F-08 | Consultar el detalle de una plantilla. |
| F-09 | Crear una plantilla con título, si es repetitiva y periodicidad. |
| F-10 | Modificar una plantilla. |
| F-11 | Eliminar una plantilla, si no tiene tareas asociadas. |
| F-12 | Crear una tarea nueva a partir de una plantilla ("instanciar"). |

### Bloque C — Categorías (versión 0.2)

| Id | Funcionalidad |
|---|---|
| F-15 | Listar todas las categorías. |
| F-16 | Crear una categoría con su nombre. |
| F-17 | Renombrar una categoría. |
| F-18 | Eliminar una categoría, si no tiene tareas asociadas. |
| F-19 | Asignar una categoría a una tarea, cambiarla o quitarla (al crear o modificar la tarea). |

## 5. Casos de uso principales

### CU-01 — Completar una tarea repetitiva

1. El usuario marca como completada una tarea repetitiva.
2. El sistema la marca como completada.
3. El sistema crea una tarea nueva con el mismo título y la misma periodicidad, pendiente y con la fecha de la siguiente ocurrencia calculada desde el día en que se completa (hoy + periodicidad).
4. El usuario ve la tarea completada y la nueva tarea pendiente en la lista.

### CU-02 — Crear una tarea desde una plantilla

1. El usuario elige una plantilla y pide crear una tarea a partir de ella.
2. El sistema crea una tarea pendiente con el título, el carácter repetitivo y la periodicidad de la plantilla, y la vincula a la plantilla de origen.
3. El usuario ve la nueva tarea en la lista y puede modificarla como cualquier otra.

### CU-03 — Eliminar y restaurar una tarea

1. El usuario elimina una tarea.
2. El sistema la mueve a la papelera: deja de aparecer en la lista de tareas.
3. El usuario abre la papelera y ve la tarea eliminada.
4. El usuario la restaura y vuelve a aparecer en la lista, con el mismo estado que tenía.

## 6. Reglas de negocio

| Id | Regla |
|---|---|
| RN-01 | El título de una tarea es obligatorio. |
| RN-02 | Una tarea nueva se crea siempre pendiente; la fecha de creación la asigna el sistema. |
| RN-03 | Una tarea repetitiva debe tener periodicidad; una tarea no repetitiva no la tiene. |
| RN-04 | Solo hay tres periodicidades: diaria, semanal y mensual. |
| RN-05 | Al completar una tarea repetitiva se genera exactamente una nueva ocurrencia. Su fecha se calcula desde el día en que se completa: hoy + 1 día, 1 semana o 1 mes. |
| RN-06 | Al completar una tarea no repetitiva no se genera nada más. |
| RN-07 | El título de una plantilla es obligatorio, y RN-03 se aplica también a las plantillas. |
| RN-08 | Las tareas creadas a mano no tienen plantilla; las creadas desde una plantilla quedan vinculadas a ella. |
| RN-09 | Modificar una plantilla no cambia las tareas ya creadas a partir de ella. |
| RN-10 | Eliminar una tarea la mueve a la papelera; no se borra definitivamente. Las tareas de la papelera no aparecen en la lista y se pueden restaurar. |
| RN-11 | Una tarea completada no puede volver a pendiente. Completar una tarea ya completada no está permitido. |
| RN-12 | No se puede eliminar una plantilla que tenga tareas asociadas, incluidas las que están en la papelera. |
| RN-13 | Una tarea en la papelera no se puede modificar ni completar hasta que se restaure. |
| RN-14 | *(v0.2)* El nombre de una categoría es obligatorio. |
| RN-15 | *(v0.2)* Una tarea tiene como mucho una categoría; puede no tener ninguna. |
| RN-16 | *(v0.2)* No se puede eliminar una categoría que tenga tareas asociadas, incluidas las que están en la papelera. |
| RN-17 | *(v0.2)* No puede haber dos categorías con el mismo nombre. Se comparan sin distinguir mayúsculas ni espacios al principio o al final: "Casa" y " casa " son el mismo nombre. |

## 7. Fuera de alcance

- Usuarios, inicio de sesión y permisos.
- Paginación, filtros y búsqueda.
- Generación automática de ocurrencias sin intervención del usuario (por ejemplo, a medianoche).
- Periodicidades personalizadas (cada N días, ciertos días de la semana).
- Vaciar la papelera o borrar tareas definitivamente.
- Papelera de plantillas: las plantillas se borran definitivamente (si se permite, RN-12).
- Categorías en las plantillas: una plantilla no tiene categoría y la tarea instanciada nace sin ella (v0.2).
- Varias categorías por tarea (etiquetas).

## 8. Preguntas de negocio resueltas (2026-11-24)

| # | Pregunta | Respuesta del PO | Reglas |
|---|---|---|---|
| 1 | ¿Qué pasa con las tareas de una plantilla si se elimina la plantilla? | Se impide eliminar una plantilla con tareas asociadas. | RN-12 |
| 2 | ¿Desde qué fecha se calcula la siguiente ocurrencia? | Desde el día en que se completa. | RN-05 |
| 3 | Si una tarea repetitiva se reabre y se completa otra vez, ¿se genera otra ocurrencia? | Una tarea completada no se puede reabrir. | RN-11 |
| 4 | ¿Hace falta papelera o borrado lógico? | Sí, borrado lógico con papelera y restauración. | RN-10, RN-13, F-13, F-14 |

El PO también confirmó las reglas deducidas de estas respuestas: RN-13, que las tareas de la papelera cuentan para RN-12, y los nuevos puntos de "Fuera de alcance".

### Categorías (2026-11-24)

| # | Pregunta | Respuesta del PO | Reglas |
|---|---|---|---|
| 5 | ¿Qué es una categoría? | Una entidad que el usuario gestiona (crear, renombrar, eliminar). | F-15 a F-18 |
| 6 | ¿Cuántas categorías por tarea? | Cero o una. | RN-15, F-19 |
| 7 | ¿Qué pasa al eliminar una categoría con tareas? | Se impide. | RN-16 |
| 8 | ¿En qué versión y a qué afecta? | Versión 0.2 y solo a las tareas; las plantillas no llevan categoría. | Fuera de alcance |
| 9 | ¿Los nombres de categoría deben ser únicos? | Sí. | RN-17 |

Que la comparación ignore mayúsculas y espacios al principio o al final lo propuso el analista al aplicar la respuesta 9; el PO puede cambiarlo.
