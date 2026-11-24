---
name: bitacora
description: >-
  Lleva la bitácora de DemoAgentes en docs/bitacora.md. Modo "registrar" (por
  defecto): añade la entrada del paso que se acaba de terminar con la plantilla
  fija. Úsalo al terminar cualquier paso del proyecto, aunque el usuario no lo
  pida. Modo "retomar": en un chat nuevo, reconstruye el estado del proyecto a
  partir de la bitácora, el CLAUDE.md y git, y propone el siguiente paso. Úsalo
  cuando el usuario diga "retomar", "dónde estábamos", "seguimos", "continúa la
  bitácora" o abra una conversación nueva sobre este proyecto.
---

# Bitácora del proyecto

La bitácora (`docs/bitacora.md`) es la memoria del proyecto entre chats. Recoge lo que **no** está en el código ni en Git: qué se hizo, por qué, qué se decidió y qué quedó pendiente.

Elige el modo según el argumento:
- Sin argumento o `registrar` → **Modo registrar**
- `retomar` → **Modo retomar**

---

## Modo registrar

### 1. Reúne la información del paso

- Repasa la conversación: qué pidió el usuario, qué se hizo y qué se decidió.
- Mira los ficheros afectados:

  ```bash
  git status --short
  git diff --stat
  ```

- Lee la última entrada de `docs/bitacora.md` para conocer el número del último paso y no repetir lo ya registrado.

### 2. Escribe la entrada

Añádela **al final** de `docs/bitacora.md`, con el siguiente número y la fecha de hoy:

```markdown
## Paso N — Título corto y específico (AAAA-MM-DD)

**Qué hicimos:** una o dos frases con el resultado.

**Por qué:** el motivo o la petición que lo originó. Omítelo si es obvio.

**Cambios:**
- Detalle concreto de cada cambio relevante.

**Decisión:** solo si se eligió entre alternativas: qué se eligió y por qué.

**Pendiente:** solo si algo quedó a medias o por decidir.

**Ficheros:** `ruta` (nuevo | modificado | eliminado), ...
```

Reglas:
- Omite las secciones opcionales (Por qué, Cambios, Decisión, Pendiente) cuando no aporten. Un paso pequeño puede quedarse en "Qué hicimos" y "Ficheros".
- Sé específico: "añadir sección Estructura de carpetas al CLAUDE.md", no "actualizar documentación".
- Escribe en castellano y en pasado ("creamos", "corregimos").
- Si el paso fue un error y su corrección, explica la **causa** además de la solución. Es lo que más sirve a quien retome.
- Un paso = una entrada. Si en un mismo turno se hicieron varias cosas sin relación, crea varias entradas.

### 3. Mantén la coherencia

- **Pasos superados:** si este paso deja obsoleto algo registrado antes, añade al final de la entrada antigua: `*(Superado en el paso N: motivo breve.)*`. No borres ni reescribas el historial.
- **Lista de tareas:** si el paso completa una tarea de `CLAUDE.md`, márcala como `[x]`. Cambiar el contenido del CLAUDE.md (reglas, diseño) requiere aprobación del usuario: es el candado.
- **Pendientes resueltos:** si este paso resuelve un "Pendiente" de una entrada anterior, menciónalo en "Qué hicimos".

### 4. Confirma

Di en una línea qué número de paso has registrado y con qué título.

---

## Modo retomar

Pensado para el inicio de un chat nuevo. No modifica ningún fichero.

### 1. Lee el estado

```bash
git log --oneline -15
git status --short
git branch --show-current
```

Lee también:
- `docs/bitacora.md` completo, prestando más atención a los últimos pasos.
- `CLAUDE.md`, sobre todo la "Lista de tareas" (ya se carga solo al iniciar el chat).
- `docs/aprendizajes.md`, si tiene entradas.

### 2. Resume

Devuelve un resumen breve con estas secciones:

```markdown
**Último paso registrado:** Paso N — título (fecha)

**Hecho hasta ahora:** 3-6 viñetas con los hitos, no paso por paso.

**Decisiones vigentes:** las que siguen en pie; ignora las marcadas como superadas.

**Pendiente:** los "Pendiente" de la bitácora que no se resolvieron después,
y los cambios sin commitear si los hay.

**Fase actual:** la primera fase del CLAUDE.md con tareas sin marcar.

**Siguiente paso propuesto:** una sola acción concreta.
```

### 3. Detecta desajustes

Avisa si encuentras alguno:
- Commits en `git log` que no aparecen en la bitácora.
- Ficheros modificados sin commitear que ningún paso explica.
- Tareas marcadas `[x]` en el CLAUDE.md sin paso que las respalde, o al revés.

No los corrijas por tu cuenta: proponlo y espera respuesta.

### 4. Espera

Termina preguntando si se sigue con el paso propuesto. No empieces a trabajar sin confirmación.
