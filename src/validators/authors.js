import { HttpError } from '../errors.js';
import { requiredText, validateBody } from './common.js';

export function validateAuthor(body) {
  validateBody(body, ['name', 'email', 'bio']);
  const name = requiredText(body.name, 'name', 100);
  const normalizedEmail = requiredText(body.email, 'email').toLowerCase();
  const email = requiredText(normalizedEmail, 'email', 150);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'email debe tener un formato válido.');
  }
  if (body.bio !== undefined && body.bio !== null && typeof body.bio !== 'string') {
    throw new HttpError(400, 'bio debe ser un texto o null.');
  }
  if (typeof body.bio === 'string' && body.bio.includes('\u0000')) {
    throw new HttpError(400, 'bio contiene un carácter no permitido.');
  }
  return { name, email, bio: body.bio?.trim() ?? null };
}
