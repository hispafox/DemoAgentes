# CLAUDE.md — DemoAgentes

> Estado: **pendiente de nueva firma** — firmado por hispafox el 2026-11-24 (CRITERIO de la Fase 0.5); cambiado después para añadir el mapeo de Doctrine con atributos.

Demo de desarrollo asistido por agentes de IA: partimos de la documentación funcional de una aplicación y, a través de MCP, llegamos a código PHP probado y a una Pull Request en Git. En cada paso hay un **criterio** (punto de control humano) antes de avanzar.

## La aplicación: Lista de Tareas

Aplicación web para gestionar tareas personales con **plantillas** reutilizables, **tareas repetitivas** (al completarlas se genera la siguiente) y **papelera**. Es una demo didáctica: se prioriza la claridad del código sobre la sofisticación.

| Documento | Qué define |
|---|---|
| `docs/app/lista-de-tareas.md` | Qué hace: funcionalidades F-01 a F-14, casos de uso y reglas de negocio RN-01 a RN-13 |
| `docs/analisis.md` | Cómo se construye: entidades, endpoints, lógica, pantallas y plan de tests |
| `docs/decisiones/` | Decisiones técnicas (ADR) |

**Alcance de la versión 0.1:** API completa (tareas, completar con recurrencia, papelera y plantillas) y frontend Angular con sus pantallas, con SQLite como base de datos (ADR-0003).

**Fuera de alcance:** usuarios y autenticación, paginación, filtros y búsqueda, generación automática de ocurrencias, periodicidades personalizadas, vaciar la papelera.

Si este CLAUDE.md y esos documentos se contradicen, manda el documento firmado más específico (análisis para lo técnico, documentación funcional para lo funcional), y se corrige el otro.

## Stack

- **Backend:** PHP 8.3+, Symfony 7, Doctrine ORM (migraciones con Doctrine Migrations)
- **Base de datos:** SQLite en la versión 0.1 (ADR-0003); PostgreSQL en Docker más adelante (ADR-0001)
- **Frontend:** Angular (última LTS), TypeScript estricto
- **Tests:** PHPUnit (unitarios e integración) en backend; Jest/Karma en Angular; tests E2E opcionales (Playwright)
- **Gestión:** GitHub (vía MCP): Issues para el backlog, Milestones/labels para agrupar, GitHub Projects como tablero y Pull Requests

## Arquitectura y convenciones

**Backend (capas):** `Controller → Service → Repository → Entity`, con `Dto/` para la entrada y salida de la API.
- El controlador recibe el DTO (`#[MapRequestPayload]`), llama al servicio y devuelve un DTO de salida. Nunca contiene lógica de negocio ni serializa entidades.
- Las reglas de negocio viven en los servicios y en los métodos de dominio de las entidades.
- Inyección por constructor (autowiring); fechas con `DateTimeImmutable` y `ClockInterface`.
- Mapeo de Doctrine con **atributos PHP** en la propia entidad (`#[ORM\Entity]`, `#[ORM\Column]`…); no se usan ficheros XML ni YAML de mapeo.

**API REST:**
- Prefijo `/api`, recursos en plural y en inglés (`/api/tasks`, `/api/task-templates`); acciones con efectos como subrecurso `POST` (`/complete`, `/restore`, `/instantiate`).
- JSON con propiedades en `camelCase`; fechas ISO 8601.
- Códigos: `200`, `201` (+ `Location`), `204`, `400` (JSON mal formado), `404`, `409` (estado no permite la acción), `422` (validación).
- Errores siempre en `application/problem+json` (RFC 9457).

**Nombres:** código, tablas y rutas en inglés (ADR-0002). Clases en `PascalCase`, métodos y propiedades en `camelCase`, tablas y columnas en `snake_case`. Tests: `<Clase>Test`, un método `test<Comportamiento>` por caso.

**Frontend (Angular):** `core/` (servicios HTTP, interceptores, modelos), `shared/` (componentes y pipes reutilizables) y `features/<bloque>/` (pantallas y rutas). Componentes *standalone*, formularios reactivos tipados y textos de la interfaz en castellano.

## Estructura de carpetas

Las marcadas con ✅ ya existen; el resto se crean en su fase.

```
DemoAgentes/
├── CLAUDE.md                     ✅ ① El candado: diseño y reglas del proyecto
├── .gitignore                    ✅
├── docker-compose.yml               Entorno local: PHP-FPM, Nginx, BD, Node (Fase 0)
├── .claude/
│   └── skills/                   ✅ Skills del proyecto
│       ├── mensaje-commit/       ✅ Redacta los mensajes de commit
│       ├── bitacora/             ✅ Registra pasos y retoma el proyecto en un chat nuevo
│       └── modelo/               ✅ Crea, actualiza y revisa el modelo Doctrine a partir del análisis
├── .github/
│   ├── workflows/                   GitHub Actions: lint, PHPStan, tests (Fase 7)
│   └── pull_request_template.md     Plantilla de PR con "Closes #<nº>" (Fase 7)
├── docs/                         ✅ Documentación del proyecto (en español)
│   ├── bitacora.md               ✅ Registro de cada paso
│   ├── aprendizajes.md           ✅ Lo aprendido (solo cuando se pide)
│   ├── app/                      ✅ Documentación funcional: requisitos, casos de uso, mockups (Fase 1)
│   ├── analisis.md               ✅ Análisis técnico: entidades, endpoints, pantallas (Fase 2)
│   └── decisiones/               ✅ ADR: una decisión técnica por fichero (Fase 2)
├── scripts/                      ✅ Scripts de PowerShell para instalar, arrancar y probar
├── backend/                      ✅ Symfony + Doctrine (Fase 4)
│   ├── config/
│   ├── migrations/                  Doctrine Migrations
│   ├── public/                      index.php (punto de entrada)
│   ├── src/
│   │   ├── Controller/              Capa HTTP: recibe la petición y delega en Service
│   │   ├── Service/                 Lógica de negocio
│   │   ├── Repository/              Acceso a datos con Doctrine
│   │   ├── Entity/                  Entidades Doctrine
│   │   └── Dto/                     Objetos de entrada/salida de la API
│   └── tests/
│       ├── Unit/                    PHPUnit: servicios y entidades
│       └── Functional/              PHPUnit: endpoints de la API
└── frontend/                        Angular (Fase 6)
    └── src/app/
        ├── core/                    Servicios HTTP, interceptores, guards
        ├── shared/                  Componentes y utilidades reutilizables
        └── features/                Una carpeta por bloque funcional (pantallas y rutas)
```

## Flujo de trabajo (pizarra)

```
DOC de la APP ──MCP──► GITHUB ISSUES (historias/tareas) ──MCP──► IA ──► APP PHP [🔒 ① CLAUDE.md] ──► ② Git PR
      │                                                           ▲                │                     │
      └──MCP──► ANÁLISIS ─────────────────────────────────────────┘                ▼                     ▼
      ▼                ▼                                                        CRITERIO              CRITERIO
   CRITERIO         CRITERIO
```

1. **DOC → GITHUB ISSUES:** la documentación de la app se convierte, vía MCP, en issues de GitHub (historias y tareas), agrupados en milestones (épicas) y etiquetas.
2. **DOC → ANÁLISIS:** en paralelo se genera un análisis técnico (modelo de datos, endpoints, pantallas, riesgos).
3. **ISSUES + ANÁLISIS → APP PHP:** la IA toma cada issue de GitHub (vía MCP) y lo implementa apoyándose en el análisis.
4. **① El candado = este CLAUDE.md:** es el diseño que define en qué consiste el proyecto. Cierra el marco dentro del cual trabaja la IA: stack, arquitectura, convenciones y reglas. Todo lo que se implemente debe ajustarse a él; si algo no encaja, se cambia primero el CLAUDE.md (con aprobación), no el código por libre.
5. **② Git PR:** cada issue termina en una rama y una Pull Request enlazada al issue (`Closes #<nº>`).
6. **CRITERIO:** en cada salida hay revisión humana; no se avanza al siguiente paso sin aprobación.

## Lista de tareas

### Fase 0 — Preparación del entorno
- [x] Inicializar repositorio Git en local (rama `main`) y definir estrategia de ramas (`main`, `feature/<nº-issue>-descripcion`)
- [x] Crear el repositorio remoto en GitHub y enlazarlo (`origin`)
- [ ] Configurar el MCP de GitHub y comprobar lectura/escritura de issues y PRs (alternativa: CLI `gh`)
- [ ] Crear el tablero en GitHub Projects (las etiquetas base `backend`, `frontend`, `test`, `docs` ya están creadas)
- [x] Definir la estructura de carpetas (ver sección "Estructura de carpetas")
- [ ] Crear las carpetas que faltan a medida que avance cada fase
- [ ] Definir entorno local (Docker Compose: PHP-FPM, Nginx, base de datos, Node)

### Fase 0.5 — Diseño del proyecto (① candado: CLAUDE.md)
- [x] Completar este CLAUDE.md con el diseño: qué es la app, alcance, arquitectura y convenciones
- [x] Definir la estructura de capas del backend (Controller → Service → Repository/Doctrine)
- [x] Definir convenciones de nombres, API (REST, formato de errores) y estructura de Angular
- [x] Actualizar el CLAUDE.md al cerrar el análisis (Fase 2) para reflejar las decisiones
- [x] **CRITERIO:** aprobación del CLAUDE.md; a partir de aquí la IA trabaja dentro de este marco

### Fase 1 — Documentación de la app (DOC)
- [x] Reunir la documentación funcional en `docs/` (requisitos, casos de uso, mockups)
- [x] Normalizar el documento: actores, funcionalidades, reglas de negocio
- [x] **CRITERIO:** validación del documento por negocio/PO

### Fase 2 — Análisis (DOC → ANÁLISIS)
- [x] Generar `docs/analisis.md`: entidades Doctrine, relaciones, endpoints de la API, pantallas Angular
- [x] Identificar requisitos no funcionales (seguridad, rendimiento, autenticación)
- [x] Registrar decisiones técnicas en `docs/decisiones/` (ADR)
- [x] **CRITERIO:** revisión del análisis por el equipo técnico

### Fase 3 — Backlog en GitHub Issues (DOC → ISSUES)
- [x] Crear un milestone por bloque funcional (épica) vía MCP
- [x] Crear issues de historia de usuario con criterios de aceptación (Dado/Cuando/Entonces)
- [x] Desglosar en issues de tarea técnica (backend, frontend, tests), con etiquetas y sub-issues o checklists
- [x] Enlazar cada issue con la sección correspondiente del análisis
- [ ] Añadir los issues al tablero de GitHub Projects
- [ ] **CRITERIO:** refinamiento y priorización del backlog

### Fase 4 — Backend PHP (ISSUES → IA → PHP)
- [x] Crear proyecto Symfony en `backend/`
- [x] Configurar Doctrine y la conexión a la base de datos
- [ ] Implementar entidades y migraciones según el análisis
- [ ] Implementar servicios de dominio y controladores/API REST
- [ ] Implementar validación de entrada y gestión de errores (la autenticación queda fuera de alcance según `docs/app/`)
- [ ] Por cada issue: leer el issue vía MCP → implementar → mover en el tablero y comentar el avance

### Fase 5 — Tests

> ⏸️ **Tests SUSPENDIDOS** desde el 2026-11-24 por decisión de hispafox, hasta que lo reactive en el chat. Mientras dure:
> - El agente **no ejecuta** PHPUnit ni ningún test, y **no escribe tests nuevos**. Los que ya existen se quedan como están.
> - Se pueden abrir PR sin tests en verde; la descripción lo indica con "Tests diferidos (Fase 5 suspendida)".
> - Siguen vigentes las comprobaciones que no son tests: sintaxis (`php -l`), mapeo de Doctrine y migraciones.
> - Pendiente al reactivar: el bloqueo de PHPUnit en `main` (bitácora, paso 31) y ejecutar los tests escritos sin ejecutar (paso 32).

- [x] Configurar PHPUnit y base de datos de test
- [ ] Tests unitarios de servicios y entidades
- [ ] Tests funcionales de los endpoints
- [ ] Cubrir cada criterio de aceptación del issue con al menos un test
- [ ] **CRITERIO:** todos los tests en verde y cobertura acordada antes de abrir PR

### Fase 6 — Frontend Angular
- [ ] Crear proyecto Angular en `frontend/`
- [ ] Servicios HTTP contra la API del backend
- [ ] Componentes y rutas según las pantallas del análisis
- [ ] Tests de componentes y servicios
- [ ] **CRITERIO:** revisión funcional de las pantallas

### Fase 7 — Git y Pull Request (②)
- [ ] Una rama por issue, con el número del issue en el nombre y en los commits
- [ ] Abrir PR con descripción, `Closes #<nº>` y resumen de tests
- [ ] CI con GitHub Actions: lint, análisis estático (PHPStan) y tests en cada PR
- [ ] **CRITERIO:** code review humana y merge; el issue se cierra solo al hacer merge

## Firmas (puertas de CRITERIO)

Cada CRITERIO se cierra con una **firma**: una persona aprueba expresamente el entregable en el chat ("apruebo", "lo firmo"). El agente nunca firma por su cuenta ni da una firma por supuesta.

Una firma deja tres huellas, y las tres deben coincidir:
1. Una fila en el **Registro de firmas** (abajo).
2. La cabecera del documento firmado: `Estado: aprobado — firmado por <persona> el <AAAA-MM-DD>` (en los ADR, `aceptado`).
3. El `[x]` del CRITERIO en la "Lista de tareas".

> ⏸️ **Regla de bloqueo SUSPENDIDA** desde el 2026-11-24 por decisión de hispafox, hasta que lo reactive en el chat. Mientras dure:
> - El agente avanza sin esperar firmas, pero cada entregable nuevo lleva `Estado: pendiente de firma` y se anota en "Pendientes de firma" (abajo), para firmarlo al reactivar la regla.
> - Siguen vigentes: no abrir PR con tests en rojo (salvo mientras los tests estén suspendidos, ver Fase 5), no hacer merge (lo decide una persona) y no implementar sin issue.

**Regla de bloqueo:** antes de empezar cualquier paso, el agente comprueba que están firmados todos los entregables de los que depende. Si falta una firma, **se detiene**: dice qué falta y la pide. No crea issues, código, ramas ni PR mientras tanto.

| Para hacer… | Debe estar firmado |
|---|---|
| Análisis (Fase 2) | Documentación funcional (Fase 1) |
| Backlog en GitHub (Fase 3) | CLAUDE.md (Fase 0.5), documentación funcional y análisis |
| Implementar un issue (Fases 4 a 6) | Backlog (Fase 3) y los ADR que afecten al issue |
| Abrir una PR (Fase 7) | Tests en verde (Fase 5); si toca pantallas, su revisión funcional (Fase 6) |

Si un documento firmado cambia después, pierde la firma (`Estado: pendiente de nueva firma`) y lo que dependa de él se bloquea hasta que se vuelva a firmar. Las correcciones de erratas que no cambian el contenido no anulan la firma.

### Pendientes de firma (regla suspendida)

| Entregable | Fase | Desde |
|---|---|---|
| Backlog v0.1: issues #1 a #12 y milestones en GitHub | 3 | 2026-11-24 |
| `CLAUDE.md`: regla de mapeo de Doctrine con atributos | 0.5 | 2026-11-24 |

### Registro de firmas

| Entregable | Fase | Firmado por | Fecha |
|---|---|---|---|
| `CLAUDE.md` | 0.5 | hispafox | 2026-11-24 |
| `docs/app/lista-de-tareas.md` | 1 | hispafox (PO) | 2026-11-24 |
| `docs/analisis.md` | 2 | hispafox | 2026-11-24 |
| ADR 0001, 0002 y 0003 (`docs/decisiones/`) | 2 | hispafox | 2026-11-24 |

## Reglas para el agente

- Este CLAUDE.md es el candado: ninguna implementación puede salirse de lo que define.
- No avanzar si falta una firma: ver la sección "Firmas". Una firma solo la da una persona en el chat. *(Suspendida temporalmente: ver la sección "Firmas".)*
- Documentar cada paso que se dé en `docs/bitacora.md` con el skill `bitacora` (qué se hizo, por qué, ficheros afectados). En un chat nuevo, empezar con `/bitacora retomar`.
- Añadir a `docs/aprendizajes.md` lo aprendido solo cuando el usuario lo pida.
- No implementar nada sin issue de GitHub asociado.
- No abrir PR si los tests no pasan. *(Suspendida mientras lo estén los tests: ver Fase 5.)*
- No hacer merge: el merge lo decide una persona (CRITERIO).
- Respetar el análisis de `docs/analisis.md`; si hay que desviarse, proponer un ADR antes.
- Commits con referencia al issue al final: `descripción breve (#<nº>)`. No empezar el mensaje por `#`: Git trata esas líneas como comentarios al editar el mensaje.
- Código y comentarios en inglés; documentación y tickets en español.

## Comandos

Scripts de PowerShell en `scripts/` (desde la raíz del repositorio):

```powershell
.\scripts\backend-setup.ps1    # Composer local en .tools/, dependencias y migraciones
.\scripts\backend-start.ps1    # Servidor en http://127.0.0.1:8000 (-Port, -Foreground)
.\scripts\backend-stop.ps1     # Para el servidor
.\scripts\backend-test.ps1     # Contenedor, mapeo de Doctrine y PHPUnit
```

Equivalentes manuales:

```bash
# Backend (Composer local: php ../.tools/composer.phar)
cd backend && php ../.tools/composer.phar install
php bin/console doctrine:migrations:migrate --allow-no-migration
php bin/phpunit

# Frontend
cd frontend && npm install
npm start
npm test
```
