import { HttpError } from '../errors.js';
import { requiredText, validateBody, validateIntegerId } from './common.js';

export function validatePost(body) {
  validateBody(body, ['author_id', 'title', 'content', 'published']);
  const author_id = validateIntegerId(body.author_id, 'author_id');
  const title = requiredText(body.title, 'title', 200);
  const content = requiredText(body.content, 'content');
  if (body.published !== undefined && typeof body.published !== 'boolean') {
    throw new HttpError(400, 'published debe ser true o false.');
  }
  return { author_id, title, content, published: body.published ?? false };
}
