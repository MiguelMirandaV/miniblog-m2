# Despliegue en Railway

**Estado:** API desplegada con PostgreSQL remoto. Dominio público: [miniblog-m2-production.up.railway.app](https://miniblog-m2-production.up.railway.app/authors). Documentación interactiva: [Swagger UI](https://miniblog-m2-production.up.railway.app/docs/).

## Servicios y variables

El proyecto necesita dos servicios: la API desde este repositorio y PostgreSQL con almacenamiento persistente. Usa la rama `main` y la raíz del repositorio para la API. Puedes crear el proyecto desde **Deploy from GitHub repo**, seleccionar `MiguelMirandaV/miniblog-m2` y añadir PostgreSQL en ese mismo proyecto. Autoriza la integración de GitHub para este repositorio cuando Railway lo solicite. [Guía oficial de Express](https://docs.railway.com/guides/express).

En el servicio de la API configura:

| Variable | Valor |
|---|---|
| NODE_ENV | production |
| DATABASE_URL | Referencia a DATABASE_URL del servicio PostgreSQL |

Si el servicio de base de datos se llama `Postgres`, la referencia es `${{Postgres.DATABASE_URL}}`. Si tiene otro nombre, selecciónalo con el autocompletado. No copies el valor secreto resuelto al repositorio, README o chat. No importes los valores locales de `.env.example`: localhost y CHANGE_ME no conectan con Railway. TEST_DATABASE_URL solo se utiliza localmente. [Variables de referencia](https://docs.railway.com/variables).

La conexión entre servicios debe usar la URL **interna** de PostgreSQL. `DATABASE_PUBLIC_URL` sirve para conexiones externas cuando se habilita acceso público; no hace falta habilitarlo para que esta API acceda a su base. No confundir estas URLs de base de datos, que contienen credenciales, con la URL HTTPS pública de la API. [Conexiones PostgreSQL](https://docs.railway.com/databases/postgresql).

## Construcción, preparación y arranque

La aplicación usa Node.js 24, declarado en package.json y .node-version. Comprueba en los logs que Railway use esa versión e instale las dependencias del lockfile. No existe una compilación del código JavaScript: el comando de arranque es `npm start`.

Configura estos ajustes en **Settings → Deploy** del servicio API. Durante este despliegue, el panel indicó que los servicios nuevos ya no pueden activar el sistema legado Config as Code. Por eso se retiró `railway.json` y se aplicaron los comandos directamente en el panel; no se presupone que Railway lea ese archivo.

| Ajuste | Valor |
|---|---|
| Start Command | npm start |
| Pre-Deploy Command, primera entrega | npm run db:setup && npm run db:seed |
| Healthcheck Path | /authors |

El comando previo crea tablas e inserta los ejemplos ficticios antes del arranque. Railway lo ejecuta con acceso a las variables y la red privada; si falla, el despliegue se detiene. Revisa primero que PostgreSQL esté disponible. [Pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command).

Tras completar la carga inicial, cambia **Pre-deploy Command** en el panel a `npm run db:setup`, guarda y aplica el cambio para que futuros despliegues no vuelvan a insertar ejemplos borrados intencionalmente. El seed es repetible secuencialmente, pero no debe ejecutarse en cada arranque del servidor. El setup actual no reemplaza migraciones para cambios futuros del esquema.

La API escucha en `0.0.0.0` y utiliza PORT del entorno. No hace falta fijar el puerto local 3000 en Railway. No configures `npm test` como comando de arranque: la integración exige la base de pruebas local. Ejecuta las pruebas antes de publicar cambios.

## URL pública y comprobación

En el servicio **API**, abre **Settings → Networking → Public Networking → Generate Domain**. Railway proporciona un dominio HTTPS. [Public Networking](https://docs.railway.com/networking/public-networking).

Para consultar el despliegue de este proyecto:

```bash
API_URL='https://miniblog-m2-production.up.railway.app'
curl -i "$API_URL/authors"
curl -i "$API_URL/posts"
curl -i "$API_URL/posts/author/1"
```

La tercera consulta usa un ID ilustrativo: reemplázalo por uno recibido en la primera. Abre además `/docs/` y `/openapi.json` bajo el dominio real. La raíz `/` responde 404 por diseño; no la uses como healthcheck.

Si despliegas tu propia copia, comprueba también creación, actualización, relación y borrado usando recursos ficticios propios; verifica persistencia tras reiniciar el servicio y limpia esos recursos.

En este despliegue se comprobó Node.js 24.21.0, el arranque con `npm start`, el healthcheck `/authors` y el dominio dirigido al puerto 8080 asignado por Railway. El comando inicial preparó tablas y seed; los despliegues posteriores utilizan únicamente `npm run db:setup`.

El 8 de octubre de 2026, 26 peticiones HTTPS comprobaron los once endpoints, validaciones y cascada. Se creó un autor con un post, se actualizó y se compararon todos sus campos y fechas después de que Railway activara un nuevo despliegue. La comparación coincidió. Se limpiaron únicamente esos recursos propios y quedaron tres autores y cinco posts ficticios del seed. Swagger UI y OpenAPI también respondieron 200.

## Diagnóstico y mantenimiento

- **Falta DATABASE_URL:** revisa la variable del servicio API y su referencia al servicio PostgreSQL.
- **Falló preparación SQL:** revisa estado de PostgreSQL, conexión interna y salida del comando previo; no imprimas la URL con credenciales.
- **502 o servicio inaccesible:** comprueba logs, comando `npm start`, puerto asignado y escucha en `0.0.0.0`.
- **Healthcheck falla:** `/authors` necesita conexión y tablas; comprueba que haya terminado el comando previo.
- **Despliegue exitoso pero sin registros:** comprueba si se ejecutó el seed inicial. Una lista vacía no implica un fallo HTTP.

El almacenamiento remoto es independiente de tu base local: no copia automáticamente los datos creados en tu Mac. Conserva únicamente datos ficticios, ya que el alcance del proyecto no incluye autenticación. Revisa en tu cuenta la disponibilidad del servicio y el saldo antes de la entrega; no se presupone duración ilimitada del despliegue.
