import { memory } from '../db/memory.js';
import { HttpError } from '../errors.js';

export async function listAuthors() {
  return memory.authors;
}

export async function getAuthorById(id) {
  const author = memory.authors.find((item) => item.id === id);
  if (!author) throw new HttpError(404, 'Autor no encontrado.');
  return author;
}

function ensureUniqueEmail(email, currentId) {
  if (memory.authors.some((item) => item.email === email && item.id !== currentId)) {
    throw new HttpError(400, 'El email ya está registrado.');
  }
}

export async function createAuthor(data) {
  ensureUniqueEmail(data.email);
  const author = { id: memory.nextAuthorId++, ...data, created_at: new Date().toISOString() };
  memory.authors.push(author);
  return author;
}

export async function updateAuthor(id, data) {
  const author = await getAuthorById(id);
  ensureUniqueEmail(data.email, id);
  Object.assign(author, data);
  return author;
}

export async function deleteAuthor(id) {
  await getAuthorById(id);
  memory.authors = memory.authors.filter((item) => item.id !== id);
  // Reproduce el ON DELETE CASCADE del esquema SQL durante esta etapa temporal.
  memory.posts = memory.posts.filter((item) => item.author_id !== id);
}
