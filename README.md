# MiniBlog API — Proyecto Integrador M2

API REST para gestionar autores y publicaciones, desarrollada con Node.js, Express y PostgreSQL como proyecto integrador del Módulo 2 de Henry.

## Estado del proyecto

En desarrollo: estructura inicial y servidor Express disponibles. Todavía no están implementados el CRUD, los scripts SQL, la conexión a PostgreSQL, los tests ni el despliegue. Este README se actualizará conforme se compruebe cada etapa.

## Tecnologías

- Node.js 24 y npm 11.
- Express 5 para el servidor HTTP.
- PostgreSQL 17 y `pg` para persistencia mediante SQL directo.
- Vitest y Supertest para pruebas automatizadas.
- GitHub para versionado y Railway para el despliegue previsto.

Las versiones exactas de las dependencias se conservan en `package-lock.json`.

## Instalación local

Requisitos: Node.js 24, npm y Git. PostgreSQL 17 se utilizará al implementar la persistencia.

```bash
git clone https://github.com/MiguelMirandaV/miniblog-m2.git
cd miniblog-m2
npm ci
cp .env.example .env
npm run dev
```

El servidor escucha en `http://localhost:3000`. En esta etapa inicial no hay rutas implementadas: una petición a `/` devuelve 404 y no representa un fallo de arranque.

La variable `DATABASE_URL` incluida en el ejemplo es un marcador de posición. El servidor inicial no utiliza la base de datos; sus instrucciones de configuración se añadirán con el esquema SQL.

## Variables de entorno

| Variable | Uso |
|---|---|
| `NODE_ENV` | Ambiente de ejecución; desarrollo local o producción |
| `PORT` | Puerto HTTP; por defecto 3000 |
| `DATABASE_URL` | Conexión PostgreSQL; se configurará localmente, sin publicarla |

`.env.example` contiene ejemplos sin credenciales reales. `.env` está excluido de Git. En Railway las variables se configurarán en el servicio correspondiente.

## Comandos

| Comando | Función |
|---|---|
| `npm run dev` | Arranca el servidor y lo reinicia al guardar cambios |
| `npm start` | Arranca el servidor sin observar cambios |
| `npm test` | Ejecuta Vitest una vez; los casos se añadirán en la etapa de testing |
| `npm run test:watch` | Ejecuta Vitest en modo observación |

Actualmente `npm test` informa que no hay archivos de pruebas. No se considera una suite aprobada hasta que existan y pasen casos reales.

## Organización

```text
src/
  app.js           Configura Express y exporta la aplicación
  server.js        Inicia el servidor HTTP
  routes/          Rutas y respuestas HTTP
  services/        Operaciones de autores/posts y consultas parametrizadas
  db/              Configuración central del pool de PostgreSQL
  validators/      Validaciones reutilizables de entrada
  middlewares/     Manejo común de peticiones y errores
sql/               Scripts de creación y datos iniciales
tests/             Pruebas unitarias y HTTP
docs/              Documentación y registro de uso de IA
```

Los archivos `.gitkeep` conservan temporalmente las carpetas que todavía están vacías.

## Contrato previsto

- `/authors`: GET y POST.
- `/authors/:id`: GET, PUT y DELETE.
- `/posts`: GET y POST.
- `/posts/:id`: GET, PUT y DELETE.
- `/posts/author/:authorId`: GET de publicaciones con detalle de su autor.

La entidad se llama `authors` en toda la aplicación. La referencia a `users.id` que aparece en un punto de la consigna se interpreta como `authors.id`, de acuerdo con el modelo y el SQL de la guía.

## Documentación y entrega pendientes

- Scripts SQL de setup y seed, con instrucciones reproducibles.
- CRUD con validaciones y manejo centralizado de errores.
- Tests unitarios y HTTP.
- Archivo OpenAPI y visualización de la documentación.
- Guía de Railway, URL pública y evidencia de funcionamiento.

## Uso de IA

El desarrollo cuenta con asistencia de IA y revisión mediante comprobaciones reales. Los prompts relevantes, decisiones y verificaciones se registran en [docs/uso-ia.md](docs/uso-ia.md).

## Datos y credenciales

Se usarán exclusivamente datos ficticios para la demostración. La API requerida no incluye autenticación. Nunca deben publicarse archivos `.env`, tokens, contraseñas ni URLs de PostgreSQL que contengan credenciales.
