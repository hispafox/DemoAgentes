---
description: Lanza el agente revisor-seguridad: revisión OWASP de la API y el frontend, dependencias y secretos, sin tocar nada.
argument-hint: [backend, frontend o una ruta concreta]
---

Lanza el subagente `revisor-seguridad` con la herramienta `Agent` (`subagent_type: "revisor-seguridad"`). No hagas tú su trabajo: el agente tiene sus propias instrucciones en `.claude/agents/revisor-seguridad.md`.

Tarea para el agente:

- Alcance: `$ARGUMENTS`. Si está vacío, el backend y el frontend completos en el estado actual.
- Solo lectura; las auditorías de dependencias (`composer audit`, `npm audit`) sí están permitidas.

Cuando el agente termine, enseña su informe tal cual (veredicto, tablas y hallazgos) y añade una línea con el siguiente paso que propones.
