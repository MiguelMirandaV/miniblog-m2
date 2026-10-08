# Pruebas automatizadas

## Ejecutar

Desde la raíz del proyecto, con Node.js 24 y las dependencias instaladas mediante `npm ci`:

```bash
npm test
```

Ejecuta toda la suite una vez y termina con código 0 si pasa. Un fallo devuelve un código distinto de cero; no debe ignorarse al preparar la entrega. La suite actual contiene 96 casos en cuatro archivos: 65 unitarios y 31 de integración HTTP.

También puedes ejecutar cada grupo o mantener Vitest observando cambios:

```bash
npm run test:unit
npm run test:integration
npm run test:watch
```

Las pruebas unitarias no requieren PostgreSQL ni `.env`. Para integración, PostgreSQL debe estar funcionando, el rol debe tener acceso a la base local `miniblog_test` y TEST_DATABASE_URL debe estar configurada en `.env` o en el entorno. Consulta la [preparación de PostgreSQL](base-de-datos.md#preparación-local-desde-cero).

No necesitas ejecutar `npm run dev`: Supertest utiliza `app.js` y abre puertos temporales, por lo que no compite con el puerto 3000. Puedes mantener tu servidor de desarrollo abierto en otra terminal. Sal del modo watch con Ctrl+C.

## Qué comprueba cada archivo

| Archivo | Tipo | Comportamientos |
|---|---|---|
| tests/unit/validators.test.js | Unitario | Tipos, campos obligatorios, normalización, límites Unicode, IDs y published:false |
| tests/unit/services.test.js | Unitario con mock de pg | Recursos inexistentes, autor sin posts, transformación del JOIN, separación de SQL y valores, propagación de errores |
| tests/unit/test-database.test.js | Unitario | Rechazo de bases remotas, base de aplicación, URLs inválidas y parámetros que podrían cambiar el destino |
| tests/integration/api.test.js | Integración HTTP y SQL real | Los once endpoints, CRUD, Location, fechas, PUT completo, 204 sin cuerpo, relación por autor, unicidad, cascada y errores |

La integración incluye creación y consulta de autores, creación de posts y eliminación de recursos inexistentes, los casos mínimos de la guía. También comprueba duplicados simultáneos, que una actualización rechazada no cambie los datos, un texto con sintaxis SQL guardado literalmente y respuestas 400/404/413/500. Solo el caso de fallo interno sustituye temporalmente una consulta para provocar un 500; el resto usa PostgreSQL real.

## Cómo leer un test

Los casos siguen preparar → ejecutar → comprobar. Este ejemplo del archivo de integración consulta los posts del autor creado para el caso:

```js
const response = await request(app).get(`/posts/author/${author.id}`);
expect(response.status).toBe(200);
expect(response.body).toEqual([]);
```

`request(app)` envía una petición HTTP con Supertest. `expect` expresa el resultado requerido. Vitest ejecuta el caso y muestra cuál expectativa falló. Aquí se comprueba que un autor existente sin publicaciones obtiene una lista vacía; otro caso comprueba que un autor inexistente obtiene 404.

En las pruebas unitarias de servicios, `vi.mock` sustituye el pool por una dependencia controlada. Permite comprobar decisiones del servicio sin instalar ni iniciar PostgreSQL. Estas pruebas no demuestran por sí solas que SQL funcione: esa evidencia la aporta la integración real.

## Aislamiento de datos

Antes de importar la aplicación, la integración carga `.env`, valida TEST_DATABASE_URL y la asigna a DATABASE_URL solo dentro del proceso de pruebas. No reescribe `.env` ni cambia la conexión del servidor de desarrollo.

La guarda permite únicamente PostgreSQL en localhost/127.0.0.1/::1, base `miniblog_test`, separada de DATABASE_URL y sin parámetros de URL. Si falta la configuración o el destino no cumple esas condiciones, la suite falla antes de importar el pool; no utiliza la base principal como alternativa.

La integración aplica `sql/setup.sql` en la base de pruebas, pero no ejecuta seed. Cada caso prepara sus propios autores con emails aleatorios y obtiene los IDs generados. Al terminar, elimina exclusivamente esos autores; ON DELETE CASCADE elimina sus posts. No ejecuta TRUNCATE, DROP ni reinicia secuencias. Los datos anteriores se conservan y los IDs pueden tener saltos.

Los casos se ejecutan secuencialmente. El pool se cierra en afterAll y los mocks se restauran antes de limpiar. Una terminación forzada del proceso puede impedir la limpieza; estos tests no prometen limpieza después de SIGKILL.

## Diagnóstico

- **No se pudo preparar miniblog_test:** comprueba que PostgreSQL esté activo y revisa TEST_DATABASE_URL localmente; no publiques su contenido.
- **Los tests requieren la base local separada:** corrige el destino de pruebas. No cambies la guarda para apuntar a Railway o a `miniblog`.
- **Una expectativa falla:** lee el archivo, nombre del caso y diferencia entre resultado esperado/recibido. Primero determina si el problema está en la aplicación, los datos de preparación o el propio test.
- **Watch no termina:** es el comportamiento esperado; usa Ctrl+C o `npm test` para una ejecución única.

`npm run db:verify` sigue disponible para comprobar setup/seed y restricciones SQL en una transacción revertida. Complementa la suite y no necesita ejecutarse cada vez que se modifica un test unitario.

El resultado aprobado no equivale a cobertura del 100%, auditoría de seguridad ni prueba del despliegue. Las pruebas de arranque/reinicio del paso de persistencia se ejecutaron como comprobaciones separadas; Railway se verificará en su propia etapa.

## Referencias

- [Preparación y limpieza en Vitest](https://main.vitest.dev/guide/learn/setup-teardown).
- [Supertest](https://github.com/forwardemail/supertest).
