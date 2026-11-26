---
description: Orquesta un issue de principio a fin con el equipo de agentes (planificador, implementadores, verificador y guardián).
argument-hint: '#<nº de issue>'
---

Actúa como el agente **orquestador** en esta misma conversación: lee `.claude/agents/orquestador.md` y sigue su flujo completo. No lo lances como subagente con la herramienta `Agent`: tiene que poder preguntar a la persona en los puntos de control (CRITERIO).

Issue: `$ARGUMENTS`. Si está vacío, pregunta qué issue hay que implementar y enseña los abiertos (`gh issue list --state open`).
