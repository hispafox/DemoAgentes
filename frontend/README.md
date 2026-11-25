# Frontend — Lista de Tareas

Aplicación Angular que consume la API del backend (`docs/analisis.md` §6).

```powershell
npm install
npm start      # http://localhost:4200, con /api redirigido al backend (proxy.conf.json)
npm test       # tests con Vitest, una sola pasada
npm run build
```

El backend tiene que estar levantado en `http://127.0.0.1:8000` (`.\scripts\backend-start.ps1` desde la raíz).

- `src/app/core/`: servicios HTTP (`api/`), interceptor de errores, mensajes y modelos.
- `src/app/shared/`: componentes y pipes reutilizables.
- `src/app/features/`: una carpeta por bloque funcional (tareas, plantillas).
