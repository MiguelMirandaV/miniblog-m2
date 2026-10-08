# MiniBlog API — Proyecto Integrador M2

API REST para gestionar autores y publicaciones, desarrollada con Node.js, Express y PostgreSQL como proyecto integrador del Módulo 2 de Henry.

## Estado del proyecto

Proyecto terminado dentro del alcance obligatorio. Los once endpoints CRUD utilizan PostgreSQL mediante consultas parametrizadas. Están disponibles el esquema SQL, seed, 96 pruebas unitarias y de integración HTTP, OpenAPI y Swagger UI. La API está desplegada en Railway. Consulta el [informe de entrega y auditoría final](docs/entrega.md) para revisar la evidencia de cada etapa.

- [API pública: autores](https://miniblog-m2-production.up.railway.app/authors).
- [Swagger UI público](https://miniblog-m2-production.up.railway.app/docs/).
- [Contrato OpenAPI público](https://miniblog-m2-production.up.railway.app/openapi.json).

## Tecnologías

- Node.js 24 y npm 11.
- Express 5 para el servidor HTTP.
- PostgreSQL 17 y `pg` para persistencia mediante SQL directo.
- Vitest y Supertest para pruebas automatizadas.
- GitHub para versionado y Railway para el despliegue.

Las versiones exactas de las dependencias se conservan en `package-lock.json`.

## Instalación local

Requisitos: Node.js 24, npm, Git y PostgreSQL 17 funcionando.

```bash
git clone https://github.com/MiguelMirandaV/miniblog-m2.git
cd miniblog-m2
npm ci
cp -n .env.example .env
```

El comando `cp -n` conserva un `.env` que ya exista. Crea el rol y las bases, configura tu `.env` y sigue los comandos de [preparación de PostgreSQL](docs/base-de-datos.md#preparación-local-desde-cero). Luego:

```bash
npm run db:setup
npm run db:seed
npm run db:verify
npm run dev
```

El servidor escucha en `http://localhost:3000`. Prueba `GET /authors` o `GET /posts`. La raíz `/` devuelve 404 porque no corresponde a un recurso de la API.

Las URLs de `.env.example` contienen marcadores de posición. Configura tus credenciales únicamente en `.env`. La API y los scripts de preparación utilizan DATABASE_URL. Las comprobaciones locales de SQL utilizan exclusivamente TEST_DATABASE_URL.

## Variables de entorno

| Variable | Uso |
|---|---|
| `NODE_ENV` | Ambiente de ejecución; desarrollo local o producción |
| `PORT` | Puerto HTTP; por defecto 3000 |
| `DATABASE_URL` | Conexión PostgreSQL utilizada por la API y los scripts de preparación |
| `TEST_DATABASE_URL` | Conexión separada a miniblog_test, solo para comprobaciones locales |

`.env.example` contiene ejemplos sin credenciales reales. `.env` está excluido de Git. En Railway las variables están configuradas en el servicio correspondiente; DATABASE_URL referencia la conexión del servicio Postgres.

## Comandos

| Comando | Función |
|---|---|
| `npm run dev` | Arranca el servidor y lo reinicia al guardar cambios |
| `npm start` | Arranca el servidor sin observar cambios |
| `npm test` | Ejecuta las 96 pruebas unitarias y de integración una vez |
| `npm run test:watch` | Ejecuta Vitest en modo observación |
| `npm run test:unit` | Ejecuta solo los tests unitarios, sin PostgreSQL |
| `npm run test:integration` | Ejecuta HTTP y SQL real sobre miniblog_test |
| `npm run db:setup` | Crea tablas e índice en DATABASE_URL, sin borrar datos |
| `npm run db:seed` | Inserta ejemplos ficticios sin duplicarlos en ejecuciones sucesivas |
| `npm run db:verify` | Comprueba CRUD y restricciones en miniblog_test |
| `npm run docs:validate` | Valida la estructura y referencias de OpenAPI |

Para ejecutar toda la suite, PostgreSQL debe estar activo y TEST_DATABASE_URL configurada. No hace falta arrancar la API con `npm run dev`: Supertest utiliza puertos temporales. Los tests crean y eliminan sus propios registros exclusivamente en `miniblog_test`. Consulta la [guía de pruebas, aislamiento y diagnóstico](docs/testing.md).

## Organización

```text
src/
  app.js           Configura Express y exporta la aplicación
  server.js        Inicia el servidor HTTP
  routes/          Rutas y respuestas HTTP
  services/        Operaciones de autores/posts y consultas parametrizadas
  db/              Pool compartido de conexiones a PostgreSQL
  validators/      Validaciones reutilizables de entrada
  middlewares/     Manejo común de peticiones y errores
sql/               Scripts de creación y datos iniciales
scripts/           Ejecución de SQL y comprobación de base de datos
tests/             Pruebas unitarias y HTTP
docs/              OpenAPI, Swagger UI, guías y registro de uso de IA
```

`vitest.config.js` configura la ejecución de los tests en Node.js; las pruebas de integración usan una base local separada.

## Endpoints disponibles

- `/authors`: GET y POST.
- `/authors/:id`: GET, PUT y DELETE.
- `/posts`: GET y POST.
- `/posts/:id`: GET, PUT y DELETE.
- `/posts/author/:authorId`: GET de publicaciones con detalle de su autor.

La entidad se llama `authors` en toda la aplicación. La referencia a `users.id` que aparece en un punto de la consigna se interpreta como `authors.id`, de acuerdo con el modelo y el SQL de la guía.

Consulta el [contrato HTTP, validaciones y ejemplos curl](docs/api.md). PUT reemplaza los campos editables completos; DELETE responde 204 sin cuerpo. Los errores utilizan `{ "error": "mensaje", "status": 400 }`, con el código correspondiente a cada caso.

## Base de datos

Un autor puede tener varios posts; cada post pertenece a un autor existente. Eliminar un autor elimina sus posts mediante ON DELETE CASCADE. Los emails se almacenan en minúsculas y sin espacios exteriores para mantener la unicidad. Consulta el [modelo, las reglas y las verificaciones SQL](docs/base-de-datos.md).

## Documentación OpenAPI

Con la API ejecutándose, abre [Swagger UI local](http://localhost:3000/docs/). Expande GET /authors, pulsa Try it out y Execute para consultar datos reales. El contrato está en [docs/openapi.json](docs/openapi.json) y se publica también en `/openapi.json`.

```bash
npm run docs:validate
```

Consulta el [recorrido de Swagger UI y explicación del contrato](docs/openapi.md). Los ejemplos usan IDs ilustrativos; utiliza los devueltos por la API. Las operaciones de escritura ejecutadas desde Swagger UI modifican la base conectada.

## Despliegue en Railway

Sigue la [guía de despliegue](docs/railway.md): conectar el repositorio, añadir PostgreSQL, definir la referencia interna DATABASE_URL, preparar tablas/seed y arrancar con `npm start`. La guía distingue la URL privada de base de datos de la URL HTTPS pública para consultar la API.

El servicio público utiliza PostgreSQL remoto, independiente de la base local. La raíz `/` responde 404 por diseño; utiliza `/authors`, `/posts` o `/docs/` para explorar la API.

Verificado el 8 de octubre de 2026: 26 peticiones HTTPS comprobaron los once endpoints, CRUD, validaciones, relación por autor y cascada. Un autor y su post conservaron todos sus campos y fechas después de un nuevo despliegue; al terminar se eliminaron los recursos temporales propios. Quedaron los tres autores y cinco posts ficticios del seed. `/docs/` y `/openapi.json` también respondieron 200.

## Versionado y entrega

Antes de guardar cambios, revisa `git status` y `git diff`. Añade solo archivos del proyecto, crea commits pequeños y descriptivos y publica la rama main. Comprueba en GitHub que el último commit esté disponible. `.env`, node_modules y logs no forman parte de la entrega.

La entrega consiste en este repositorio público, el archivo OpenAPI, las instrucciones reproducibles y los enlaces públicos indicados arriba. Las pruebas se ejecutan con `npm test`; el contrato, con `npm run docs:validate`.

## Uso de IA

El desarrollo cuenta con asistencia de IA y revisión mediante comprobaciones reales. Los prompts relevantes, decisiones y verificaciones se registran en [docs/uso-ia.md](docs/uso-ia.md).

## Datos y credenciales

Se utilizan exclusivamente datos ficticios para la demostración. La API requerida no incluye autenticación. Nunca deben publicarse archivos `.env`, tokens, contraseñas ni URLs de PostgreSQL que contengan credenciales.
