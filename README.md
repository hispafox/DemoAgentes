# DemoAgentes — Lista de Tareas

Demo de **desarrollo asistido por agentes de IA**. Partimos de la documentación funcional de una aplicación y, paso a paso, llegamos a código PHP y a Pull Requests en GitHub. En cada paso hay un **criterio**, un punto de control en el que una persona revisa y aprueba antes de seguir.

La aplicación que se construye es una **Lista de Tareas**: tareas personales con plantillas reutilizables, tareas repetitivas (al completar una se genera la siguiente) y papelera. Es una demo didáctica, así que se prioriza que el código sea claro antes que sofisticado.

> **Estado:** en desarrollo, versión 0.1. El backend está completo (tareas, completar con recurrencia, papelera y plantillas) y probado con PHPUnit, PHPStan y PHP-CS-Fixer. El proyecto Angular está creado (issue #3); faltan sus pantallas (issues #10, #11 y #12).

## Cómo se trabaja

```
Documentación funcional ──► Análisis técnico ──► Issues en GitHub ──► Código ──► Pull Request
          │                        │                    │                │             │
       criterio                 criterio             criterio         criterio      criterio
```

- **[CLAUDE.md](CLAUDE.md)** es "el candado": define el stack, la arquitectura, las convenciones y las reglas dentro de las que trabaja el agente. Si algo no encaja, primero se cambia el CLAUDE.md, con aprobación.
- Cada entregable se **firma**: una persona lo aprueba en el chat y queda registrado.
- Cada issue termina en una rama `feature/<nº>-descripcion` y una PR con `Closes #<nº>`. El merge lo decide siempre una persona.
- Cada paso queda anotado en la **[bitácora](docs/bitacora.md)**, que sirve para retomar el proyecto en otra conversación.

## Documentación

| Documento | Qué contiene |
|---|---|
| [docs/app/lista-de-tareas.md](docs/app/lista-de-tareas.md) | Qué hace la aplicación: funcionalidades (F-xx), casos de uso y reglas de negocio (RN-xx) |
| [docs/analisis.md](docs/analisis.md) | Cómo se construye: modelo de datos, API REST, lógica, pantallas y plan de tests |
| [docs/decisiones/](docs/decisiones/) | Decisiones técnicas (ADR) |
| [docs/bitacora.md](docs/bitacora.md) | Registro de cada paso: qué se hizo, por qué y qué quedó pendiente |
| [docs/aprendizajes.md](docs/aprendizajes.md) | Lo aprendido durante el proyecto |

Los documentos `ARQUITECTURA-AGENTES*.md`, `skills-orquestacion*.md` y `analisis-diseño.md` de `docs/` vienen de proyectos anteriores y se conservan como referencia.

## Stack

- **Backend:** PHP 8.3+, Symfony 7, Doctrine ORM y Doctrine Migrations.
- **Base de datos:** SQLite en la versión 0.1 ([ADR-0003](docs/decisiones/0003-sqlite-en-la-version-0-1.md)); PostgreSQL en Docker más adelante ([ADR-0001](docs/decisiones/0001-base-de-datos-postgresql.md)).
- **Frontend:** Angular 22 con TypeScript estricto.
- **Tests:** PHPUnit en el backend; Vitest en el frontend.
- **Gestión:** GitHub Issues, milestones, etiquetas y Pull Requests.

## Puesta en marcha (backend)

Requisitos: **PHP 8.3 o superior** en el `PATH`, con la extensión `pdo_sqlite`. No hace falta instalar Composer: el script descarga una copia local en `.tools/` y verifica su firma.

Desde la raíz del repositorio, en PowerShell:

```powershell
.\scripts\backend-setup.ps1
```

Instala las dependencias y crea la base de datos con las migraciones.

```powershell
.\scripts\backend-start.ps1
```

Arranca el servidor en <http://127.0.0.1:8000>. Admite `-Port` y `-Foreground`.

```powershell
.\scripts\backend-stop.ps1
```

Para el servidor.

```powershell
.\scripts\backend-test.ps1
```

Comprueba el contenedor, el mapeo de Doctrine, el estilo (PHP-CS-Fixer) y el análisis estático (PHPStan), y lanza PHPUnit (`-SkipPhpUnit` para omitirlo).

## Puesta en marcha (frontend)

Requisitos: **Node.js 22 LTS o superior**. Con el backend arrancado:

```powershell
.\scripts\frontend-setup.ps1
```

Instala las dependencias de npm.

```powershell
.\scripts\frontend-start.ps1
```

Sirve la aplicación en <http://localhost:4200>. Las llamadas a `/api` van al backend a través del proxy (`frontend/proxy.conf.json`), sin problemas de CORS.

```powershell
.\scripts\frontend-test.ps1
```

Lanza los tests de Vitest y comprueba que la aplicación compila.

## Estructura

```
DemoAgentes/
├── CLAUDE.md          El candado: diseño y reglas del proyecto
├── .claude/agents/    Agentes de apoyo, cada uno con su comando en .claude/commands/
├── .claude/skills/    Skills del agente (bitácora, commits, análisis, modelo, DTO, servicios, API, pruebas, frontend y el orquestador nueva-feature)
├── docs/              Documentación funcional, análisis, ADR y bitácora
├── scripts/           Scripts de PowerShell para instalar, arrancar y probar
├── backend/           Symfony: Controller → Service → Repository → Entity, con Dto/
└── frontend/          Angular: core/, shared/ y features/
```

El detalle de carpetas y convenciones está en el [CLAUDE.md](CLAUDE.md).

## Skills del agente

Los skills de [.claude/skills/](.claude/skills/) encadenan el trabajo por capas. Cada uno lee lo que dejó el anterior y no inventa reglas ni contratos:

```
analisis-diseno ──► modelo ──► dto ──► servicio ──► api ──► frontend ──► pruebas ──► mensaje-commit
```

`nueva-feature` es el orquestador: recibe una petición en lenguaje natural o un issue, detecta qué capas toca y encadena los skills de esas capas hasta la PR fusionada, sin implementar nada por su cuenta.

## Agentes de apoyo

Además de los skills, hay siete agentes en [.claude/agents/](.claude/agents/), cada uno con su comando para lanzarlo por separado:

| Comando | Agente | Qué hace |
|---|---|---|
| `/refinar-backlog [alcance]` | `refinador-backlog` | Propone issues con criterios Dado/Cuando/Entonces y preguntas cerradas para el PO, sin crearlos |
| `/revisar-candado [#PR o rango]` | `guardian-candado` | Comprueba que un cambio cumple el CLAUDE.md: veredicto CUMPLE o NO CUMPLE |
| `/trazar-reglas [reglas]` | `trazador-reglas` | Matriz RN-xx/F-xx → análisis → issue → código → test |
| `/probar-qa [#issue]` | `qa-exploratorio` | Levanta el backend con su propia base de datos y prueba por HTTP los criterios y casos raros |
| `/revisar-seguridad [ámbito]` | `revisor-seguridad` | Revisión OWASP, dependencias y secretos |
| `/disenar-ui [#issue]` | `disenador-ui` | Especificación visual de las pantallas en `docs/diseno/` |
| `/presentar [tema]` | `presentador` | Guion de la demo en `docs/presentaciones/` |

El agente orquestador y los que dependen de él (planificador, implementadores, verificador…) se crearán en clase siguiendo `docs/ARQUITECTURA-AGENTES*.md`.

`bitacora` registra cada paso y, con `/bitacora retomar`, reconstruye el estado del proyecto al empezar una conversación nueva.
