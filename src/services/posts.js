import { memory } from '../db/memory.js';
import { HttpError } from '../errors.js';
import { getAuthorById } from './authors.js';

export async function listPosts() {
  return memory.posts;
}

export async function getPostById(id) {
  const post = memory.posts.find((item) => item.id === id);
  if (!post) throw new HttpError(404, 'Post no encontrado.');
  return post;
}

export async function listPostsByAuthor(authorId) {
  const author = await getAuthorById(authorId);
  return memory.posts
    .filter((item) => item.author_id === authorId)
    .map((post) => ({ ...post, author }));
}

function ensureAuthorExists(authorId) {
  if (!memory.authors.some((item) => item.id === authorId)) {
    throw new HttpError(400, 'author_id debe corresponder a un autor existente.');
  }
}

export async function createPost(data) {
  ensureAuthorExists(data.author_id);
  const post = { id: memory.nextPostId++, ...data, created_at: new Date().toISOString() };
  memory.posts.push(post);
  return post;
}

export async function updatePost(id, data) {
  const post = await getPostById(id);
  ensureAuthorExists(data.author_id);
  Object.assign(post, data);
  return post;
}

export async function deletePost(id) {
  await getPostById(id);
  memory.posts = memory.posts.filter((item) => item.id !== id);
}
