import { describe, expect, it } from 'vitest';
import { validateAuthor } from '../../src/validators/authors.js';
import { validatePost } from '../../src/validators/posts.js';
import { parseId } from '../../src/validators/common.js';

const author = { name: 'Ana', email: 'ana@example.com' };
const post = { author_id: 1, title: 'Título', content: 'Contenido' };

function expectBadRequest(operation) {
  expect(operation).toThrow(expect.objectContaining({ status: 400 }));
}

describe('IDs de ruta', () => {
  it.each(['1', '2147483647'])('acepta el límite válido %s', (value) => {
    expect(parseId(value)).toBe(Number(value));
  });
  it.each(['0', '-1', '1.5', '1abc', 'abc', '', '2147483648', ' 1', undefined])(
    'rechaza %s sin convertirlo parcialmente', (value) => expectBadRequest(() => parseId(value)),
  );
});

describe('validación de autores', () => {
  it('normaliza textos sin modificar el objeto recibido', () => {
    const input = { name: ' Ana ', email: ' ANA@EXAMPLE.COM ', bio: ' Bio ' };
    expect(validateAuthor(input)).toEqual({ ...author, bio: 'Bio' });
    expect(input.name).toBe(' Ana ');
  });
  it('usa null cuando bio se omite o es null', () => {
    expect(validateAuthor(author).bio).toBeNull();
    expect(validateAuthor({ ...author, bio: null }).bio).toBeNull();
  });
  it('acepta los límites de longitud, contando caracteres Unicode', () => {
    const input = { name: '😀'.repeat(100), email: `${'a'.repeat(138)}@example.com` };
    expect(validateAuthor(input)).toEqual({ ...input, bio: null });
  });
  it.each([
    ['cuerpo ausente', undefined], ['cuerpo null', null], ['array', []],
    ['campo obligatorio ausente', { email: author.email }],
    ['nombre no textual', { ...author, name: 12 }],
    ['nombre blanco', { ...author, name: ' \t\n' }],
    ['nombre largo', { ...author, name: '😀'.repeat(101) }],
    ['email inválido', { ...author, email: 'ana@' }],
    ['email largo', { ...author, email: `${'a'.repeat(139)}@example.com` }],
    ['email expandido al normalizar', { ...author, email: `${'İ'.repeat(70)}@example.com` }],
    ['bio no textual', { ...author, bio: 12 }],
    ['carácter nulo', { ...author, bio: 'a\u0000b' }],
    ['id no editable', { ...author, id: 1 }],
    ['fecha no editable', { ...author, created_at: '2026-01-01' }],
  ])('rechaza %s con 400', (_label, input) => expectBadRequest(() => validateAuthor(input)));
});

describe('validación de posts', () => {
  it('normaliza los textos y utiliza published:false por defecto', () => {
    expect(validatePost({ ...post, title: ' Título ', content: ' Contenido ' }))
      .toEqual({ ...post, published: false });
  });
  it.each([true, false])('conserva el booleano %s', (published) => {
    expect(validatePost({ ...post, published }).published).toBe(published);
  });
  it('admite títulos de 200 caracteres Unicode', () => {
    expect(validatePost({ ...post, title: '😀'.repeat(200) }).title).toBe('😀'.repeat(200));
  });
  it.each([
    ['author_id string', { ...post, author_id: '1' }],
    ['author_id ausente', { title: post.title, content: post.content }],
    ['author_id cero', { ...post, author_id: 0 }],
    ['author_id fraccional', { ...post, author_id: 1.5 }],
    ['author_id fuera de rango', { ...post, author_id: 2147483648 }],
    ['título vacío', { ...post, title: ' ' }],
    ['título largo', { ...post, title: 'x'.repeat(201) }],
    ['contenido nulo', { ...post, content: null }],
    ['carácter nulo', { ...post, content: 'a\u0000b' }],
    ['booleano string', { ...post, published: 'false' }],
    ['booleano null', { ...post, published: null }],
    ['campo desconocido', { ...post, extra: true }],
  ])('rechaza %s con 400', (_label, input) => expectBadRequest(() => validatePost(input)));
});
