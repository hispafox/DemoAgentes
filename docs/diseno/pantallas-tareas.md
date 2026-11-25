# Diseño de las pantallas de tareas (issue #10)

> Estado: **pendiente de firma** — especificación de diseño de `disenador-ui`. No contradice `docs/analisis.md` §6 ni los criterios del issue #10. Lo implementa el skill `frontend`.

**Alcance:** lista de tareas `/tasks` y formulario `/tasks/new` y `/tasks/:id/edit` (F-01, F-03 a F-06), más el sistema visual base. Papelera, plantillas y categorías quedan para sus issues; solo se dejan los enlaces de navegación preparados.

**Método:** `ui-ux-pro-max` solo está como ficha de catálogo (sin `scripts/search.py` ni `data/`), así que se aplican principios básicos: jerarquía clara, contraste AA, objetivos táctiles de 44 px, foco visible, estados vacíos útiles y consistencia. Sin librerías de componentes; CSS sencillo.

---

## 1. Sistema visual

Respeta lo ya existente (cabecera `#1f2937`, fondo `#f9fafb`, texto `#111827`, aviso rojo) y lo convierte en variables. Contrastes calculados (WCAG): texto normal exige 4.5:1; bordes y controles, 3:1.

```css
/* frontend/src/styles.css */
:root {
  /* Superficies y texto */
  --color-bg: #f9fafb;
  --color-surface: #ffffff;
  --color-text: #111827;          /* sobre bg 16.98:1 */
  --color-text-muted: #4b5563;    /* sobre bg 7.23:1, sobre surface 7.56:1 */
  --color-border: #d1d5db;        /* separadores decorativos */
  --color-border-strong: #6b7280; /* bordes de campos: sobre surface 4.83:1 (>=3:1) */
  --color-header-bg: #1f2937;
  --color-header-text: #ffffff;   /* 14.68:1 */

  /* Acción primaria */
  --color-primary: #1d4ed8;       /* blanco encima 6.70:1 */
  --color-primary-hover: #1e40af;
  --color-on-primary: #ffffff;

  /* Peligro */
  --color-danger: #b91c1c;        /* blanco encima 6.47:1; como texto sobre surface 6.47:1 */
  --color-danger-hover: #991b1b;
  --color-danger-bg: #fef2f2;
  --color-danger-text: #991b1b;   /* sobre danger-bg 7.60:1 */
  --color-danger-border: #fca5a5;

  /* Éxito / información */
  --color-success-bg: #f0fdf4;
  --color-success-text: #166534;  /* 6.81:1 */
  --color-success-border: #86efac;
  --color-info-bg: #eff6ff;
  --color-info-text: #1e40af;     /* 8.01:1 */

  /* Foco */
  --focus-ring: 0 0 0 3px #ffffff, 0 0 0 5px #1d4ed8;

  /* Espaciado (base 4 px) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Forma y tipografía */
  --radius: 0.375rem;
  --font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-size-base: 1rem;     /* 16 px */
  --font-size-small: 0.875rem;
  --font-size-title: 1.5rem;
  --font-size-heading: 1.25rem;
  --line-height: 1.5;
  --target-size: 2.75rem;     /* 44 px, objetivo táctil mínimo */
}

body { margin: 0; font-family: var(--font-family); font-size: var(--font-size-base);
       line-height: var(--line-height); color: var(--color-text); background: var(--color-bg); }

:focus-visible { outline: none; box-shadow: var(--focus-ring); }
```

Reglas: nunca se transmite el estado solo con color (las completadas llevan tachado y la etiqueta "Completada"); `prefers-reduced-motion`: sin animaciones (no se usan). Sin modo oscuro (fuera de alcance de la demo).

## 2. Componentes base

Clases globales en `styles.css` para que las usen todas las pantallas.

| Componente | Clase | Especificación |
|---|---|---|
| Botón primario | `.btn .btn-primary` | Fondo `--color-primary`, texto `--color-on-primary`, `min-height: var(--target-size)`, padding `--space-2 --space-4`, `--radius`, hover `--color-primary-hover`. |
| Botón secundario | `.btn .btn-secondary` | Fondo `--color-surface`, borde 1 px `--color-border-strong`, texto `--color-text`. |
| Botón peligro | `.btn .btn-danger` | Fondo `--color-danger`, texto blanco, hover `--color-danger-hover`. Solo para "Eliminar". |
| Deshabilitado | `.btn:disabled` | Opacidad 0.6, `cursor: not-allowed`, sin hover. Se usa mientras se guarda (evita doble envío). |
| Campo de texto | `.field` + `input` | `label` visible encima (nunca solo placeholder), input de `min-height: 2.75rem`, borde `--color-border-strong`, `--radius`. |
| Campo con error | `.field.has-error` | Borde `--color-danger` 2 px; bajo el input, `<p class="field-error" id="title-error">` en `--color-danger-text`, `--font-size-small`, precedido de "Error: " en texto (no solo color). |
| Check | `.check` | `input[type=checkbox]` de 1.25 rem dentro de un `label` con área clicable de 44 px de alto. |
| Selector | `select` | Mismo estilo que el input; flecha nativa. |
| Fila de tarea | `.task-row` | Tarjeta: fondo `--color-surface`, borde `--color-border`, `--radius`, padding `--space-4`, separación `--space-2`. Título a la izquierda, acciones a la derecha (en móvil, debajo). |
| Insignia | `.badge` | Texto pequeño en píldora: "Diaria/Semanal/Mensual" (`--color-info-bg`/`--color-info-text`) y "Completada" (`--color-success-bg`/`--color-success-text`). |
| Aviso | `.alert` | Ya existe (rojo, `role="alert"`, botón cerrar). Se añade `.alert-success` y `.alert-info` solo si se necesitan. |

Los botones de acción en filas llevan texto visible ("Completar", "Editar", "Eliminar"); no iconos solos.

## 3. Estructura global y navegación

Cabecera (ya existe) con título y navegación:

```
┌──────────────────────────────────────────────────────────┐
│ Lista de tareas     [Tareas] [Papelera] [Plantillas]     │  <header> + <nav aria-label="Principal">
└──────────────────────────────────────────────────────────┘
```

- `<nav>` con enlaces `routerLink`; el activo lleva `routerLinkActive` + `aria-current="page"` y subrayado (no solo color).
- En este issue solo se activan "Tareas"; "Papelera" y "Plantillas" se añaden en sus issues (no enlazar rutas inexistentes).
- La ruta `/` redirige a `/tasks`.
- Flujo: `/tasks` → "Nueva tarea" → `/tasks/new` → al guardar vuelve a `/tasks`. `/tasks` → "Editar" → `/tasks/:id/edit` → al guardar o "Cancelar" vuelve a `/tasks`. Enlace "Volver a la lista" en el formulario.
- Los errores de la API los muestra el `.alert` global de `app.html` (interceptor); no se duplican en las pantallas.

---

## 4. Pantalla `/tasks` — Lista de tareas (F-01, F-05, F-06)

### Maqueta

```
Tareas                                       [ Nueva tarea ]

Pendientes (2)
┌────────────────────────────────────────────────────────────┐
│ Regar las plantas            [Semanal]                     │
│ Próxima: 1 dic 2026     [Completar] [Editar] [Eliminar]    │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│ Comprar pan                                                │
│                         [Completar] [Editar] [Eliminar]    │
└────────────────────────────────────────────────────────────┘

Completadas (1)
┌────────────────────────────────────────────────────────────┐
│ ~~Pagar el alquiler~~  [Completada] [Mensual]              │
│                                      [Editar] [Eliminar]   │
└────────────────────────────────────────────────────────────┘
```

HTML semántico de ejemplo:

```html
<section aria-labelledby="page-title">
  <div class="page-head">
    <h2 id="page-title">Tareas</h2>
    <a class="btn btn-primary" routerLink="/tasks/new">Nueva tarea</a>
  </div>

  <h3 id="pending-title">Pendientes (2)</h3>
  <ul class="task-list" aria-labelledby="pending-title">
    <li class="task-row">
      <div class="task-main">
        <span class="task-title">Regar las plantas</span>
        <span class="badge badge-info">Semanal</span>
        <span class="task-meta">Próxima: 1 dic 2026</span>
      </div>
      <div class="task-actions">
        <button class="btn btn-primary" type="button" aria-label="Completar: Regar las plantas">Completar</button>
        <a class="btn btn-secondary" routerLink="/tasks/7/edit" aria-label="Editar: Regar las plantas">Editar</a>
        <button class="btn btn-danger" type="button" aria-label="Eliminar: Regar las plantas">Eliminar</button>
      </div>
    </li>
  </ul>

  <h3 id="done-title">Completadas (1)</h3>
  <ul class="task-list" aria-labelledby="done-title">
    <li class="task-row task-done">
      <div class="task-main">
        <span class="task-title">Pagar el alquiler</span>   <!-- text-decoration: line-through; color: --color-text-muted -->
        <span class="badge badge-success">Completada</span>
        <span class="badge badge-info">Mensual</span>
      </div>
      <div class="task-actions">
        <!-- SIN botón Completar -->
        <a class="btn btn-secondary" routerLink="/tasks/3/edit" aria-label="Editar: Pagar el alquiler">Editar</a>
        <button class="btn btn-danger" type="button" aria-label="Eliminar: Pagar el alquiler">Eliminar</button>
      </div>
    </li>
  </ul>
</section>
```

Decisiones:
- Dos grupos con encabezado y contador: "Pendientes" primero (lo accionable), "Completadas" después y atenuadas (texto `--color-text-muted`, tachado + insignia).
- Orden dentro de cada grupo: el que da la API (no hay ordenación en el alcance). Sin filtros ni búsqueda (fuera de alcance).
- "Próxima: <fecha>" solo si `nextOccurrenceDate` no es `null`; formato `d MMM y` en español (`es`).
- Insignia de periodicidad vía pipe `recurrenceLabel`: Diaria, Semanal, Mensual. Sin insignia si no es repetitiva.
- Eliminar usa confirmación ligera (ver textos); va a la papelera (RN-10), por eso el texto no dice "definitivamente".

### Estados

| Estado | Qué se ve |
|---|---|
| Cargando | En lugar de las listas: `<p role="status">Cargando tareas…</p>`. Botón "Nueva tarea" visible. |
| Vacío (sin ninguna tarea) | Tarjeta centrada: "Todavía no tienes tareas." + "Crea la primera para empezar." + botón primario "Crear tarea". |
| Solo un grupo vacío | Si no hay pendientes pero sí completadas: bajo "Pendientes (0)" el texto "No tienes tareas pendientes." Si no hay completadas, el grupo "Completadas" no se muestra. |
| Error de la API | `.alert` global (`role="alert"`) con el mensaje del interceptor; la lista conserva lo último cargado o muestra "No se han podido cargar las tareas." con botón secundario "Reintentar" si la carga inicial falló. |
| Éxito al completar | La tarea pasa a Completadas; si era repetitiva, aparece la nueva ocurrencia en Pendientes. Anuncio `role="status"` (región viva, visualmente oculta): "Tarea completada." o "Tarea completada. Se ha creado la siguiente repetición." |
| Éxito al eliminar | La fila desaparece. Anuncio: "Tarea movida a la papelera." |
| Acción en curso | El botón pulsado queda `disabled` hasta la respuesta; el resto de la fila sigue operativa. |

### Textos exactos

| Elemento | Texto |
|---|---|
| Título de la pantalla | Tareas |
| Botón superior | Nueva tarea |
| Encabezados | Pendientes (n) · Completadas (n) |
| Botones de fila | Completar · Editar · Eliminar |
| Insignias | Completada · Diaria · Semanal · Mensual |
| Metadato | Próxima: 1 dic 2026 |
| Confirmación de eliminar (`confirm` nativo, accesible y sin librerías) | ¿Mover «{título}» a la papelera? Podrás restaurarla desde la papelera. |
| Vacío | Todavía no tienes tareas. / Crea la primera para empezar. / Crear tarea |
| Cargando | Cargando tareas… |
| Error de carga | No se han podido cargar las tareas. / Reintentar |

### Criterios de aceptación cubiertos

| Elemento | Criterio del issue #10 |
|---|---|
| Grupos "Pendientes" y "Completadas" | Con tareas en la API, `/tasks` muestra pendientes y completadas. |
| Botón "Completar" solo en `.task-row` pendientes; nueva ocurrencia en Pendientes | Completar deja la tarea completada y, si es repetitiva, aparece la nueva; en las completadas no hay botón completar. |
| Botón "Eliminar" + confirmación | Al eliminar, la tarea desaparece de la lista. |
| `.alert` global con `role="alert"` | Ante un error de la API se muestra su mensaje. |

---

## 5. Pantallas `/tasks/new` y `/tasks/:id/edit` — Formulario (F-03, F-04)

Un único componente `task-form`: el modo lo decide la presencia de `:id`.

### Maqueta

```
← Volver a la lista

Nueva tarea                       (en edición: "Editar tarea")

Título *
┌──────────────────────────────────────────┐
│                                          │
└──────────────────────────────────────────┘
Error: El título es obligatorio.            ← solo si es inválido y tocado/enviado

[✓] Tarea repetitiva

Periodicidad *                               ← solo visible si "repetitiva" está marcado
┌──────────────────────────┐
│ Semanal                ▾ │
└──────────────────────────┘

[ Guardar ]  [ Cancelar ]
```

HTML semántico de ejemplo:

```html
<a class="back-link" routerLink="/tasks">← Volver a la lista</a>
<h2 id="form-title">Nueva tarea</h2>

<form [formGroup]="form" (ngSubmit)="save()" novalidate aria-labelledby="form-title">
  <div class="field" [class.has-error]="titleInvalid">
    <label for="title">Título <span aria-hidden="true">*</span></label>
    <input id="title" type="text" formControlName="title" maxlength="255" autocomplete="off"
           aria-required="true" [attr.aria-invalid]="titleInvalid"
           [attr.aria-describedby]="titleInvalid ? 'title-error' : null" />
    @if (titleInvalid) {
      <p class="field-error" id="title-error">Error: El título es obligatorio.</p>
    }
  </div>

  <label class="check">
    <input type="checkbox" formControlName="recurring" />
    Tarea repetitiva
  </label>

  @if (form.controls.recurring.value) {
    <div class="field">
      <label for="recurrence">Periodicidad <span aria-hidden="true">*</span></label>
      <select id="recurrence" formControlName="recurrence">
        <option value="daily">Diaria</option>
        <option value="weekly">Semanal</option>
        <option value="monthly">Mensual</option>
      </select>
    </div>
  }

  <div class="form-actions">
    <button class="btn btn-primary" type="submit" [disabled]="saving">Guardar</button>
    <a class="btn btn-secondary" routerLink="/tasks">Cancelar</a>
  </div>
</form>
```

Decisiones:
- Se valida al enviar (y al salir del campo tras tocarlo). Con título vacío **no se envía** y el foco pasa al campo título.
- Al marcar "repetitiva" el selector aparece con "Semanal" preseleccionado (RN-03: repetitiva implica periodicidad, así nunca queda vacío). Al desmarcar, se envía `recurrence: null`.
- `maxlength="255"` (alineado con `Length(max: 255)`). Un título solo con espacios cuenta como vacío (`NotBlank`).
- Si la API devuelve `422`, el interceptor muestra el mensaje en el `.alert` global; no se pintan errores por campo desde la API en esta versión.
- En edición, el selector de categoría de la v0.2 (F-19) **no** se incluye; ver preguntas abiertas.

### Estados

| Estado | Qué se ve |
|---|---|
| Cargando (solo edición) | `<p role="status">Cargando tarea…</p>` en lugar del formulario. |
| Vacío / inicial | Título vacío, check desmarcado. En edición, campos con los valores de la tarea; si tiene recurrencia, check marcado y selector con su valor. |
| Error de validación | Mensaje bajo el campo, borde rojo, `aria-invalid="true"`, foco en el campo. No hay petición. |
| Error de la API | `.alert` global con el mensaje; el formulario conserva lo escrito y se reactiva el botón. En edición, un `404` (tarea inexistente o en la papelera) muestra: "No se ha encontrado la tarea." + enlace "Volver a la lista". |
| Guardando | Botón "Guardar" deshabilitado con el texto "Guardando…". |
| Éxito | Navega a `/tasks` y la lista anuncia: "Tarea creada." o "Tarea guardada." |

### Textos exactos

| Elemento | Texto |
|---|---|
| Títulos | Nueva tarea · Editar tarea |
| Enlace superior | ← Volver a la lista |
| Etiquetas | Título · Tarea repetitiva · Periodicidad |
| Opciones | Diaria · Semanal · Mensual |
| Botones | Guardar · Guardando… · Cancelar |
| Error de título vacío | El título es obligatorio. (mostrado como «Error: El título es obligatorio.») |
| Error de longitud | El título no puede superar los 255 caracteres. |
| Cargando | Cargando tarea… |
| No encontrada | No se ha encontrado la tarea. |

### Criterios de aceptación cubiertos

| Elemento | Criterio del issue #10 |
|---|---|
| Validación y `field-error` con título vacío, sin petición | Al guardar `/tasks/new` con título vacío se ve el error y no se envía. |
| `.alert` global ante `422`/`404`/`5xx` | Ante un error de la API se muestra su mensaje. |
| Check + selector | F-03 / F-04 (periodicidad opcional, RN-03/RN-04). |

---

## 6. Accesibilidad (resumen verificable)

- Un solo `<h1>` (cabecera); cada pantalla usa `<h2>` y los grupos `<h3>`.
- Cada campo tiene `<label for>` visible; el asterisco es `aria-hidden` y el obligatorio se declara con `aria-required="true"`.
- Error de campo: `aria-invalid="true"` + `aria-describedby="title-error"` apuntando al mensaje; el texto incluye "Error:" además del color.
- Aviso global: `role="alert"` (ya existe) con botón de cerrar `aria-label="Cerrar aviso"`.
- Confirmaciones y resultados de acciones (completar, eliminar, guardar): región `role="status"` (`aria-live="polite"`).
- Botones de fila con `aria-label` que incluye el título ("Completar: Regar las plantas"), para distinguirlos con lector de pantalla.
- Orden de tabulación = orden visual: enlaces de cabecera → "Nueva tarea" → filas (Completar, Editar, Eliminar) → formulario: Título → Repetitiva → Periodicidad → Guardar → Cancelar.
- Foco siempre visible (`--focus-ring`); objetivos de 44 px; contraste AA en todos los pares (ver §1).
- Responsive: ancho máximo 48 rem ya existente; por debajo de 36 rem las acciones de fila pasan debajo del título (`flex-wrap`) y los botones del formulario ocupan el ancho completo.

## 7. Notas para el implementador (skill `frontend`)

- Variables y componentes base van en `frontend/src/styles.css`; los estilos específicos de pantalla, en el `.css` de cada componente. Migrar los colores fijos de `app.css` a variables sin cambiar su aspecto.
- Pipe `recurrenceLabel` (ya previsto): `daily`→Diaria, `weekly`→Semanal, `monthly`→Mensual.
- Fecha de "Próxima": `DatePipe` con formato `d MMM y` y locale `es` (registrar `localeEs`).
- Anuncios de estado: un único elemento `role="status"` visualmente oculto (`.sr-only`) alimentado por el servicio de mensajes.

## 8. Preguntas abiertas (no recogido en el análisis)

1. **Categorías (v0.2, F-19):** el análisis §6 dice que el formulario de tarea añadirá un selector de categoría y la lista podría mostrar la categoría. Este diseño no lo incluye porque el issue #10 es de la v0.1. ¿Se diseña en el issue de categorías (#15)?
2. **Aviso de éxito:** el análisis solo describe el aviso de error. ¿Se acepta la región `role="status"` para confirmar acciones, o se prefiere no mostrar nada al completar/eliminar?
3. **Confirmar al eliminar:** el issue no la exige; se propone `confirm` nativo porque la acción afecta al usuario aunque sea recuperable. ¿Se mantiene o se elimina para ahorrar un clic, dado que existe la papelera?
4. **Ordenación:** se asume el orden de la API. ¿Conviene ordenar por fecha de creación o por próxima ocurrencia? (requeriría ampliar el análisis).
