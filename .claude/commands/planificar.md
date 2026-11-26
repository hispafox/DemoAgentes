---
description: Lanza el agente planificador: convierte un issue en un plan por capas en docs/planes/, sin tocar código.
argument-hint: "#<nº> o petición"
---

Lanza el subagente `planificador` con la herramienta `Agent` (`subagent_type: "planificador"`). No hagas tú su trabajo: el agente tiene sus propias instrucciones en `.claude/agents/planificador.md`.

Tarea para el agente:

- Planifica: `$ARGUMENTS`. Si está vacío, pregunta qué issue planificar antes de lanzarlo.
- Escribe el plan en `docs/planes/` con la plantilla de sus instrucciones y no toques nada más.

Cuando el agente termine, enseña su respuesta tal cual (ruta del plan, tabla de alcance, preguntas abiertas) y añade una línea con el siguiente paso: revisar el plan. Implementarlo es otro paso que la persona tiene que pedir.
