---
description: Lanza el agente presentador: guion de la demo con diapositivas y notas del orador a partir de la bitácora, los issues y las PR.
argument-hint: [rango o tema, por ejemplo "hoy", "desde el paso 44" o "clase de agentes"]
---

Lanza el subagente `presentador` con la herramienta `Agent` (`subagent_type: "presentador"`). No hagas tú su trabajo: el agente tiene sus propias instrucciones en `.claude/agents/presentador.md`.

Tarea para el agente:

- Qué contar: `$ARGUMENTS`. Si está vacío, el avance completo del proyecto según la bitácora.
- Guarda el guion en `docs/presentaciones/<AAAA-MM-DD>-<tema>.md`. Solo genera `.pptx` si se pide expresamente y las dependencias están instaladas.

Cuando el agente termine, enseña su informe tal cual (veredicto, tablas y hallazgos) y añade una línea con el siguiente paso que propones.
