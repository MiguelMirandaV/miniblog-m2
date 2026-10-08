import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Falta DATABASE_URL. Configúrala en .env o en el entorno.');
}

try {
  const url = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname) {
    throw new Error('URL inválida');
  }
} catch {
  // No propagar errores de URL que puedan incluir su contenido y la contraseña.
  throw new Error('DATABASE_URL debe ser una URL PostgreSQL válida.');
}

export const pool = new pg.Pool({
  connectionString,
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
});

pool.on('error', (error) => {
  console.error('Error en conexión inactiva de PostgreSQL:', { code: error.code ?? 'DB_ERROR' });
});
