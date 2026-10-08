# Consultar y probar la documentación

El contrato está en [openapi.json](openapi.json), formato OpenAPI 3.0.3. Describe los once endpoints obligatorios, cuerpos de entrada, modelos de respuesta, parámetros, códigos HTTP y ejemplos ficticios.

## Abrir Swagger UI

Con PostgreSQL preparado y la aplicación ejecutándose mediante `npm run dev` o `npm start`, abre:

- Interfaz: http://localhost:3000/docs/
- Archivo JSON: http://localhost:3000/openapi.json

Si cambias PORT, utiliza ese puerto en ambas direcciones. Los recursos de Swagger UI se sirven desde el proyecto; no requiere CDN, extensión de VS Code ni una cuenta adicional.

1. Expande **GET /authors**.
2. Pulsa **Try it out** y después **Execute**.
3. Comprueba **Server response → Code 200** y la lista real en **Response body**.
4. Toma el ID de un autor y úsalo en **GET /posts/author/{authorId}** para consultar sus publicaciones y el detalle del autor.

**Example Value** muestra un ejemplo del contrato; **Server response** muestra el resultado real de una petición. No confundas los IDs ilustrativos del ejemplo con los registros que existen en tu base.

POST, PUT y DELETE ejecutados aquí modifican los datos de la base conectada a la API. Para explorar utiliza GET; para demostrar escrituras usa datos ficticios propios. Al crear un autor, emplea un email nuevo; un duplicado produce 400. PUT exige el cuerpo completo y DELETE de autor elimina también sus posts.

## Validar el contrato

```bash
npm run docs:validate
```

Resultado esperado:

```text
OpenAPI 3.0.3 válido: 11 operaciones documentadas.
```

Este comando comprueba la estructura OpenAPI y sus referencias internas con Swagger Parser. No requiere PostgreSQL ni iniciar el servidor y no sustituye los tests de comportamiento. Al modificar una ruta, actualiza el contrato y ejecuta también `npm test`.

Los esquemas `AuthorInput` y `PostInput` describen entradas editables. `Author` y `Post` incluyen ID y fecha generados por la base. `PostWithAuthor` añade el autor anidado para la consulta por relación. `Error` conserva `{error, status}`. DELETE 204 no declara contenido de respuesta.

La URL de servidor es `/`: Swagger UI envía peticiones al mismo origen donde está publicada. Esto permite usar el mismo archivo localmente y en Railway sin introducir credenciales ni un dominio de producción inventado. Si importas el JSON en otra herramienta, configura allí la URL base del entorno que quieras consultar.

Referencias: [OpenAPI 3.0.3](https://spec.openapis.org/oas/v3.0.3.html), [Swagger UI](https://swagger.io/docs/open-source-tools/swagger-ui/usage/installation/) y [Swagger Parser](https://apidevtools.com/swagger-parser/).
