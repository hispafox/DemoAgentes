# Generador de presentaciones

Convierte los guiones del agente `presentador` (`docs/presentaciones/*.md`) en ficheros `.pptx` con el mismo diseño. Se usó para las tres presentaciones de la clase del 2026-11-26 (bitácora, pasos 65 a 67).

## Uso

Desde la raíz del repositorio:

```powershell
.\scripts\presentaciones-generar.ps1
```

```powershell
.\scripts\presentaciones-generar.ps1 -Solo bitacora
```

La primera vez instala [pptxgenjs](https://github.com/gitbrent/PptxGenJS) (licencia MIT) en `scripts/presentaciones/node_modules/`, que no se sube a Git. Hace falta Node.js.

## Ficheros

| Fichero | Qué hace |
|---|---|
| `generar.js` | Lee un guion en Markdown y genera el `.pptx`. Cada diapositiva usa la plantilla de su línea `Visual:` |
| `corta.js` | La presentación corta de 10 diapositivas, con el contenido escrito a mano |
| `config/*.json` | Portada, etiquetas y, en la de la bitácora, el anexo (`annexFrom`) |
| `capturas.js` | Saca capturas PNG de la app con Edge sin ventana; puede pulsar un botón antes (por ejemplo, "Guardar" para ver un error) |
| `exportar-imagenes.ps1` | Exporta cada diapositiva a PNG con PowerPoint, para revisarlas |
| `../presentaciones-generar.ps1` | Genera las tres presentaciones de una vez |

## Formato del guion que entiende `generar.js`

```markdown
# Sección 1. Título de la sección (pasos 1 a 15)

## Diapositiva 1. Título de una línea (45 caracteres como máximo)

- De 3 a 5 puntos, con `código` entre comillas invertidas.

Visual: tabla
| Columna | Otra |
|---|---|
| … | … |

**Notas del orador:** lo que se dice en esta diapositiva.
```

| `Visual:` | Plantilla |
|---|---|
| `ninguno` | Separadora de sección (fondo oscuro y número grande); el rango "(pasos …)" del título de la sección pasa a la etiqueta |
| `tabla` | Tabla Markdown debajo de los puntos |
| `diagrama — `` `A → B → C` `` | Cajas con flechas, en una o dos filas; un nodo `[entre corchetes]` sale resaltado |
| `cifras — `` `95` `` tests · `` `267` `` aserciones` | De 2 a 4 cifras grandes |
| `código — descripción:` | Bloque de código real a continuación (máximo 10 o 12 líneas) |
| `captura` | Las dos capturas recortadas de `docs/presentaciones/img/` |

Los puntos que no caben (en diapositivas de código o de tablas largas se muestran 3) pasan a las notas del orador.

## Revisión

Después de generar, conviene exportar a imágenes y revisarlas: títulos partidos, tablas que se salen o código demasiado pequeño.

```powershell
.\scripts\presentaciones\exportar-imagenes.ps1 -Deck "$PWD\docs\presentaciones\2026-11-26-bitacora.pptx" -OutDir "$env:TEMP\revision-pptx"
```
