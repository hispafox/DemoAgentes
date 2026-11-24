# ADR-0001 — PostgreSQL como base de datos

- **Estado:** aceptado (2026-11-24), aplicable cuando se configure el entorno Docker. En la 0.1 se usa SQLite: ver [ADR-0003](0003-sqlite-en-la-version-0-1.md).
- **Fecha:** 2026-11-24

## Contexto

El análisis de referencia (AppTodoList, .NET) usaba SQLite para no depender de un servidor. En DemoAgentes el CLAUDE.md prevé un entorno con Docker Compose (PHP-FPM, Nginx, base de datos y Node), así que el servidor de base de datos no supone trabajo extra.

## Decisión

Usar **PostgreSQL 16** en un contenedor de Docker Compose, tanto en desarrollo como para los tests funcionales (una base de datos `_test` separada).

## Alternativas

- **SQLite:** sin servidor y muy rápida en tests, pero se aleja de un entorno real y algunas migraciones de Doctrine se comportan distinto.
- **MySQL/MariaDB:** igual de válida con Doctrine; PostgreSQL se prefiere por su soporte de tipos (`date`, `timestamp`) y por ser el estándar de facto en proyectos Symfony nuevos.

## Consecuencias

- El `docker-compose.yml` de la Fase 0 incluye un servicio `database` con PostgreSQL.
- `DATABASE_URL` en `.env` apunta a ese servicio; los valores locales van en `.env.local` (ya ignorado por Git).
- Los tests funcionales necesitan el contenedor levantado, también en la CI (servicio `postgres` en GitHub Actions).
