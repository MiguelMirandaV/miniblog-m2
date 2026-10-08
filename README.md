# MiniBlog API — Proyecto Integrador M2

API REST para gestionar autores y publicaciones, desarrollada con Node.js, Express y PostgreSQL como proyecto integrador del Módulo 2 de Henry.

## Estado del proyecto

En desarrollo: los once endpoints CRUD funcionan con arrays en memoria. También están disponibles el esquema SQL, seed y verificación real de base de datos. La API todavía no utiliza PostgreSQL: al reiniciar el servidor se pierden sus cambios. La persistencia HTTP, los tests unitarios/HTTP y el despliegue se completarán en las siguientes etapas.

## Tecnologías

- Node.js 24 y npm 11.
- Express 5 para el servidor HTTP.
- PostgreSQL 17 y `pg` para persistencia mediante SQL directo.
- Vitest y Supertest para pruebas automatizadas.
- GitHub para versionado y Railway para el despliegue previsto.

Las versiones exactas de las dependencias se conservan en `package-lock.json`.

## Instalación local

Requisitos: Node.js 24, npm, Git y PostgreSQL 17 funcionando.

```bash
git clone https://github.com/MiguelMirandaV/miniblog-m2.git
cd miniblog-m2
npm ci
cp .env.example .env
```

Crea el rol y las bases, configura tu `.env` y sigue los comandos de [preparación de PostgreSQL](docs/base-de-datos.md#preparación-local-desde-cero). Luego:

```bash
npm run db:setup
npm run db:seed
npm run db:verify
npm run dev
```

El servidor escucha en `http://localhost:3000`. Prueba `GET /authors` o `GET /posts`. La raíz `/` devuelve 404 porque no corresponde a un recurso de la API.

Las URLs de `.env.example` contienen marcadores de posición. Configura tus credenciales únicamente en `.env`. Por ahora los scripts SQL utilizan PostgreSQL y los servicios HTTP utilizan arrays independientes.

## Variables de entorno

| Variable | Uso |
|---|---|
| `NODE_ENV` | Ambiente de ejecución; desarrollo local o producción |
| `PORT` | Puerto HTTP; por defecto 3000 |
| `DATABASE_URL` | Conexión PostgreSQL; se configurará localmente, sin publicarla |
| `TEST_DATABASE_URL` | Conexión separada a miniblog_test, solo para comprobaciones locales |

`.env.example` contiene ejemplos sin credenciales reales. `.env` está excluido de Git. En Railway las variables se configurarán en el servicio correspondiente.

## Comandos

| Comando | Función |
|---|---|
| `npm run dev` | Arranca el servidor y lo reinicia al guardar cambios |
| `npm start` | Arranca el servidor sin observar cambios |
| `npm test` | Ejecuta Vitest una vez; los casos se añadirán en la etapa de testing |
| `npm run test:watch` | Ejecuta Vitest en modo observación |
| `npm run db:setup` | Crea tablas e índice en DATABASE_URL, sin borrar datos |
| `npm run db:seed` | Inserta ejemplos ficticios sin duplicarlos en ejecuciones sucesivas |
| `npm run db:verify` | Comprueba CRUD y restricciones en miniblog_test |

Actualmente `npm test` informa que no hay archivos de pruebas. No se considera una suite aprobada hasta que existan y pasen casos reales.

## Organización

```text
src/
  app.js           Configura Express y exporta la aplicación
  server.js        Inicia el servidor HTTP
  routes/          Rutas y respuestas HTTP
  services/        Operaciones de autores/posts y consultas parametrizadas
  db/              Arrays temporales; después contendrá el pool de PostgreSQL
  validators/      Validaciones reutilizables de entrada
  middlewares/     Manejo común de peticiones y errores
sql/               Scripts de creación y datos iniciales
scripts/           Ejecución de SQL y comprobación de base de datos
tests/             Pruebas unitarias y HTTP
docs/              Documentación y registro de uso de IA
```

Los archivos `.gitkeep` conservan temporalmente las carpetas que todavía están vacías.

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

## Documentación y entrega pendientes

- Conectar los servicios CRUD a PostgreSQL y manejar sus errores.
- Tests unitarios y HTTP.
- Archivo OpenAPI y visualización de la documentación.
- Guía de Railway, URL pública y evidencia de funcionamiento.

## Uso de IA

El desarrollo cuenta con asistencia de IA y revisión mediante comprobaciones reales. Los prompts relevantes, decisiones y verificaciones se registran en [docs/uso-ia.md](docs/uso-ia.md).

## Datos y credenciales

Se usarán exclusivamente datos ficticios para la demostración. La API requerida no incluye autenticación. Nunca deben publicarse archivos `.env`, tokens, contraseñas ni URLs de PostgreSQL que contengan credenciales.
