# Entrega del Proyecto Integrador M2

## Enlaces

- Repositorio público: https://github.com/MiguelMirandaV/miniblog-m2
- API, lista de autores: https://miniblog-m2-production.up.railway.app/authors
- API, lista de publicaciones: https://miniblog-m2-production.up.railway.app/posts
- Swagger UI: https://miniblog-m2-production.up.railway.app/docs/
- OpenAPI JSON: https://miniblog-m2-production.up.railway.app/openapi.json

El entregable final solicitado por la consigna es el enlace del repositorio GitHub. El README permite encontrar los demás recursos y reproducir la aplicación.

## Cierre del plan aprobado

| Paso | Resultado y evidencia |
|---|---|
| 0. Entorno | Node.js 24.21.0, npm 11.19.0, Git, VS Code, PostgreSQL local, GitHub y Railway preparados |
| 1. Proyecto y Git | ES Modules, estructura por responsabilidades, scripts, lockfile, .gitignore y .env.example |
| 2. Modelo y SQL | Authors/posts, relación 1:N, claves y restricciones, índice, setup y seed repetibles |
| 3. HTTP con arrays | Etapa inicial conservada en el historial, commit 978777a; sustituida por persistencia en la versión final |
| 4. PostgreSQL y validaciones | Once endpoints, pool compartido, SQL parametrizado, JOIN, validadores y errores centralizados |
| 5. Pruebas | 65 unitarias y 31 HTTP con PostgreSQL real: 96 casos aprobados |
| 6. Documentación | OpenAPI 3.0.3, Swagger UI, README, guías y registro de uso de IA |
| 7. Railway | API y PostgreSQL remotos; CRUD y persistencia tras nuevo despliegue comprobados |
| 8. Auditoría final | Copia limpia desde GitHub, npm ci, preparación de una base nueva, arranque real, pruebas, contrato, documentación e historial revisados |

Se implementó exclusivamente el alcance obligatorio de authors/posts, sin la entidad comments de extra credit. La relación author_id apunta a authors.id; esta interpretación del nombre inconsistente users.id de la consigna está documentada en el README.

## Auditoría final — 8 de octubre de 2026

La auditoría técnica se realizó sobre el commit `c863c7f872e81abb09e8c8399767ad12204b7dad`, descargado de GitHub en una carpeta independiente. El cierre posterior añade documentación, sin cambiar código, SQL ni dependencias.

- `npm ci`: instalación desde el lockfile; 156 paquetes instalados y cero vulnerabilidades conocidas reportadas en ese momento.
- `npm run db:setup` y `npm run db:seed`: ejecutados desde esa copia sobre una base local temporal nueva. Se obtuvieron tres autores y cinco posts ficticios.
- `npm start`: servidor real iniciado en un puerto temporal; lecturas, relación por autor, Swagger UI, OpenAPI y errores HTTP comprobados. El servidor se cerró y la base y configuración temporales se eliminaron al terminar.
- `npm test`: cuatro archivos y 96 pruebas aprobadas desde la copia limpia. La integración usa exclusivamente miniblog_test; no se ejecuta contra Railway ni contra miniblog.
- `npm run db:verify`: repetición de setup/seed, CRUD, JOIN, restricciones, fechas, defaults y cascada comprobados con SQL real; cambios de los casos CRUD revertidos.
- `npm run docs:validate`: contrato OpenAPI 3.0.3 válido, once operaciones. Comparación de rutas implementadas con el contrato: coincidencia de las once.
- Documentación: doce enlaces locales existentes revisados antes de añadir este informe.
- Git: los ocho commits y 72 blobs anteriores al cierre fueron revisados buscando las contraseñas locales y patrones reconocidos de tokens/claves privadas; no se encontraron coincidencias. .env y node_modules ausentes del historial, .env.example presente y reglas de exclusión comprobadas. Esto no equivale a un escaneo universal de todos los tipos de secretos.
- API pública: detalles/listas de autores y posts, relación por autor, respuestas 400/404, Swagger UI y OpenAPI comprobados sin modificar datos. En ese momento había cuatro autores y cinco posts; los recuentos pueden variar porque la API admite CRUD público.

En el paso 7, 26 peticiones HTTPS adicionales comprobaron creación, actualización y borrado, validaciones, cascada y persistencia completa de un autor y su post después de un nuevo despliegue. Se eliminaron únicamente los recursos temporales propios. Véanse [la guía de Railway](railway.md) y [el registro de IA](uso-ia.md).

## Reproducir las comprobaciones

Sigue la [instalación local del README](../README.md#instalación-local), configura tu archivo .env y prepara las bases. Desde la raíz del repositorio:

```bash
npm run db:setup
npm run db:seed
npm run db:verify
npm test
npm run docs:validate
npm start
```

No necesitas otro servidor en el puerto 3000 para ejecutar los tests: Supertest usa puertos temporales. Si ya tienes `npm run dev` activo, conserva esa instancia o ciérrala antes de usar `npm start`.

## Presentación y límites

Para demostrar el proyecto, abre Swagger UI, consulta GET /authors y utiliza un ID devuelto por la API para GET /posts/author/{authorId}. Las operaciones de escritura modifican datos; utiliza ejemplos ficticios y elimina solo tus propios recursos de demostración.

El código y las guías están listos para entregar. El envío del enlace en el aula de Henry corresponde al estudiante; este informe no afirma que se haya realizado ni que se haya cumplido el plazo original. La auditoría se basó en la consigna y la guía adjuntas: la hoja externa de rúbrica no pudo consultarse y no se garantiza una calificación. La disponibilidad futura de Railway depende del plan y saldo de la cuenta.
