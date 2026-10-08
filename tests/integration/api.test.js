import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { loadEnvFile } from 'node:process';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { validateTestDatabase } from '../helpers/test-database.js';

let app;
let pool;
let author;
let originalDatabaseUrl;
let environmentChanged = false;
const authorIds = new Set();
const uniqueEmail = () => `vitest-${randomUUID()}@example.com`;

beforeAll(async () => {
  try {
    loadEnvFile();
  } catch (error) {
    if (error.code !== 'ENOENT') throw new Error('No se pudo cargar el archivo de entorno local.');
  }
  originalDatabaseUrl = process.env.DATABASE_URL;
  // No importar app/pool antes de esta guarda; nunca hay fallback a DATABASE_URL.
  process.env.DATABASE_URL = validateTestDatabase(process.env.TEST_DATABASE_URL, originalDatabaseUrl);
  environmentChanged = true;
  ({ default: app } = await import('../../src/app.js'));
  ({ pool } = await import('../../src/db/pool.js'));
  try {
    await pool.query(await readFile(new URL('../../sql/setup.sql', import.meta.url), 'utf8'));
  } catch {
    throw new Error('No se pudo preparar miniblog_test. Revisa PostgreSQL y TEST_DATABASE_URL localmente.');
  }
});

beforeEach(async () => {
  const result = await pool.query(
    'INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) '
      + 'RETURNING id, name, email, bio, created_at',
    ['Autor del test', uniqueEmail(), 'Biografía inicial'],
  );
  author = result.rows[0];
  authorIds.add(author.id);
});

afterEach(async () => {
  // Restaurar cualquier fallo simulado antes de limpiar los registros propios.
  vi.restoreAllMocks();
  if (pool && authorIds.size) {
    await pool.query('DELETE FROM authors WHERE id = ANY($1::int[])', [[...authorIds]]);
    authorIds.clear();
  }
});

afterAll(async () => {
  try {
    if (pool) await pool.end();
  } finally {
    if (environmentChanged) {
      if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = originalDatabaseUrl;
    }
  }
});

function assertError(response, status) {
  expect(response.status).toBe(status);
  expect(response.body).toEqual({ error: expect.any(String), status });
}

async function createAuthor(body = {}) {
  const response = await request(app).post('/authors').send({
    name: 'Autora creada', email: uniqueEmail(), ...body,
  });
  if (response.status === 201) authorIds.add(response.body.id);
  expect(response.status).toBe(201);
  return response;
}

async function createPost(body = {}) {
  const response = await request(app).post('/posts').send({
    author_id: author.id, title: 'Título del test', content: 'Contenido del test', ...body,
  });
  expect(response.status).toBe(201);
  return response;
}

// Un ID devuelto y luego eliminado garantiza ausencia sin asumir números libres.
async function missingAuthorId() {
  const response = await createAuthor();
  await pool.query('DELETE FROM authors WHERE id = $1', [response.body.id]);
  return response.body.id;
}

describe('CRUD HTTP de autores con PostgreSQL', () => {
  it('POST crea y normaliza un autor; GET individual/listado recuperan el mismo registro', async () => {
    const email = uniqueEmail();
    const created = await createAuthor({ name: ' Ana ', email: email.toUpperCase(), bio: ' Bio ' });
    expect(created.headers.location).toBe(`/authors/${created.body.id}`);
    expect(created.body).toEqual({
      id: expect.any(Number), name: 'Ana', email, bio: 'Bio', created_at: expect.any(String),
    });
    expect(Number.isNaN(Date.parse(created.body.created_at))).toBe(false);
    const detail = await request(app).get(created.headers.location);
    expect(detail.status).toBe(200);
    expect(detail.body).toEqual(created.body);
    const list = await request(app).get('/authors');
    expect(list.status).toBe(200);
    expect(list.body).toContainEqual(created.body);
    expect(list.headers['x-powered-by']).toBeUndefined();
    const stored = await pool.query('SELECT email FROM authors WHERE id = $1', [created.body.id]);
    expect(stored.rows[0].email).toBe(email);
  });

  it('PUT reemplaza campos editables y conserva ID/fecha', async () => {
    const response = await request(app).put(`/authors/${author.id}`)
      .send({ name: 'Nuevo nombre', email: author.email });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: author.id, name: 'Nuevo nombre', email: author.email,
      bio: null, created_at: author.created_at.toISOString(),
    });
    expect((await request(app).get(`/authors/${author.id}`)).body).toEqual(response.body);
  });

  it('rechaza email duplicado tanto en POST como en PUT sin modificar al autor', async () => {
    const second = (await createAuthor()).body;
    assertError(await request(app).post('/authors').send({ name: 'Duplicado', email: author.email.toUpperCase() }), 400);
    assertError(await request(app).put(`/authors/${second.id}`).send({ name: 'Duplicado', email: author.email }), 400);
    expect((await request(app).get(`/authors/${second.id}`)).body).toEqual(second);
  });

  it('dos POST simultáneos con el mismo email producen una sola alta', async () => {
    const email = uniqueEmail();
    const responses = await Promise.all([1, 2].map(() =>
      request(app).post('/authors').send({ name: 'Concurrente', email })));
    for (const response of responses) {
      if (response.status === 201) authorIds.add(response.body.id);
    }
    expect(responses.map((response) => response.status).sort()).toEqual([201, 400]);
    const stored = await pool.query('SELECT id FROM authors WHERE email = $1', [email]);
    expect(stored.rowCount).toBe(1);
  });

  it('DELETE responde sin cuerpo y elimina también los posts del autor', async () => {
    const post = (await createPost()).body;
    const response = await request(app).delete(`/authors/${author.id}`);
    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    assertError(await request(app).get(`/authors/${author.id}`), 404);
    assertError(await request(app).get(`/posts/${post.id}`), 404);
    assertError(await request(app).delete(`/authors/${author.id}`), 404);
  });

  it('GET/PUT/DELETE de un autor inexistente responden 404', async () => {
    const id = await missingAuthorId();
    assertError(await request(app).get(`/authors/${id}`), 404);
    assertError(await request(app).put(`/authors/${id}`).send({ name: 'Nadie', email: uniqueEmail() }), 404);
    assertError(await request(app).delete(`/authors/${id}`), 404);
  });
});

describe('CRUD HTTP de posts y relación por autor', () => {
  it('POST crea un borrador; GET individual/listado lo recuperan', async () => {
    const created = await createPost({ title: ' Título ', content: ' Texto ' });
    expect(created.headers.location).toBe(`/posts/${created.body.id}`);
    expect(created.body).toEqual({
      id: expect.any(Number), author_id: author.id, title: 'Título', content: 'Texto',
      published: false, created_at: expect.any(String),
    });
    expect(Number.isNaN(Date.parse(created.body.created_at))).toBe(false);
    const detail = await request(app).get(created.headers.location);
    expect(detail.status).toBe(200);
    expect(detail.body).toEqual(created.body);
    const list = await request(app).get('/posts');
    expect(list.status).toBe(200);
    expect(list.body).toContainEqual(created.body);
  });

  it('PUT cambia autor y publicación; omitir published lo restablece a false', async () => {
    const post = (await createPost()).body;
    const second = (await createAuthor()).body;
    const body = { author_id: second.id, title: 'Editado', content: 'Actualizado' };
    const changed = await request(app).put(`/posts/${post.id}`).send({ ...body, published: true });
    expect(changed.status).toBe(200);
    expect(changed.body).toEqual({ ...body, id: post.id, created_at: post.created_at, published: true });
    const reset = await request(app).put(`/posts/${post.id}`).send(body);
    expect(reset.status).toBe(200);
    expect(reset.body.published).toBe(false);
    expect((await request(app).get(`/posts/${post.id}`)).body).toEqual(reset.body);
  });

  it('GET por autor incluye su detalle y no devuelve posts de otros autores', async () => {
    const post = (await createPost()).body;
    const second = (await createAuthor()).body;
    await createPost({ author_id: second.id });
    const response = await request(app).get(`/posts/author/${author.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{
      ...post, author: { ...author, created_at: author.created_at.toISOString() },
    }]);
  });

  it('distingue autor sin posts (200 []) de autor inexistente (404)', async () => {
    const response = await request(app).get(`/posts/author/${author.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    assertError(await request(app).get(`/posts/author/${await missingAuthorId()}`), 404);
  });

  it('rechaza referencias inexistentes en POST/PUT y conserva el post anterior', async () => {
    const post = (await createPost()).body;
    const bad = { author_id: await missingAuthorId(), title: 'Inválido', content: 'Texto' };
    assertError(await request(app).post('/posts').send(bad), 400);
    assertError(await request(app).put(`/posts/${post.id}`).send(bad), 400);
    expect((await request(app).get(`/posts/${post.id}`)).body).toEqual(post);
  });

  it('DELETE responde 204 sin cuerpo; GET/PUT/DELETE posteriores responden 404', async () => {
    const post = (await createPost()).body;
    const response = await request(app).delete(`/posts/${post.id}`);
    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    assertError(await request(app).get(`/posts/${post.id}`), 404);
    assertError(await request(app).put(`/posts/${post.id}`).send({ author_id: author.id, title: 'Texto', content: 'Texto' }), 404);
    assertError(await request(app).delete(`/posts/${post.id}`), 404);
  });
});

describe('validaciones y errores HTTP', () => {
  it.each(['/authors/abc', '/authors/0', '/posts/1abc', '/posts/-1', '/posts/2147483648', '/posts/author/1.5'])(
    'rechaza ID inválido en %s', async (path) => assertError(await request(app).get(path), 400),
  );

  it.each([
    ['post', '/authors', { name: 'Falta email' }],
    ['post', '/authors', { name: ' ', email: 'a@example.com' }],
    ['post', '/authors', { name: 'Ana', email: 'inválido' }],
    ['post', '/authors', []],
    ['post', '/authors', { name: 'Ana', email: 'a@example.com', id: 1 }],
  ])('%s %s rechaza un cuerpo inválido %#', async (method, path, body) => {
    assertError(await request(app)[method](path).send(body), 400);
  });

  it('PUT exige todos los campos obligatorios y no guarda una actualización parcial', async () => {
    const post = (await createPost()).body;
    assertError(await request(app).put(`/authors/${author.id}`).send({ name: 'Solo nombre' }), 400);
    assertError(await request(app).put(`/posts/${post.id}`).send({ title: 'Solo título' }), 400);
    expect((await request(app).get(`/authors/${author.id}`)).body.name).toBe(author.name);
    expect((await request(app).get(`/posts/${post.id}`)).body).toEqual(post);
  });

  it.each(['false', null, 0])('rechaza published=%s en HTTP', async (published) => {
    assertError(await request(app).post('/posts').send({ author_id: author.id, title: 'Título', content: 'Texto', published }), 400);
  });

  it('rechaza JSON mal formado con 400 y cuerpos mayores de 100 KB con 413', async () => {
    assertError(await request(app).post('/authors').set('Content-Type', 'application/json').send('{malformed'), 400);
    assertError(await request(app).post('/posts').send({ author_id: author.id, title: 'Título', content: 'x'.repeat(110000) }), 413);
  });

  it('responde 404 JSON ante una ruta desconocida', async () => {
    assertError(await request(app).get('/ruta-inexistente'), 404);
  });

  it('almacena literalmente un texto con instrucciones SQL sin ejecutarlas', async () => {
    const name = "Robert'); DROP TABLE authors; --";
    const response = await createAuthor({ name });
    const stored = await pool.query('SELECT name FROM authors WHERE id = $1', [response.body.id]);
    expect(stored.rows[0].name).toBe(name);
    expect((await request(app).get(`/authors/${author.id}`)).status).toBe(200);
  });

  it('un fallo SQL inesperado devuelve 500 sin filtrar detalles internos', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(pool, 'query').mockRejectedValueOnce(Object.assign(
      new Error('PRIVATE_TEST_DETAIL'), { code: 'ECONNREFUSED' },
    ));
    const response = await request(app).get('/authors');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error interno del servidor.', status: 500 });
    expect(JSON.stringify(log.mock.calls)).not.toContain('PRIVATE_TEST_DETAIL');
    expect(log).toHaveBeenCalled();
  });
});
