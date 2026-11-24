# ADR-0003 — SQLite en la versión 0.1

- **Estado:** aceptado (2026-11-24)
- **Matiza:** [ADR-0001](0001-base-de-datos-postgresql.md)

## Contexto

El ADR-0001 elige PostgreSQL en Docker Compose, pero el equipo de desarrollo no tiene Docker instalado. Para no bloquear la versión 0.1 se busca una base de datos que funcione sin instalar nada.

## Decisión

- En la versión 0.1, **SQLite** (fichero en `backend/var/data.db`; en tests, `var/test.db`), con el driver `pdo_sqlite` de PHP.
- PostgreSQL en Docker (ADR-0001) se adopta cuando se configure el entorno Docker de la Fase 0.

## Consecuencias

- Las migraciones de Doctrine se escriben solo con tipos portables para que funcionen en ambos motores; al pasar a PostgreSQL se regenera la migración inicial si hace falta.
- La CI de la 0.1 no necesita servicio de base de datos.
- La tarea de Docker Compose de la Fase 0 sigue pendiente.
