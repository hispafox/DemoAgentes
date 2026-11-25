---
description: Lanza el agente guardian-candado: comprueba que un cambio cumple el CLAUDE.md y da un veredicto CUMPLE o NO CUMPLE.
argument-hint: [#PR, rama o rango de commits]
---

Lanza el subagente `guardian-candado` con la herramienta `Agent` (`subagent_type: "guardian-candado"`). No hagas tú su trabajo: el agente tiene sus propias instrucciones en `.claude/agents/guardian-candado.md`.

Tarea para el agente:

- Qué revisar: `$ARGUMENTS`. Puede ser una PR (`#22`), una rama (`feature/10-…`) o un rango (`main..HEAD`).
- Si está vacío, revisa `main..HEAD`; si no hay commits, el último merge de `main`.
- Solo lectura: no corrige nada.

Cuando el agente termine, enseña su informe tal cual (veredicto, tablas y hallazgos) y añade una línea con el siguiente paso que propones. Si el veredicto es NO CUMPLE, no abras ni fusiones la PR hasta corregir los bloqueantes.
