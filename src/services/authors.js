import { pool } from '../db/pool.js';
import { HttpError } from '../errors.js';

export async function listAuthors() {
  const result = await pool.query(
    'SELECT id, name, email, bio, created_at FROM authors ORDER BY id',
  );
  return result.rows;
}

export async function getAuthorById(id) {
  const result = await pool.query(
    'SELECT id, name, email, bio, created_at FROM authors WHERE id = $1',
    [id],
  );
  if (result.rowCount === 0) throw new HttpError(404, 'Autor no encontrado.');
  return result.rows[0];
}

export async function createAuthor(data) {
  // UNIQUE en PostgreSQL resuelve duplicados incluso si llegan peticiones simultáneas.
  const result = await pool.query(
    'INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) '
      + 'RETURNING id, name, email, bio, created_at',
    [data.name, data.email, data.bio],
  );
  return result.rows[0];
}

export async function updateAuthor(id, data) {
  const result = await pool.query(
    'UPDATE authors SET name = $1, email = $2, bio = $3 WHERE id = $4 '
      + 'RETURNING id, name, email, bio, created_at',
    [data.name, data.email, data.bio, id],
  );
  if (result.rowCount === 0) throw new HttpError(404, 'Autor no encontrado.');
  return result.rows[0];
}

export async function deleteAuthor(id) {
  // La clave foránea elimina los posts relacionados en la misma operación.
  const result = await pool.query('DELETE FROM authors WHERE id = $1 RETURNING id', [id]);
  if (result.rowCount === 0) throw new HttpError(404, 'Autor no encontrado.');
}
