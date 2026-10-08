import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/db/pool.js', () => ({ pool: { query: vi.fn() } }));
import { pool } from '../../src/db/pool.js';
import * as authors from '../../src/services/authors.js';
import * as posts from '../../src/services/posts.js';

beforeEach(() => {
  pool.query.mockReset();
});

describe('servicios con dependencia SQL simulada', () => {
  it.each([
    ['obtener autor', () => authors.getAuthorById(45)],
    ['editar autor', () => authors.updateAuthor(45, { name: 'Ana', email: 'ana@example.com' })],
    ['eliminar autor', () => authors.deleteAuthor(45)],
    ['obtener post', () => posts.getPostById(45)],
    ['editar post', () => posts.updatePost(45, { author_id: 3, title: 'Título', content: 'Texto' })],
    ['eliminar post', () => posts.deletePost(45)],
    ['posts de autor inexistente', () => posts.listPostsByAuthor(45)],
  ])('%s produce 404 cuando SQL no encuentra filas', async (_label, operation) => {
    pool.query.mockResolvedValue({ rows: [], rowCount: 0 });
    await expect(operation()).rejects.toMatchObject({ status: 404 });
  });
  it('devuelve [] para un autor existente sin posts', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: null, author_detail_id: 45 }], rowCount: 1 });
    await expect(posts.listPostsByAuthor(45)).resolves.toEqual([]);
  });
  it('construye el detalle del autor a partir del JOIN', async () => {
    pool.query.mockResolvedValue({ rowCount: 1, rows: [{
      id: 7, author_id: 45, title: 'Título', content: 'Texto', published: false,
      created_at: 'fecha-post', author_detail_id: 45, author_name: 'Ana',
      author_email: 'ana@example.com', author_bio: null, author_created_at: 'fecha-autor',
    }] });
    await expect(posts.listPostsByAuthor(45)).resolves.toEqual([{
      id: 7, author_id: 45, title: 'Título', content: 'Texto', published: false,
      created_at: 'fecha-post', author: {
        id: 45, name: 'Ana', email: 'ana@example.com', bio: null, created_at: 'fecha-autor',
      },
    }]);
  });
  it('envía el texto del usuario como parámetro y devuelve lo generado por SQL', async () => {
    const input = { name: "Robert'); DROP TABLE authors; --", email: 'sql@example.com', bio: null };
    const saved = { ...input, id: 45, created_at: 'fecha-generada' };
    pool.query.mockResolvedValue({ rows: [saved], rowCount: 1 });
    await expect(authors.createAuthor(input)).resolves.toEqual(saved);
    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).not.toContain(input.name);
    expect(values).toEqual([input.name, input.email, null]);
  });
  it('propaga fallos SQL para que el middleware decida la respuesta HTTP', async () => {
    const failure = Object.assign(new Error('Fallo simulado'), { code: 'ECONNREFUSED' });
    pool.query.mockRejectedValue(failure);
    await expect(authors.listAuthors()).rejects.toMatchObject({ code: 'ECONNREFUSED', message: 'Fallo simulado' });
  });
});
