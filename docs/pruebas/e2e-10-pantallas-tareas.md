# Guion de prueba E2E — Pantallas de tareas (#10)

> Estado: **pendiente de firma**

Prueba en el navegador de los criterios de aceptación del issue #10 (lista `/tasks`, formulario `/tasks/new`, completar y eliminar). Se recorre con el **MCP de Playwright** (`.mcp.json`) o a mano, en el mismo orden.

## Cómo repetirla

**Con un agente:** en Claude Code, pide:

> Ejecuta el guion `docs/pruebas/e2e-10-pantallas-tareas.md` con Playwright y dime qué pasos pasan y cuáles fallan.

**A mano:** abre `http://localhost:4200` y sigue los pasos de la tabla.

## Preparación

1. Backend en marcha: `.\scripts\backend-start.ps1` (`http://127.0.0.1:8000`).
2. Frontend en marcha: `.\scripts\frontend-start.ps1` (`http://localhost:4200`, con proxy de `/api`).
3. Comprobación: `GET http://127.0.0.1:8000/api/tasks` y `GET http://localhost:4200` devuelven `200`.

> ⚠️ La prueba escribe en la base de datos de desarrollo (`backend/var/data.db`): crea dos tareas llamadas "QA Playwright repetitiva". Ver "Limpieza" al final.

## Pasos

| # | Criterio | Acción | Herramienta MCP | Resultado esperado |
|---|---|---|---|---|
| 1 | Lista | Abrir `http://localhost:4200/tasks` y esperar a que desaparezca "Cargando tareas…" | `browser_navigate`, `browser_wait_for` (`textGone`) | Con la base vacía: "Todavía no tienes tareas." y el enlace "Crear tarea". Si hay tareas: secciones "Pendientes (n)" y "Completadas (n)". |
| 2 | Título vacío | Pulsar "Nueva tarea" y, sin escribir nada, pulsar "Guardar" | `browser_click`, `browser_snapshot` | Bajo el título: "Error: El título es obligatorio."; el campo queda marcado como inválido y se sigue en `/tasks/new`. |
| 3 | Título vacío | Revisar las peticiones a `/api/` | `browser_network_requests` (filtro `/api/`) | Solo está el `GET /api/tasks` inicial; **no hay ningún `POST`**. |
| 4 | Crear | Escribir "QA Playwright repetitiva", marcar "Tarea repetitiva", elegir "Diaria" y pulsar "Guardar" | `browser_type`, `browser_click`, `browser_select_option` | Al marcar "repetitiva" aparece "Periodicidad" con "Semanal" preseleccionado. Al guardar se vuelve a `/tasks` con el aviso "Tarea creada."; la tarea sale en Pendientes con "Diaria" y "Próxima: <hoy + 1 día>" (RN-18). |
| 5 | Completar | Pulsar "Completar" en la tarea | `browser_click`, `browser_wait_for` ("Completadas") | Aviso "Tarea completada. Se ha creado la siguiente repetición." La tarea pasa a "Completadas (1)" con la etiqueta "Completada" y **sin botón "Completar"**. En Pendientes aparece una tarea nueva con el mismo título, "Diaria" y otro id (ver el enlace "Editar"). |
| 6 | Completar | Comprobar la fecha de la nueva tarea | `browser_snapshot` o `GET /api/tasks` | "Próxima: <hoy + 1 día>". Es correcto que coincida con la de la original: RN-05 calcula desde el día en que se completa, no desde la fecha anterior. |
| 7 | Eliminar | Pulsar "Eliminar" en la tarea pendiente y aceptar la confirmación | `browser_click`, `browser_handle_dialog` (`accept: true`) | Diálogo "¿Mover «QA Playwright repetitiva» a la papelera? …". Tras aceptar: la tarea desaparece, aviso "Tarea movida a la papelera." y "Pendientes (0)" con "No tienes tareas pendientes." |
| 8 | Error de la API | Abrir `http://localhost:4200/tasks/999/edit` | `browser_navigate`, `browser_wait_for` ("No se ha encontrado") | La API responde `404` (se ve en la consola y en la red). La pantalla muestra el aviso "No se ha encontrado el elemento." (con botón ×) y "No se ha encontrado la tarea." con el enlace "Volver a la lista". |
| 9 | — | Cerrar el navegador | `browser_close` | — |

## Avisos

- **Lentitud del equipo:** el paso 8 puede quedarse unos segundos en "Cargando tarea…". Espera al texto con `browser_wait_for` en vez de una pausa fija; no es un fallo del código.
- Las capturas y los registros del MCP se guardan en `.playwright-mcp/`, que está en el `.gitignore`.

## Limpieza

Las tareas de prueba quedan en la base de datos de desarrollo: una completada y otra en la papelera. Vaciar la papelera está fuera de alcance, así que para dejar la base limpia hay que eliminar la completada desde la lista o volver a crear la base con las migraciones.

## Ejecuciones

| Fecha | Quién | Resultado |
|---|---|---|
| 2026-11-26 | Claude Code con el MCP de Playwright | 5 de 5 criterios OK (tareas 3 y 4 de prueba) |
