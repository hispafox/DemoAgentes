# Plan del issue #23 — Errores en problem+json también para rutas de la API que no existen

- **Issue:** #23 · **Rama:** feature/23-errores-problem-json · **Fecha:** 2026-11-26

## Objetivo
Que toda petición a `/api/...` que no coincida con ninguna ruta (404, 405) responda en `application/problem+json`, también sin cabecera `Accept`.

## Criterios de aceptación
1. Una petición a `/api/...` sin ruta coincidente y sin `Accept` recibe 404 con `Content-Type: application/problem+json`. (CLAUDE.md, "API REST")
2. `GET /api/tasks/abc` recibe 404 en `application/problem+json`.
3. `PATCH /api/tasks/1` recibe 405 en `application/problem+json`.
4. Una ruta fuera de `/api` (por ejemplo `/`) no cambia su comportamiento.

## Alcance
| Capa | ¿Se toca? | Motivo |
|---|---|---|
| Análisis | sí (menor) | §4 "Formato de errores" no menciona el 405 ni las rutas sin coincidencia; añadir una línea. No cambia reglas de negocio ni contrato existente. |
| Backend: modelo · dto · servicio · api | solo "api" (infraestructura HTTP) | Un `EventSubscriber` en `backend/src/EventListener/` (kernel.request, prioridad mayor que la del router) que fija `_format=json` en peticiones cuya ruta empieza por `/api`. No hay entidad, DTO ni servicio nuevos. |
| Frontend | no | El interceptor de errores ya entiende problem+json; solo mejora lo que recibe. |
| Pruebas | sí | Tests funcionales de los 4 criterios. |

## Pasos
| # | Agente | Skill | Qué hace | Ficheros previstos |
|---|---|---|---|---|
| 1 | orquestador | analisis-diseno (actualizar) | Añadir a §4 "Formato de errores" que `404` y `405` de `/api` (también sin ruta coincidente) salen en problem+json; añadir `405` a la lista de códigos. Pasa a "pendiente de firma". | `docs/analisis.md` |
| 2 | implementador-backend | api (crear) | Subscriber de `kernel.request` que, para rutas `/api`, fija el formato de petición a `json` antes de que actúe el router. Revisar si el comentario de `TaskController` (`format: 'json'`) sigue siendo necesario. | `backend/src/EventListener/ApiJsonFormatSubscriber.php` (nuevo), posible ajuste en `TaskController.php` y `TaskTemplateController.php` |
| 3 | implementador-backend | pruebas (crear) | Tests funcionales sin `Accept` de los 4 criterios. Ampliar el test existente. | `backend/tests/Functional/ApiErrorFormatTest.php` |
| 4 | verificador | pruebas (ejecutar) | `backend-test.ps1` (PHP-CS-Fixer, PHPStan, PHPUnit) y matriz criterio -> test. | — |
| 5 | orquestador | bitacora, mensaje-commit | Bitácora, commit `fix: ... (#23)`, PR con `Closes #23`, merge con tests en verde. | `docs/bitacora.md` |

## Tests previstos
| Criterio | Test |
|---|---|
| 1 | `ApiErrorFormatTest::testUnknownApiRouteWithoutAcceptReturnsProblemJson404` (`GET /api/nope`, sin `Accept`; comprueba 404, Content-Type y `status` del cuerpo) |
| 2 | `ApiErrorFormatTest::testNonNumericIdWithoutAcceptReturnsProblemJson404` (`GET /api/tasks/abc`) |
| 3 | `ApiErrorFormatTest::testMethodNotAllowedReturnsProblemJson405` (`PATCH /api/tasks/1`) |
| 4 | `ApiErrorFormatTest::testNonApiRouteIsNotAffected` (`GET /`: 404 y `Content-Type` distinto de `application/problem+json`) |

El test existente (con `Accept: application/json`) se mantiene.

## Dependencias, riesgos y preguntas abiertas
- Riesgo: la prioridad del subscriber debe ser mayor que la de `RouterListener` (32); con el valor equivocado no tiene efecto. Los tests lo detectan.
- Riesgo: el 405 lleva la cabecera `Allow`; comprobar que se conserva.
- Firmas: `docs/analisis.md` pierde la firma al cambiar (aviso, no bloquea).
- Preguntas abiertas: ninguna.

## Notas del ensayo
- El skill `nueva-feature` en modo plan habla de "skills" y "modos" (por ejemplo `analisis-diseno` actualizar), mientras que mi plantilla pide una columna "Agente" con solo cuatro valores. He puesto los pasos de análisis y de cierre (bitácora, commit, PR) bajo `orquestador`, porque el planificador no puede escribir fuera de `docs/planes/`.
- Los criterios de aceptación del issue no citan RN-xx (es un cambio técnico). He referenciado el CLAUDE.md en el primero.
- No hay un agente para el paso de análisis; he asumido que lo ejecuta el orquestador. Convendría aclararlo.
- El skill dice "espera el visto bueno" para peticiones técnicas, pero como subagente planificador no puedo preguntar; el plan se entrega sin visto bueno.
- Las instrucciones dicen "no tocas otros documentos", así que el cambio en `docs/analisis.md` queda como paso para otro agente.
- No he ejecutado `debug:router` ni mirado `framework.yaml` a fondo; el diseño del subscriber se basa en la lectura de los controladores y del issue.
