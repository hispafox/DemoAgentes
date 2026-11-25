---
name: pruebas
description: >-
  Escribe, ejecuta y revisa los tests PHPUnit del backend de DemoAgentes (Lista
  de Tareas) a partir del plan de tests de docs/analisis.md (§8) y de los
  criterios de aceptación del issue: unitarios en backend/tests/Unit
  (entidades, servicios, calculadores) y funcionales en backend/tests/Functional
  (endpoints y repositorios). Modo "crear": escribe los tests que cubren un
  issue y los ejecuta. Modo "ejecutar": lanza las suites e interpreta el
  resultado. Modo "revisar": cruza criterios de aceptación, reglas RN y tests,
  y avisa de lo que no está cubierto, sin tocar nada. Úsalo siempre que se
  hable de tests, PHPUnit, cobertura, criterios de aceptación o de abrir una PR,
  aunque el usuario no nombre el skill.
---

# Pruebas

Los tests demuestran que el código cumple lo que dicen el análisis y el issue. Sus fuentes de verdad son `docs/analisis.md` §8 "Plan de tests" (qué clase de test cubre cada regla) y los **criterios de aceptación** del issue (Dado/Cuando/Entonces). El CLAUDE.md exige cubrir cada criterio con al menos un test y no abrir una PR con tests en rojo.

Elige el modo según el argumento:
- `crear` → **Modo crear**
- `ejecutar` → **Modo ejecutar**
- `revisar` o sin argumento → **Modo revisar**

---

## Lugar en la orquestación de skills

```
analisis-diseno ──► modelo ──► dto ──► servicio ──► api ──► frontend ──► pruebas ──► commit y PR
                                                                        (este skill)
```

Aunque va al final de la cadena, se puede usar en cuanto exista cada tramo: los tests de entidad, después de `modelo`; los del servicio, después de `servicio`; y los funcionales, después de `api`.

| | |
|---|---|
| **Lee** | `docs/analisis.md` §8 (plan de tests) y §4-§5 (contrato y lógica); criterios de aceptación del issue (`gh issue view <nº>`); reglas RN de `docs/app/lista-de-tareas.md`; el código que prueba |
| **Escribe** | `backend/tests/Unit/` y `backend/tests/Functional/` |
| **No toca** | Código de producción. Si un test descubre un fallo, lo dice y propone el arreglo con el skill del tramo correspondiente; no lo arregla por su cuenta ni debilita el test para que pase |
| **Prerrequisito** | Existe el código que se prueba y el comportamiento esperado está en el análisis o en el issue. Si un caso no está definido, el skill **se detiene** y lo pregunta (`/analisis-diseno revisar`) |
| **Verificación mínima** | Las dos suites en verde (`Unit` y `Functional`) |
| **Entregable** | Los tests del issue en verde, con una tabla criterio de aceptación / regla RN → test |

---

## 0. Antes de tocar nada

1. **Lee** el CLAUDE.md, la sección 8 del análisis, el issue y el código que vas a probar.
2. **Issue y rama:** los tests van en la rama del issue (`feature/<nº>-descripcion`), junto al código que prueban.
3. **Estado del repositorio:** `git status --short`. No mezcles cambios ajenos.

---

## Modo crear

1. **Inventario:** lista los criterios de aceptación del issue y las filas de §8 que le afectan, y busca qué tests existen ya (`grep -rn "RN-0" backend/tests`).
2. **Tabla de cobertura** antes de escribir: cada criterio y cada regla, con el test que la cubrirá. Un criterio sin test no se da por cubierto.
3. **Escribe los tests** según las convenciones de abajo.
4. **Ejecuta** las dos suites (ver "Ejecución"). Si un test falla:
   - Si el test está mal (expectativa equivocada respecto al análisis), corrígelo.
   - Si el código está mal, **detente**: explica el fallo y propón el arreglo con el skill del tramo (`servicio`, `api`…).
5. **Entrega.**

## Modo ejecutar

Lanza las suites (ver "Ejecución") y resume: total de tests, fallos con su causa y tiempo. Si tarda mucho o parece colgado, revisa "Problemas conocidos" antes de tocar el código.

## Modo revisar

Solo lee y compara. Devuelve:

| Criterio / regla | Test que lo cubre | Estado |
|---|---|---|

con estado `cubierto`, `sin test` o `test sin ejecutar`, y termina proponiendo `crear` para los huecos, sin aplicarlo.

---

## Convenciones

**Nombres** (CLAUDE.md): una clase `<Clase>Test` por clase probada, un método `test<Comportamiento>` por caso, en inglés y descriptivo (`testCreatingARecurringTaskSetsTheNextOccurrenceToTodayPlusTheRecurrence`). Encima de cada método, un comentario con la regla o el criterio: `// RN-18` o `// CA: título vacío → 422`.

**Unitarios** (`tests/Unit/`, `PHPUnit\Framework\TestCase`):
- Entidades: `tests/Unit/Entity/<Entidad>Test.php`. Sin base de datos ni contenedor.
- Servicios: `tests/Unit/Service/<Servicio>Test.php`. Las dependencias se simulan: `createMock(EntityManagerInterface::class)` para comprobar `persist()` y `flush()`, `createStub()` para los repositorios y `new MockClock('2026-11-25 10:00:00')` para fijar la fecha.
- Calculadores y clases puras: sin dobles, con casos límite (fin de mes, años bisiestos).
- Fechas siempre fijas: nunca `new \DateTimeImmutable()` sin argumento en un test.

**Funcionales** (`tests/Functional/`, `Symfony\Bundle\FrameworkBundle\Test\WebTestCase`):
- Endpoints: `tests/Functional/Controller/<Controlador>Test.php`. Peticiones reales con `self::createClient()` y JSON en el cuerpo (`$client->jsonRequest('POST', '/api/tasks', [...])`).
- Comprueban código de estado, cabeceras (`Location`, `Content-Type`) y cuerpo (`json_decode` con `JSON_THROW_ON_ERROR`).
- La base de datos de test (`var/test.db`) se recrea en cada ejecución con las migraciones, y DAMA deshace los cambios de cada test: cada test prepara sus propios datos, normalmente con la propia API.
- Para fijar la fecha en un test funcional, usa `Symfony\Component\Clock\Test\ClockSensitiveTrait` y `self::mockTime('2026-11-25 10:00:00')` antes de crear el cliente.
- Repositorios con consultas propias: `tests/Functional/Repository/<Repositorio>Test.php`, con `KernelTestCase`.

**Cada criterio de aceptación** del issue tiene al menos un test, y cada regla RN que toque el issue, su camino feliz y su error.

## Ejecución

Desde la raíz del repositorio:

```powershell
.\scripts\backend-test.ps1
```

O por suites, desde `backend/`:

```bash
php bin/phpunit --testsuite Unit
php bin/phpunit --testsuite Functional
php bin/phpunit --filter TaskServiceTest     # una clase o un método
```

## Problemas conocidos

- **PHPUnit "colgado" en Windows** (bitácora, pasos 31 y 42): era el antivirus escaneando los miles de ficheros de `vendor/` con el disco saturado. La solución es una exclusión de Defender para la carpeta del repositorio. Si vuelve a pasar, lanza con `--debug` y la salida a un fichero para ver dónde se para, y comprueba que no quedan procesos `php.exe` vivos de ejecuciones anteriores.
- La línea `[error] Uncaught ... NotFoundHttpException` en la consola viene del logger de Symfony en el test de humo de un `404`: no es un fallo.

## Entrega

1. Tabla criterio de aceptación / regla RN → test, y el resultado de las dos suites (número de tests y tiempo).
2. Si un test descubrió un fallo del código, explícalo y di con qué skill se arregla.
3. Registra el paso con `bitacora` y haz commit con `mensaje-commit` (`test: … (#<nº>)`). Con todo en verde, la PR puede abrirse con `Closes #<nº>` y el resumen de tests.
