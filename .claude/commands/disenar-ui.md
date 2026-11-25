---
description: Lanza el agente disenador-ui: especificación visual y de UX de las pantallas Angular antes de programarlas.
argument-hint: [#issue o pantalla, por ejemplo #10 o /templates]
---

Lanza el subagente `disenador-ui` con la herramienta `Agent` (`subagent_type: "disenador-ui"`). No hagas tú su trabajo: el agente tiene sus propias instrucciones en `.claude/agents/disenador-ui.md`.

Tarea para el agente:

- Pantallas: `$ARGUMENTS`. Puede ser un issue de pantallas (`#10`, `#11`, `#12`) o una ruta (`/templates`).
- Si está vacío, todas las pantallas de `docs/analisis.md` §6 de la versión actual.
- Guarda la especificación en `docs/diseno/<tema>.md`. No toques `frontend/` ni `backend/`.

Cuando el agente termine, enseña su informe tal cual (veredicto, tablas y hallazgos) y añade una línea con el siguiente paso que propones. La especificación la aplica después el skill `frontend` al implementar el issue.
