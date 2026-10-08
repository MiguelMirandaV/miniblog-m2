import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

let client;
let transactionOpen = false;

try {
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('Falta TEST_DATABASE_URL.');
  }
  const target = new URL(process.env.TEST_DATABASE_URL);
  const appTarget = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
  if (
    !['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)
    || target.pathname !== '/miniblog_test'
    || appTarget?.pathname === target.pathname
  ) {
    throw new Error('La verificación requiere la base local separada miniblog_test.');
  }

  client = new pg.Client({
    connectionString: process.env.TEST_DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });
  await client.connect();

  const setup = await readFile(new URL('../sql/setup.sql', import.meta.url), 'utf8');
  const seed = await readFile(new URL('../sql/seed.sql', import.meta.url), 'utf8');
  const counts = 'SELECT (SELECT COUNT(*) FROM authors)::int AS authors, '
    + '(SELECT COUNT(*) FROM posts)::int AS posts';
  await client.query(setup);
  await client.query(seed);
  const before = (await client.query(counts)).rows[0];
  await client.query(setup);
  await client.query(seed);
  assert.deepEqual((await client.query(counts)).rows[0], before);
  assert.ok(before.authors >= 3 && before.posts >= 5);
  console.log('OK: setup repetible y seed sin duplicados.');

  // Los cambios de los casos siguientes se deshacen al terminar.
  await client.query('BEGIN');
  transactionOpen = true;

  async function rejectsWith(code, text, values) {
    await client.query('SAVEPOINT invalid_input');
    let received;
    try {
      await client.query(text, values);
    } catch (error) {
      received = error.code;
    } finally {
      await client.query('ROLLBACK TO SAVEPOINT invalid_input');
      await client.query('RELEASE SAVEPOINT invalid_input');
    }
    assert.equal(received, code, `Se esperaba la restricción SQL ${code}.`);
  }

  const email = `check-${randomUUID()}@example.com`;
  const author = (await client.query(
    'INSERT INTO authors (name, email) VALUES ($1, $2) RETURNING id, bio, created_at',
    ['Autor de prueba', email],
  )).rows[0];
  assert.equal(author.bio, null);
  assert.ok(author.created_at);
  assert.equal((await client.query(
    'SELECT email FROM authors WHERE id = $1', [author.id],
  )).rows[0].email, email);
  assert.equal((await client.query(
    'UPDATE authors SET name = $1 WHERE id = $2 RETURNING name',
    ['Autor actualizado', author.id],
  )).rows[0].name, 'Autor actualizado');

  const post = (await client.query(
    'INSERT INTO posts (author_id, title, content) VALUES ($1, $2, $3) '
      + 'RETURNING id, published, created_at',
    [author.id, 'Publicación de prueba', 'Contenido de prueba'],
  )).rows[0];
  assert.equal(post.published, false);
  assert.ok(post.created_at);
  const joined = (await client.query(
    'SELECT posts.id, authors.email FROM posts '
      + 'INNER JOIN authors ON authors.id = posts.author_id WHERE posts.id = $1',
    [post.id],
  )).rows[0];
  assert.equal(joined.email, email);
  assert.equal((await client.query(
    'UPDATE posts SET content = $1, published = $2 WHERE id = $3 RETURNING published',
    ['Contenido actualizado', true, post.id],
  )).rows[0].published, true);
  console.log('OK: crear, leer y actualizar authors/posts; JOIN, fechas y valores por defecto.');

  await rejectsWith('23505', 'INSERT INTO authors (name, email) VALUES ($1, $2)', ['Duplicado', email]);
  await rejectsWith('23502', 'INSERT INTO authors (name, email) VALUES ($1, $2)', [null, `n-${email}`]);
  await rejectsWith('23514', 'INSERT INTO authors (name, email) VALUES ($1, $2)', [' \t\n', `b-${email}`]);
  await rejectsWith('23514', 'INSERT INTO authors (name, email) VALUES ($1, $2)', ['Correo', 'correo-invalido']);
  await rejectsWith('23514', 'INSERT INTO authors (name, email) VALUES ($1, $2)', ['Correo', 'MAYUS@example.com']);
  await rejectsWith('23503',
    'INSERT INTO posts (author_id, title, content) VALUES ($1, $2, $3)',
    [-1, 'Autor inexistente', 'Texto'],
  );
  await rejectsWith('23514',
    'INSERT INTO posts (author_id, title, content) VALUES ($1, $2, $3)',
    [author.id, '   ', 'Texto'],
  );
  await rejectsWith('23514',
    'INSERT INTO posts (author_id, title, content) VALUES ($1, $2, $3)',
    [author.id, 'Título', '\t\n'],
  );
  await rejectsWith('22001',
    'INSERT INTO posts (author_id, title, content) VALUES ($1, $2, $3)',
    [author.id, 'x'.repeat(201), 'Texto'],
  );
  await rejectsWith('22P02',
    'INSERT INTO posts (author_id, title, content, published) VALUES ($1, $2, $3, $4)',
    [author.id, 'Título', 'Texto', 'no-es-booleano'],
  );
  console.log('OK: unicidad, NOT NULL, textos vacíos, email, FK, longitud y tipo booleano.');

  assert.equal((await client.query('DELETE FROM posts WHERE id = $1', [post.id])).rowCount, 1);
  assert.equal((await client.query('DELETE FROM posts WHERE id = $1', [post.id])).rowCount, 0);
  await client.query(
    'INSERT INTO posts (author_id, title, content) VALUES ($1, $2, $3)',
    [author.id, 'Post para cascada', 'Texto'],
  );
  assert.equal((await client.query('DELETE FROM authors WHERE id = $1', [author.id])).rowCount, 1);
  assert.equal((await client.query('SELECT id FROM posts WHERE author_id = $1', [author.id])).rowCount, 0);
  assert.equal((await client.query('DELETE FROM authors WHERE id = $1', [author.id])).rowCount, 0);
  console.log('OK: borrado de posts/authors, recurso inexistente y cascada.');

  await client.query('ROLLBACK');
  transactionOpen = false;
  assert.deepEqual((await client.query(counts)).rows[0], before);
  console.log('Verificación SQL completada; cambios de prueba revertidos.');
} catch (error) {
  // Mensaje controlado: no exponer URLs, consultas ni credenciales.
  console.error(`Falló la verificación SQL (${error.code ?? 'configuración o aserción'}).`);
  process.exitCode = 1;
} finally {
  if (client) {
    try {
      if (transactionOpen) await client.query('ROLLBACK');
    } finally {
      await client.end();
    }
  }
}
