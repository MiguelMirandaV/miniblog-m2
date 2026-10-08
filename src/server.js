import app from './app.js';
import { pool } from './db/pool.js';

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe ser un número entero entre 1 y 65535.');
}

let server;
let shuttingDown = false;

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  const timeout = setTimeout(() => {
    console.error('Se agotó el tiempo para cerrar el servidor.');
    process.exit(1);
  }, 10000);
  timeout.unref();

  async function closeDatabase() {
    try {
      await pool.end();
    } catch {
      process.exitCode = 1;
    } finally {
      clearTimeout(timeout);
    }
  }

  if (server) server.close(closeDatabase);
  else void closeDatabase();
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

try {
  await pool.query('SELECT 1');
  if (!shuttingDown) {
    server = app.listen(port, '0.0.0.0', (error) => {
      // Express 5 también invoca este callback si falla la apertura del puerto.
      if (error) return;
      console.log(`MiniBlog disponible en http://localhost:${port}`);
      console.log('Persistencia: PostgreSQL conectado.');
    });
    server.on('error', (error) => {
      console.error('No se pudo abrir el puerto HTTP:', { code: error.code ?? 'HTTP_ERROR' });
      process.exitCode = 1;
      shutdown();
    });
  }
} catch (error) {
  console.error('No se pudo iniciar la conexión PostgreSQL:', { code: error.code ?? 'DB_ERROR' });
  process.exitCode = 1;
  shutdown();
}
