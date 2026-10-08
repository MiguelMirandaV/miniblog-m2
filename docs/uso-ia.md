# Registro de uso de IA

Este registro describe la asistencia recibida durante el proyecto y cómo se comprueba el resultado. Se omiten credenciales, códigos de autenticación y material completo del curso.

## 2026-10-07 — Planificación y entorno

**Herramienta:** asistente de IA en Codex.

**Prompt del estudiante (extracto):** «eres un senior full stack dev, tech lead, que es mi tutor durante el curso de full stack de henry. Me apoyarás en aclaraciones, guías paso a paso, correcciones y realizarás desarrollo en sí de actividades».

**Restricción posterior (extracto):** «no trabajes en ningún punto extra, solo asegura que los obligatorios estén bien».

**Contexto aportado:** lectures M2, consigna del Proyecto Integrador y guía de desarrollo. Se elaboró un plan por etapas, aprobado por el estudiante, para una API MiniBlog con Express, SQL directo mediante pg, PostgreSQL, Vitest, Supertest, OpenAPI y Railway.

**Decisiones:** mantener solo authors/posts; usar authors.id como destino de la relación; conservar la etapa breve con arrays; separar los tests unitarios de las comprobaciones reales de SQL; documentar decisiones y errores conforme ocurren.

**Corrección durante la preparación:** la instalación con Homebrew falló por propiedad de sus directorios. Se inspeccionaron los permisos y, tras la decisión explícita del estudiante, se transfirió la administración a su usuario de desarrollo. No se trató una comprobación bloqueada por permisos del entorno como evidencia de que PostgreSQL estuviera detenido.

**Verificación observada:** Node.js 24.21.0, npm 11.19.0, PostgreSQL 17.11 y GitHub CLI 2.102.0 instalados; el estudiante inició PostgreSQL y ejecutó una consulta real que confirmó su conexión. GitHub autenticado y panel de Railway accesible.

## 2026-10-07 — Estructura inicial

**Solicitud que autoriza esta etapa:** aprobación del plan y confirmación del entorno preparado.

**Aporte de IA:** creación de la estructura de carpetas, package.json, aplicación Express inicial, scripts npm, .gitignore, .env.example, README y este registro.

**Decisiones técnicas:** ES Modules en todo el proyecto; separar app.js y server.js para permitir pruebas HTTP sin iniciar el servidor de producción; fijar versiones de dependencias compatibles con Node 24; utilizar correo noreply para los commits.

**Verificación observada:** instalación reproducible registrada en package-lock.json; npm audit durante la instalación reportó cero vulnerabilidades conocidas; sintaxis JavaScript comprobada; `npm start` inició el servidor y una petición HTTP real a `/` devolvió el 404 esperado sin exponer la cabecera x-powered-by; un puerto inválido fue rechazado. El servidor temporal de comprobación se cerró al terminar.

**Límite de esta verificación:** es una comprobación de la estructura y el arranque. No hay todavía endpoints CRUD ni pruebas automatizadas del dominio; no se presenta como una suite de tests aprobada.

## 2026-10-07 — Modelo y SQL

**Solicitud:** continuación del paso 2 del plan aprobado, después de confirmar la apertura del proyecto y su arranque local.

**Aporte de IA:** esquema authors/posts, seed ficticio, comandos npm para ejecutar SQL y verificador de base de datos real. Se generaron credenciales locales que no se incluyeron en el repositorio.

**Decisiones:** usar SERIAL y TIMESTAMPTZ como en la guía; constraints NOT NULL, UNIQUE, CHECK y FK; normalizar emails para la unicidad; índice sobre author_id; ON DELETE CASCADE explícito. El seed resuelve autores por email y evita IDs fijos. Setup es repetible pero no reemplaza migraciones futuras.

**Seguridad local:** rol específico sin privilegios administrativos, bases de aplicación/pruebas separadas, contraseña aleatoria local y reglas SCRAM acotadas al proyecto. Se verificó que una contraseña incorrecta fuera rechazada y que .env estuviera excluido de Git.

**Verificación observada:** setup/seed ejecutados en PostgreSQL; tres autores y cinco posts en la base de aplicación. Comprobados en miniblog_test: repetición sin duplicados, CRUD, JOIN, fechas/defaults, unicidad, campos obligatorios, textos blancos, email, FK, longitud, tipo booleano, borrado inexistente y cascada. Los cambios de los casos CRUD se revierten con ROLLBACK.

**Distinción:** este verificador comprueba SQL real. Los tests unitarios y HTTP con Vitest/Supertest siguen pendientes de su etapa.

## 2026-10-07 — HTTP con arrays

**Solicitud:** continuación del paso 3 después de que el estudiante confirmó la verificación SQL y la exploración de los datos.

**Aporte de IA:** implementación de los once endpoints con arrays temporales, servicios separados, validadores y middleware central de errores; documentación del contrato HTTP.

**Decisiones:** conservar el contrato al sustituir los arrays por PostgreSQL; usar servicios async compatibles con la futura persistencia; aprovechar el manejo de errores async de Express 5 sin instalar wrappers adicionales. PUT reemplaza los campos editables completos, DELETE responde 204 sin cuerpo y se distingue un ID inválido de uno inexistente.

**Validaciones anticipadas:** tipos antes de trim, límites de longitud, email normalizado y único, IDs compatibles con INTEGER, published:false válido y rechazo de campos no editables. Se rechazó el carácter nulo porque PostgreSQL no permite almacenarlo en texto. Se comprobó la longitud después de normalizar el email para evitar expansiones Unicode fuera del límite.

**Verificación observada:** 56 peticiones de comprobación con Supertest contra la aplicación en memoria, incluyendo los once endpoints, CRUD, relación por autor, lista vacía, cascada, cuerpos inválidos, errores 400/404/413 y un fallo interno simulado con respuesta 500 genérica. Esta comprobación temporal no es todavía la suite de tests del entregable.

**Comprobación del almacenamiento:** se inició además un servidor HTTP real, se creó un autor con respuesta 201 y se reinició el proceso. El nuevo autor dejó de existir, como corresponde a esta etapa con arrays. PostgreSQL conservó sus tres autores y cinco posts: las peticiones HTTP no modificaron la base. Los procesos temporales de verificación se cerraron.
