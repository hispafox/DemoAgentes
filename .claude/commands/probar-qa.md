---
description: Lanza el agente qa-exploratorio: levanta el backend con una base de datos propia y prueba por HTTP los criterios de aceptación y casos raros.
argument-hint: [#issue o endpoint]
---

Lanza el subagente `qa-exploratorio` con la herramienta `Agent` (`subagent_type: "qa-exploratorio"`). No hagas tú su trabajo: el agente tiene sus propias instrucciones en `.claude/agents/qa-exploratorio.md`.

Tarea para el agente:

- Qué probar: `$ARGUMENTS`. Puede ser un issue (`#8`) o un recurso (`/api/task-templates`).
- Si está vacío, los criterios de aceptación de los issues cerrados del backend y una exploración de todos los endpoints de `docs/analisis.md` §4.
- Con su base de datos propia y su puerto (los de sus instrucciones); al terminar, servidor parado y ficheros temporales borrados.

Cuando el agente termine, enseña su informe tal cual (veredicto, tablas y hallazgos) y añade una línea con el siguiente paso que propones. Si hay fallos, cada uno debería acabar en un issue o en el arreglo del issue en curso.
