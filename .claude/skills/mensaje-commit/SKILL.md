---
name: mensaje-commit
description: >-
  Redacta el mensaje de commit de DemoAgentes a partir de los cambios preparados.
  Úsalo siempre que se vaya a hacer un commit en este proyecto o cuando el usuario
  pida "mensaje de commit", "commitea", "haz commit" o similar. Produce una primera
  línea "tipo: descripción corta" específica y, si el cambio no es trivial, un
  cuerpo con el detalle.
---

# Mensaje de commit

Redacta el mensaje de commit a partir de lo que realmente cambió, no de lo que se pretendía hacer.

## 1. Mira los cambios antes de escribir

```bash
git status --short
git diff --cached --stat
git diff --cached
```

Si no hay nada preparado (`staged`), revisa `git diff` y pregunta qué ficheros entran en el commit. No escribas el mensaje sin haber leído el diff.

## 2. Formato

```
tipo: descripción corta

Cuerpo opcional: qué se tocó exactamente y por qué.
```

**Primera línea (obligatoria)**
- `tipo` en minúsculas, uno de estos:

  | tipo | cuándo |
  |---|---|
  | `feat` | funcionalidad nueva |
  | `fix` | corrección de un error |
  | `docs` | documentación (CLAUDE.md, `docs/`, README) |
  | `test` | tests nuevos o modificados |
  | `refactor` | cambio de código sin cambiar comportamiento |
  | `style` | formato, sin cambio de lógica |
  | `build` | dependencias, Composer, npm, Docker |
  | `ci` | pipelines y CI |
  | `chore` | mantenimiento que no encaja en lo anterior (`.gitignore`, configuración) |

- Descripción en castellano, en infinitivo, sin punto final y de 72 caracteres como máximo.
- Si el commit corresponde a un issue de GitHub, el número va al final de la primera línea: `tipo: descripción corta (#<nº>)`. Nunca empieces el mensaje por `#`: Git trata esas líneas como comentarios.
- Si el commit resuelve el issue, añade al final del cuerpo `Closes #<nº>`.

**Cuerpo (opcional, pero valioso)**
- Se separa de la primera línea con una línea en blanco.
- Explica el detalle: qué ficheros o piezas cambiaron, qué decisión se tomó y por qué.
- Usa viñetas cuando haya varios cambios.
- Si el cambio es trivial (una errata, una línea), la primera línea basta: no inventes un cuerpo.

## 3. Reglas de contenido

1. **Sé específico con lo que cambió.** Di qué se tocó exactamente: la sección, el fichero o el comportamiento. "actualizar fichero" no vale.
2. **Escueto no es vago.** Una línea corta puede decirlo todo si nombra el cambio concreto.
3. **Un commit, un propósito.** Si el diff mezcla cambios sin relación, propón dividirlo en varios commits en lugar de escribir un mensaje genérico.

## 4. Ejemplos

Bien:

```
docs: cambiar idioma de código de inglés a castellano
```

```
chore: añadir .gitignore para Symfony y Angular
```

```
docs: definir el candado del flujo como el propio CLAUDE.md

- Mover el candado ① del diagrama a la app PHP.
- Añadir la Fase 0.5 para cerrar y aprobar el diseño antes de implementar.
- Añadir la regla de que ninguna implementación se salga del CLAUDE.md.
```

Mal (y por qué):

| mensaje | problema |
|---|---|
| `actualizar instrucciones` | no dice qué instrucciones ni qué cambió |
| `docs: cambios varios` | vago: "varios" esconde el contenido |
| `fix: arreglar bug` | no dice qué fallaba |
| `update CLAUDE.md` | sin tipo y en inglés; nombra el fichero pero no el cambio |

## 5. Entrega

1. Muestra el mensaje propuesto al usuario.
2. Haz el commit solo si el usuario lo aprueba. Para mensajes con cuerpo, usa un heredoc o `git commit -F` con un fichero temporal, para conservar los saltos de línea.
