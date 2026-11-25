---
name: nueva-feature
description: >-
  Orquesta una funcionalidad o un cambio de DemoAgentes (Lista de Tareas) de
  principio a fin: detecta el alcance de una petición en lenguaje natural o de un
  issue de GitHub, decide qué capas toca y encadena los skills que correspondan
  (analisis-diseno, modelo, dto, servicio, api, frontend, pruebas, bitacora y
  mensaje-commit) hasta la PR fusionada. No implementa nada por su cuenta:
  coordina a los demás skills y para en cada punto de control. Úsalo cuando el
  usuario pida "una funcionalidad nueva", "implementa el issue #N", "añade…",
  "quiero que la app…", "haz el issue entero" o cualquier cambio que cruce más
  de una capa, aunque no nombre el skill.
---

# Nueva funcionalidad (orquestador de skills)

Este skill es el director de orquesta. Recibe una petición ("quiero poder ordenar las tareas por fecha", "implementa el issue #10"), averigua qué capas toca y llama, en orden, a los skills de esas capas. Cada skill sabe **cómo** se hace su parte; este decide **qué** skills hacen falta, **en qué orden** y **cuándo parar**.

Es también el que usará el agente orquestador que se cree más adelante: el agente decide cuándo actuar, y este skill le da el procedimiento.

Uso:
- `/nueva-feature #<nº>`: parte de un issue de GitHub.
- `/nueva-feature <petición en lenguaje natural>`: parte de una idea; primero se convierte en issue.
- `/nueva-feature plan <petición o #nº>`: solo detecta el alcance y presenta el plan, sin tocar nada.

---

## Lugar en la orquestación de skills

```
                        ┌──────────────── nueva-feature (este skill) ────────────────┐
petición o issue ──►    analisis-diseno ─► modelo ─► dto ─► servicio ─► api ─► frontend ─► pruebas ─► bitacora ─► mensaje-commit ─► PR
                        └────────────── solo los tramos que toque la petición ───────┘
```

| | |
|---|---|
| **Lee** | La petición o el issue (`gh issue view <nº>`), `CLAUDE.md`, `docs/app/lista-de-tareas.md`, `docs/analisis.md` y `docs/decisiones/` |
| **Escribe** | Nada directamente: cada fichero lo escribe el skill de su capa. Solo crea la rama, el issue (si falta) y la PR |
| **No toca** | Código ni documentos fuera de lo que hacen los skills que llama |
| **Prerrequisito** | Una petición que se pueda entender. Si es ambigua o cambia reglas de negocio, se detiene y pregunta al PO |
| **Verificación mínima** | Cada tramo entrega su verificación; al final, `backend-test.ps1` y, si toca el frontend, `frontend-test.ps1`, en verde |
| **Entregable** | La PR fusionada con `Closes #<nº>` y un resumen: alcance, skills ejecutados, ficheros, tests y lo que queda pendiente |

**Regla de oro:** este skill no escribe código "para ir más rápido". Si una capa necesita cambios, se carga su skill (herramienta `Skill`) y se siguen sus instrucciones. Así cada capa conserva sus convenciones y su verificación.

---

## 1. Entender la petición

1. **Origen:**
   - Si es un issue: `gh issue view <nº>`. Lee la historia, las funcionalidades y reglas (F-xx, RN-xx) que cita y los criterios de aceptación.
   - Si es lenguaje natural: reformúlala en una frase ("Como usuario quiero… para…") y busca si ya hay un issue (`gh issue list --search "<palabras>"`).
2. **Clasifica** la petición:

   | Tipo | Ejemplo | Qué implica |
   |---|---|---|
   | Funcional nueva | "Quiero etiquetas en las tareas" | Regla o funcionalidad que no está en la documentación funcional: la decide el PO |
   | Funcional existente | "Implementa el issue #10" | Ya está en la documentación y el análisis: se implementa |
   | Técnica | "Pasa la fecha a otro formato en la API" | Cambia el cómo, no el qué: análisis (y ADR si hay alternativas) |
   | Corrección | "Al restaurar sale un 500" | Bug: test que lo reproduce, arreglo en la capa culpable |
   | Solo documentación | "Corrige el README" | Sin cadena de skills: se edita y se registra |

3. **Fuera de alcance:** comprueba la sección "Fuera de alcance" del CLAUDE.md y de la documentación funcional (usuarios, paginación, filtros…). Si la petición cae ahí, **detente** y dilo.
4. **Ambigüedad:** si para implementarlo hay que suponer una regla de negocio, **detente** y pregunta al PO con preguntas cerradas (opciones concretas). Su respuesta va primero a la documentación funcional, con el skill `analisis-diseno`.

## 2. Detectar el alcance (qué capas toca)

Recorre esta tabla y marca cada capa. La fuente es el análisis: si el análisis no lo recoge, la primera capa es siempre `analisis-diseno`.

| Capa | Skill | Se activa si la petición… | Señales |
|---|---|---|---|
| Análisis | `analisis-diseno` | introduce o cambia una regla, un campo, un endpoint o una pantalla que no está en `docs/analisis.md` | `grep -n "<campo>\|RN-xx\|/api/<ruta>" docs/analisis.md` no lo encuentra |
| Modelo | `modelo` | necesita una entidad, un campo, una relación, una consulta de repositorio o un método de dominio | §3 del análisis frente a `backend/src/Entity/` y `Repository/` |
| DTO | `dto` | cambia lo que entra o sale de la API, o su validación | §4 "Formato de los DTO" frente a `backend/src/Dto/` |
| Servicio | `servicio` | añade o cambia lógica de negocio, coordinación entre entidades o uso del reloj | §5 frente a `backend/src/Service/` |
| API | `api` | añade o cambia un endpoint, un código HTTP o un error | §4 frente a `php bin/console debug:router` |
| Frontend | `frontend` | toca una pantalla, un servicio HTTP o un modelo de Angular | §6 frente a `frontend/src/app/`; también si cambió un DTO de salida que usa el frontend |
| Pruebas | `pruebas` | siempre que haya código: cada criterio de aceptación necesita al menos un test | §8 del análisis y criterios del issue |

Reglas de propagación (si cambia una capa, revisa las de abajo):
- Campo nuevo en una entidad → casi siempre DTO de salida → modelo de Angular.
- Endpoint nuevo → servicio que lo respalda → método en el servicio HTTP de Angular.
- Cambio de un DTO de salida → modelo y pantallas de Angular que lo usan.
- Regla de negocio nueva → método de dominio o de servicio → código de error en la API (`409`/`422`) → mensaje en el frontend.

## 3. Presentar el plan (punto de control)

Antes de tocar nada, muestra el plan en una tabla y espera el visto bueno si la petición era de tipo funcional nueva o técnica; si es un issue ya refinado, el plan se muestra y se sigue:

| # | Skill | Modo | Qué hará | Ficheros previstos | Criterio o regla |
|---|---|---|---|---|---|
| 1 | `analisis-diseno` | actualizar | Añadir el campo `priority` a §3, §4, §6 y §8 | `docs/analisis.md` | RN-xx |
| 2 | `modelo` | actualizar | Campo y migración | `Task.php`, migración | RN-xx |
| … | | | | | |

Con `/nueva-feature plan …` el skill termina aquí.

## 4. Preparar el terreno

1. **Firmas (aviso):** mira la sección "Firmas" del CLAUDE.md. Si falta una firma de la que depende el trabajo, avisa en una línea ("⚠️ Sin firmar: …") y sigue; las firmas nunca bloquean. Anota en "Pendientes de firma" lo que quede sin firmar.
2. **Issue:** no se implementa nada sin issue. Si no existe, créalo (`gh issue create`) con la historia, las F-xx/RN-xx, los criterios de aceptación Dado/Cuando/Entonces, sus etiquetas (`backend`, `frontend`, `test`…) y su milestone, y enlaza la sección del análisis.
3. **Rama:** desde `main` actualizado (`git checkout main && git pull`), crea `feature/<nº>-descripcion-corta`. Comprueba con `git status --short` que no arrastras cambios ajenos.

## 5. Ejecutar la cadena

Para cada fila del plan, en orden:

1. **Carga el skill** con la herramienta `Skill` (por ejemplo, `Skill(modelo, "actualizar campo priority en Task")`) y sigue sus instrucciones completas, incluido su paso 0 y su verificación.
2. **Comprueba su entregable** antes de pasar al siguiente: si la verificación del skill falla, se arregla en esa misma capa. No se avanza con una capa en rojo.
3. **Si un skill se detiene** (falta un prerrequisito, una regla ambigua, una contradicción con un ADR), el orquestador también se detiene: explica qué falta y qué propone.
4. **Anota** en una lista lo que hizo cada skill (ficheros y decisiones), para el resumen final y la bitácora.

Orden fijo cuando hay varias capas: `analisis-diseno` → `modelo` → `dto` → `servicio` → `api` → `frontend` → `pruebas`. Los tests de cada capa pueden escribirse junto a ella, pero el tramo `pruebas` siempre se ejecuta al final para cruzar los criterios de aceptación con los tests.

## 6. Verificar el conjunto

```powershell
.\scripts\backend-test.ps1     # contenedor, Doctrine, PHP-CS-Fixer, PHPStan y PHPUnit
.\scripts\frontend-test.ps1    # Vitest y build (si se tocó el frontend)
```

- Si hay migraciones nuevas: aplícalas en limpio y revisa `doctrine:schema:validate`.
- Si hay endpoints o pantallas nuevos: prueba manual con `backend-start.ps1` y `frontend-start.ps1`, siguiendo los criterios de aceptación.
- **Criterios de aceptación:** tabla criterio → test que lo cubre. Si alguno no tiene test, vuelve al tramo `pruebas`.

Bucle de corrección: si algo falla, vuelve a la capa culpable con su skill. Tras **3 intentos** sin verde, detente y pide ayuda con el error exacto; nunca se abre una PR en rojo.

## 7. Cerrar

1. **Bitácora:** skill `bitacora` (registrar), con el alcance, los skills ejecutados, las decisiones y los ficheros. Si `main` avanzó mientras trabajabas, fusiona `main` en la rama antes de añadir el paso.
2. **Commit:** skill `mensaje-commit` (`feat: … (#<nº>)`, `fix: … (#<nº>)`).
3. **PR:** `git push -u origin <rama>` y `gh pr create` con la plantilla del repositorio: `Closes #<nº>`, qué incluye y resumen de tests.
4. **Merge:** con los tests en verde, el agente fusiona la PR (`gh pr merge --merge --delete-branch`), vuelve a `main`, lo actualiza y repite los tests (regla de merge del CLAUDE.md). Nunca con tests en rojo.
5. **CRITERIO:** si el cambio toca pantallas, deja a la persona los pasos para la revisión funcional (Fase 6).

## Entrega

Un resumen final con:

| | |
|---|---|
| Petición | La frase original y el issue (`#<nº>`) |
| Alcance | Capas tocadas y por qué; capas descartadas y por qué |
| Skills ejecutados | En orden, con el resultado de cada verificación |
| Ficheros | Nuevos y modificados |
| Tests | Resultado de `backend-test.ps1` / `frontend-test.ps1` y tabla criterio → test |
| PR | Enlace y estado (fusionada) |
| Pendiente | Firmas, preguntas al PO o mejoras que quedaron fuera |

## Ejemplos de alcance

| Petición | Capas |
|---|---|
| "Implementa el issue #11 (papelera en Angular)" | `frontend` → `pruebas` (la API ya existe) |
| "Quiero que las tareas tengan prioridad alta, media o baja" | Pregunta al PO (¿obligatoria?, ¿valor por defecto?) → `analisis-diseno` → `modelo` → `dto` → `servicio` → `api` → `frontend` → `pruebas` |
| "Al completar una tarea mensual el 31 sale mal la fecha" | `pruebas` (test que lo reproduce) → `servicio` (`RecurrenceCalculator`) |
| "Devuelve 404 en vez de 409 al restaurar una tarea activa" | Cambio técnico de contrato: `analisis-diseno` (y ADR si contradice una decisión) → `api` → `pruebas` |
| "Añade paginación a la lista" | Fuera de alcance de la v0.1: se detiene y lo dice |
