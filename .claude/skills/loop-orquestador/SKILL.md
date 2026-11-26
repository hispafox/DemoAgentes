---
name: loop-orquestador
description: >-
  El loop del orquestador de DemoAgentes: lee el estado de un issue en docs/planes/estado-<nº>.json
  con el motor scripts/orq/loop.js, ejecuta el siguiente paso del flujo de .claude/agents/orquestador.md
  con quien lo hace (planificador, implementadores, verificador, guardián, bitácora, commit, PR, merge),
  lo marca con su prueba y encadena hasta la siguiente parada humana. Se retoma en cualquier momento
  y en un chat nuevo, porque el estado vive en el JSON y no en la conversación. En modo cola recorre
  los issues abiertos uno detrás de otro. Úsalo con "/loop-orquestador 15", "/loop-orquestador cola",
  "sigue con el loop del #15", "¿por dónde va el #15?" o "haz los issues pendientes uno tras otro".
---

# Loop del orquestador

El flujo es el del agente [orquestador](../../agents/orquestador.md): preparar, planificar, CRITERIO, implementar, verificar (máximo 3 vueltas), guardián y cierre. Este skill le añade tres cosas:

- **El estado vive en disco**, en `docs/planes/estado-<nº>.json`, junto al plan. Parar es no seguir; retomar es volver a lanzar el skill, aunque sea en otro chat.
- **El JSON solo lo escribe el motor** `scripts/orq/loop.js`, que sabe el orden de los pasos y **no marca un paso como hecho sin su prueba**: el plan en disco, ficheros cambiados en la capa, el veredicto, el commit con `(#<nº>)`, la PR o el merge en GitHub.
- **Cola secuencial:** al fusionar un issue, se pasa al siguiente abierto.

Trabaja en la conversación principal, nunca como subagente, porque en las paradas humanas tiene que preguntar a la persona.

## Argumentos

- `<nº>`: un issue.
- `cola`: los issues abiertos por orden de número; salta los fusionados, los bloqueados y los aparcados. Admite `--label <label>` (por ejemplo `v0.2`).

## El motor

```bash
node scripts/orq/loop.js crear <nº>                 # crea el estado (también calcula la rama)
node scripts/orq/loop.js estado <nº>                # todos los pasos y su prueba
node scripts/orq/loop.js siguiente <nº>             # qué toca, quién lo hace y qué prueba exige
node scripts/orq/loop.js marcar <nº> <paso> en_marcha
node scripts/orq/loop.js marcar <nº> <paso> hecho [--prueba ..] [--veredicto ..]
node scripts/orq/loop.js marcar <nº> <paso> no_aplica --motivo ".."
node scripts/orq/loop.js marcar <nº> 4_verificar revisar --capas back,front --motivo "<defectos>"
node scripts/orq/loop.js aprobar <nº> <paso> --dijo "<lo que respondió la persona>"
node scripts/orq/loop.js reabrir <nº> <paso> --motivo ".."
node scripts/orq/loop.js diferir <nº> 7_revision_funcional --motivo ".."   # parada humana para más adelante
node scripts/orq/loop.js aparcar <nº> --motivo ".."  |  retomar <nº>
node scripts/orq/loop.js cola [--label <label>]
```

Si el motor se niega a marcar, **no se fuerza**: se hace el paso de verdad. `--sin-prueba "<motivo>"` existe para casos excepcionales y deja el motivo escrito en el JSON, a la vista.

## El ciclo

1. **Lee el estado.** `estado <nº>` (si no existe, `crear <nº>`) y `siguiente <nº>`. Enseña a la persona en una línea por dónde va.
2. **Marca el paso `en_marcha`** (así lo ve la vista en vivo) y **ejecútalo** con quien dice `siguiente`:

   | Paso | Qué haces | Cómo se cierra |
   |---|---|---|
   | `1_preparar` | `gh issue view <nº>`; crea la rama del estado desde `main` actualizado o cámbiate a ella (reglas del paso 1 del orquestador) | `marcar … hecho` |
   | `2_planificar` | Si ya hay `docs/planes/plan-<nº>-*.md`, úsalo; si no, lanza al agente `planificador` | `hecho --prueba <ruta del plan>` |
   | `2a_criterio` | ⏸ Si el plan tiene preguntas abiertas, pregúntaselas a la persona con la recomendación primero | `aprobar --dijo "<sus respuestas>"`, o `no_aplica` si no hay preguntas |
   | `3a_backend` / `3b_frontend` | Lanza al implementador si el plan tiene pasos de su capa; pásale la ruta del plan y las respuestas del CRITERIO (están en el JSON, en `2a_criterio.dijo`). En corrección, pásale solo sus defectos (el `motivo` del paso) | `hecho`, o `no_aplica --motivo` si el plan no tiene pasos de esa capa |
   | `4_verificar` | Lanza al `verificador` con la ruta del plan | `hecho --veredicto APROBADO --prueba "<resumen de tests>"`, o `revisar --capas … --motivo "<defectos>"` |
   | `5_guardian` | Lanza a `guardian-candado` sobre los cambios sin commit | `hecho --veredicto CUMPLE`, o `revisar --capas …` si hay algo bloqueante |
   | `6a_bitacora` | Skill `bitacora` (registrar), con los agentes, las vueltas y los veredictos | `hecho` |
   | `6b_commit` | Skill `mensaje-commit`; `feat: … (#<nº>)`; añade los ficheros uno a uno, **también `docs/planes/estado-<nº>.json`** | `hecho` |
   | `6c_pr` | `git push` y `gh pr create` con la plantilla, `Closes #<nº>` y el resumen de tests | `hecho` |
   | `6d_merge` | Solo con los tests en verde: `gh pr merge --merge --delete-branch`, `main` al día y los scripts de test de las capas tocadas | `hecho --prueba "<tests en main>"` |
   | `7_revision_funcional` | ⏸ Si el issue toca pantallas, deja a la persona los pasos de la revisión funcional | `aprobar --dijo …` cuando la haga, o `no_aplica` si no hay pantallas |

3. **Sigue con el siguiente paso** sin esperar a nadie, salvo en una parada.
4. **Después del merge**, el JSON tiene en `main` los últimos pasos sin commit: súbelo en un commit solo con ese fichero, `chore: estado del loop del #<nº>`, directamente a `main`.

## Paradas: cuándo se para el loop

- **`2a_criterio`** con preguntas abiertas: pregunta y espera.
- **Un implementador "bloqueado"**: explica por qué y las opciones.
- **`BLOQUEADO`** tras 3 vueltas sin APROBADO (el motor lo calcula): informe de bloqueo y no hay commit. Lo desbloquea la persona; después, `reabrir`.
- **`7_revision_funcional`**: no bloquea la cola. El issue queda `FUSIONADO` y se apunta en el resumen. Si la persona lo pide, `diferir` lo deja aplazado con su motivo; se cierra después con `aprobar`.

En cada parada, deja escrito en la respuesta qué se ha hecho y qué se le pide a la persona.

## Modo cola

1. `cola` dice el siguiente issue (`→`).
2. Haz su ciclo completo, como arriba.
3. Al fusionarlo, vuelve a `cola` y sigue con el siguiente.
4. Para cuando la cola esté vacía, en una parada, o si el siguiente necesita algo que no está en tu mano (un permiso, una decisión de negocio): apárcalo con `aparcar --motivo` y sigue con el siguiente.

Al terminar, un resumen: los issues fusionados con su PR, los aparcados o bloqueados con su motivo y las revisiones funcionales pendientes.

## Reglas

- **El JSON solo lo escribe `loop.js`.** Ni a mano ni con otro script.
- **Un paso detrás de otro**, viendo el resultado de cada uno. No se lanzan dos implementadores sobre los mismos ficheros.
- **Sin prueba no hay "hecho".** Simular trabajo es la peor falta.
- **Las respuestas de negocio las da la persona.** `aprobar` siempre lleva lo que dijo, con sus palabras.
- Siguen valiendo las reglas del orquestador y del CLAUDE.md: no hay implementación sin issue, ni PR o merge con los tests en rojo.
