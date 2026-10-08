import { readFile } from 'node:fs/promises';
import pg from 'pg';

const files = {
  setup: new URL('../sql/setup.sql', import.meta.url),
  seed: new URL('../sql/seed.sql', import.meta.url),
};
const action = process.argv[2];
let client;

try {
  if (!Object.hasOwn(files, action)) {
    throw new Error('Utiliza npm run db:setup o npm run db:seed.');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en el entorno o en .env.');
  }

  const sql = await readFile(files[action], 'utf8');
  client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });
  await client.connect();
  await client.query(sql);
  console.log(`SQL ${action}: completado correctamente.`);
} catch (error) {
  // No imprimir el objeto de error completo: podría incluir datos de conexión.
  const knownErrors = {
    '28P01': 'Usuario o contraseña de PostgreSQL incorrectos.',
    '3D000': 'La base de datos todavía no existe.',
    '42P01': 'Faltan tablas: ejecuta primero npm run db:setup.',
    ECONNREFUSED: 'PostgreSQL no acepta conexiones en la dirección configurada.',
    ENOENT: 'No se encontró el archivo SQL.',
  };
  console.error(
    error.code
      ? knownErrors[error.code] ?? `Falló el script SQL (código ${error.code}).`
      : 'No se pudo ejecutar el script. Revisa la acción, DATABASE_URL y PostgreSQL.',
  );
  process.exitCode = 1;
} finally {
  if (client) await client.end();
}
