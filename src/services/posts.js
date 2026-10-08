import { pool } from '../db/pool.js';
import { HttpError } from '../errors.js';

export async function listPosts() {
  const result = await pool.query(
    'SELECT id, author_id, title, content, published, created_at FROM posts ORDER BY id',
  );
  return result.rows;
}

export async function getPostById(id) {
  const result = await pool.query(
    'SELECT id, author_id, title, content, published, created_at FROM posts WHERE id = $1',
    [id],
  );
  if (result.rowCount === 0) throw new HttpError(404, 'Post no encontrado.');
  return result.rows[0];
}

export async function listPostsByAuthor(authorId) {
  // LEFT JOIN conserva al autor sin posts: así distinguimos [] de un autor inexistente.
  const result = await pool.query(
    `SELECT posts.id, posts.author_id, posts.title, posts.content, posts.published,
            posts.created_at, authors.id AS author_detail_id, authors.name AS author_name,
            authors.email AS author_email, authors.bio AS author_bio,
            authors.created_at AS author_created_at
     FROM authors
     LEFT JOIN posts ON posts.author_id = authors.id
     WHERE authors.id = $1
     ORDER BY posts.id`,
    [authorId],
  );
  if (result.rowCount === 0) throw new HttpError(404, 'Autor no encontrado.');
  return result.rows.filter((row) => row.id !== null).map((row) => ({
    id: row.id,
    author_id: row.author_id,
    title: row.title,
    content: row.content,
    published: row.published,
    created_at: row.created_at,
    author: {
      id: row.author_detail_id,
      name: row.author_name,
      email: row.author_email,
      bio: row.author_bio,
      created_at: row.author_created_at,
    },
  }));
}

export async function createPost(data) {
  const result = await pool.query(
    'INSERT INTO posts (author_id, title, content, published) VALUES ($1, $2, $3, $4) '
      + 'RETURNING id, author_id, title, content, published, created_at',
    [data.author_id, data.title, data.content, data.published],
  );
  return result.rows[0];
}

export async function updatePost(id, data) {
  const result = await pool.query(
    'UPDATE posts SET author_id = $1, title = $2, content = $3, published = $4 WHERE id = $5 '
      + 'RETURNING id, author_id, title, content, published, created_at',
    [data.author_id, data.title, data.content, data.published, id],
  );
  if (result.rowCount === 0) throw new HttpError(404, 'Post no encontrado.');
  return result.rows[0];
}

export async function deletePost(id) {
  const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
  if (result.rowCount === 0) throw new HttpError(404, 'Post no encontrado.');
}
