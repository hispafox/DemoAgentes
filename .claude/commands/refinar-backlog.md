---
description: Lanza el agente refinador-backlog: revisa la documentación funcional y propone issues con criterios Dado/Cuando/Entonces y preguntas para el PO.
argument-hint: [versión, bloque, F-xx o #issue]
---

Lanza el subagente `refinador-backlog` con la herramienta `Agent` (`subagent_type: "refinador-backlog"`). No hagas tú su trabajo: el agente tiene sus propias instrucciones en `.claude/agents/refinador-backlog.md`.

Tarea para el agente:

- Alcance: `$ARGUMENTS`. Si está vacío, toda la documentación funcional (versiones 0.1 y 0.2).
- Si el alcance es un issue (`#<nº>`), revisa si está listo para implementarse.
- No crees ni edites issues: devuelve los borradores y las preguntas para el PO.

Cuando el agente termine, enseña su informe tal cual (veredicto, tablas y hallazgos) y añade una línea con el siguiente paso que propones. Si la persona aprueba los borradores después, crear los issues es otro paso que ella tiene que pedir.
