---
description: Lanza el agente trazador-reglas: matriz RN-xx/F-xx → análisis → issue → código → test, con los huecos de cobertura.
argument-hint: [reglas o funcionalidades, por ejemplo RN-10 RN-12 o F-07..F-12]
---

Lanza el subagente `trazador-reglas` con la herramienta `Agent` (`subagent_type: "trazador-reglas"`). No hagas tú su trabajo: el agente tiene sus propias instrucciones en `.claude/agents/trazador-reglas.md`.

Tarea para el agente:

- Alcance: `$ARGUMENTS`. Si está vacío, todas las reglas RN-xx y funcionalidades F-xx de la documentación funcional.
- Las de versiones futuras se marcan como fuera de la versión.
- Solo lectura.

Cuando el agente termine, enseña su informe tal cual (veredicto, tablas y hallazgos) y añade una línea con el siguiente paso que propones.
