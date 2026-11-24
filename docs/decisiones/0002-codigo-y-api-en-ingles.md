# ADR-0002 — Código, base de datos y rutas de la API en inglés

- **Estado:** aceptado (2026-11-24)
- **Fecha:** 2026-11-24

## Contexto

El análisis de referencia escribía el código en castellano (`TodoItem`, `PlantillaTarea`, `EsRepetitiva`, `/api/tareas`) para un curso hispanohablante. El CLAUDE.md de DemoAgentes establece: "Código y comentarios en inglés; documentación y tickets en español".

## Decisión

- Clases, métodos, propiedades, tablas, columnas y rutas de la API, en **inglés**: `Task`, `TaskTemplate`, `Recurrence`, `/api/tasks`, `/api/task-templates`.
- Documentación, issues, PR y bitácora, en **castellano**.
- Textos visibles en la interfaz Angular, en **castellano**.

| Referencia | DemoAgentes |
|---|---|
| `TodoItem` | `Task` |
| `PlantillaTarea` | `TaskTemplate` |
| `TipoRecurrencia` (`Diaria`, `Semanal`, `Mensual`) | `Recurrence` (`daily`, `weekly`, `monthly`) |
| `EsRepetitiva` | `isRecurring()` (derivado) |
| `ProximaFecha` | `nextOccurrenceDate` |
| `/api/tareas/{id}/completar` | `/api/tasks/{id}/complete` |
| `/api/plantillas/{id}/instanciar` | `/api/task-templates/{id}/instantiate` |

## Consecuencias

- Coherencia con el ecosistema Symfony/Angular y con la regla del CLAUDE.md.
- La documentación funcional usa los términos en castellano (tarea, plantilla, periodicidad); el análisis hace de diccionario entre ambos.
