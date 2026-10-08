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
