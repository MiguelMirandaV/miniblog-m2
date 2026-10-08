# Contrato HTTP de MiniBlog

## Estado de esta etapa

Los once endpoints funcionan con arrays en memoria. El servidor todavía no consulta PostgreSQL: las altas, cambios y borrados de la API se pierden al reiniciarlo. La siguiente etapa sustituirá estos arrays por SQL conservando el contrato HTTP.

URL local: `http://localhost:3000`. Envía los cuerpos con `Content-Type: application/json`.

## Endpoints

| Método | Ruta | Respuesta correcta |
|---|---|---|
| GET | /authors | 200, array de autores |
| GET | /authors/:id | 200, objeto autor |
| POST | /authors | 201, autor creado y cabecera Location |
| PUT | /authors/:id | 200, autor actualizado |
| DELETE | /authors/:id | 204, sin cuerpo; elimina también sus posts |
| GET | /posts | 200, array de posts |
| GET | /posts/:id | 200, objeto post |
| GET | /posts/author/:authorId | 200, array de posts con un objeto author en cada resultado |
| POST | /posts | 201, post creado y cabecera Location |
| PUT | /posts/:id | 200, post actualizado |
| DELETE | /posts/:id | 204, sin cuerpo |

Un autor existente sin posts produce `200` y `[]` en la consulta por autor. Si el autor solicitado no existe, produce `404`.

## Autores

POST y PUT reciben:

```json
{
  "name": "Laura Pérez",
  "email": "laura@example.com",
  "bio": "Aprendiendo backend"
}
```

- `name`: texto obligatorio, no vacío, hasta 100 caracteres.
- `email`: texto obligatorio, formato básico válido, hasta 150 caracteres después de normalizar; único sin distinguir mayúsculas.
- `bio`: texto opcional o null; omitirlo equivale a null.
- `id` y `created_at`: los genera el servidor y no se aceptan en el cuerpo de entrada.

Se recortan espacios exteriores de los textos y se convierte el email a minúsculas. No se aceptan campos desconocidos ni el carácter nulo de texto.

## Posts

POST y PUT reciben:

```json
{
  "author_id": 1,
  "title": "Mi primera publicación",
  "content": "Estoy aprendiendo a construir una API.",
  "published": false
}
```

- `author_id`: número entero positivo correspondiente a un autor existente. Una cadena como `"1"` se rechaza.
- `title`: texto obligatorio no vacío, hasta 200 caracteres.
- `content`: texto obligatorio no vacío.
- `published`: booleano opcional; si se omite, vale false. Las cadenas `"true"` y `"false"` se rechazan.
- `id` y `created_at`: generados por el servidor, no editables.

## Semántica de PUT

PUT reemplaza todos los campos editables de la entidad. Deben enviarse los mismos campos obligatorios que en POST. Los opcionales omitidos recuperan su valor por defecto: bio=null o published=false. Se conservan id y created_at. No se implementa PATCH.

## Errores

Los errores tienen un formato consistente:

```json
{
  "error": "Autor no encontrado.",
  "status": 404
}
```

| Código | Uso |
|---|---|
| 400 | Campos, tipos o IDs inválidos; email duplicado; referencia a autor inexistente al escribir un post; JSON mal formado |
| 404 | Recurso o ruta inexistente |
| 413 | Cuerpo que supera el límite de 100 KB |
| 500 | Error inesperado, con mensaje genérico sin stack ni credenciales |

Los IDs de ruta admiten solo dígitos que representen enteros de 1 a 2147483647, compatibles con INTEGER de PostgreSQL. `abc`, `1abc`, `0`, `-1` y `1.5` producen 400. Un ID válido sin registro produce 404.

## Recorrido manual

Con `npm run dev` ejecutándose en una terminal, usa otra para estas peticiones:

```bash
curl -i http://localhost:3000/authors

curl -i -X POST http://localhost:3000/authors \
  -H 'Content-Type: application/json' \
  -d '{"name":"Laura Pérez","email":"laura@example.com","bio":"Aprendiendo backend"}'

curl -i -X POST http://localhost:3000/posts \
  -H 'Content-Type: application/json' \
  -d '{"author_id":1,"title":"Mi primera publicación","content":"Estoy aprendiendo a construir una API.","published":false}'

curl -i http://localhost:3000/posts/author/1

curl -i http://localhost:3000/authors/abc
```

Respuestas esperadas, en orden: 200, 201, 201, 200 y 400. Si repites la creación de Laura dentro de la misma sesión del servidor, el email duplicado produce 400: es una validación esperada.

Los ejemplos usan al autor 1 de los arrays iniciales. En la etapa con persistencia, toma el ID de los recursos existentes o del resultado de una creación; no supongas que las secuencias siempre empiezan en 1.

## Organización del código

```text
Petición HTTP → ruta → validación → servicio → array temporal
                         ↓             ↓
                     middleware de errores → respuesta JSON
```

Las rutas seleccionan la operación y el código HTTP. Los validadores comprueban y normalizan entradas. Los servicios gestionan los recursos y sus relaciones. El middleware final unifica los errores. En Express 5, los errores de handlers async llegan automáticamente al manejador de errores.

Referencia: [manejo de errores de Express 5](https://expressjs.com/en/guide/error-handling.html).
