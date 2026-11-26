# Agentes del lab — copia de referencia (plan B)

Copia de los cinco agentes del [lab del equipo de agentes](../lab-agentes-orquestador.md) y del comando `/orquestar`, ya revisados con los ensayos del 2026-11-26. Son los mismos bloques que la [solución de referencia](../lab-agentes-orquestador-solucion.md), en ficheros listos para copiar.

Aquí **no están activos**: Claude Code solo carga los agentes de `.claude/agents/` y los comandos de `.claude/commands/`. En clase se crean a mano; si no da tiempo, se copian:

```powershell
Copy-Item docs\formacion\agentes-referencia\agents\*.md .claude\agents\
```

```powershell
Copy-Item docs\formacion\agentes-referencia\commands\*.md .claude\commands\
```

Los agentes nuevos pueden tardar varios minutos en aparecer en una sesión abierta (unos 7 en los ensayos); el comando aparece al momento. Si hay prisa, abre una sesión nueva.

| Fichero | Papel |
|---|---|
| `agents/orquestador.md` | Coordina el flujo; no edita |
| `agents/planificador.md` | Escribe el plan en `docs/planes/` |
| `agents/implementador-backend.md` | Implementa en `backend/` con los skills de capa |
| `agents/implementador-frontend.md` | Implementa en `frontend/` con el skill `frontend` |
| `agents/verificador.md` | Ejecuta los tests y da APROBADO o REVISAR; no corrige |
| `commands/orquestar.md` | `/orquestar #<nº>`: la sesión principal actúa como orquestador |

Resultados de los ensayos: ramas `ensayo/lab-orquestador` y `ensayo/10-pantallas-tareas` en GitHub (no se fusionan) y bitácora, pasos 61 y siguientes.
