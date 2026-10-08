import { describe, expect, it } from 'vitest';
import { validateTestDatabase } from '../helpers/test-database.js';

const local = 'postgresql://localhost/miniblog_test';
describe('protección del destino de integración', () => {
  it('acepta solo la base de pruebas local separada', () => {
    expect(validateTestDatabase(local, 'postgresql://localhost/miniblog')).toBe(local);
  });
  it.each([
    undefined, 'URL inválida', 'postgresql://localhost/miniblog',
    'postgresql://remote.example/miniblog_test', 'https://localhost/miniblog_test',
    `${local}?database=miniblog`, `${local}#fragmento`,
  ])('rechaza el destino %s antes de conectarse', (url) => {
    expect(() => validateTestDatabase(url)).toThrow();
  });
  it('rechaza usar la misma base que la aplicación', () => {
    expect(() => validateTestDatabase(local, local)).toThrow();
  });
  it('no expone una credencial en los errores de configuración', () => {
    expect(() => validateTestDatabase('postgresql://user:PRIVATE_TEST_VALUE@'))
      .toThrow('Configura TEST_DATABASE_URL con una URL local válida; no se abrió ninguna conexión.');
  });
});
