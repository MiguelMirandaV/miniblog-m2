import { HttpError } from '../errors.js';

export function parseId(value, field = 'id') {
  if (typeof value !== 'string' || !/^[0-9]+$/.test(value)) {
    throw new HttpError(400, `${field} debe ser un entero positivo.`);
  }
  return validateIntegerId(Number(value), field);
}

export function validateIntegerId(value, field) {
  if (!Number.isInteger(value) || value < 1 || value > 2147483647) {
    throw new HttpError(400, `${field} debe ser un entero entre 1 y 2147483647.`);
  }
  return value;
}

export function validateBody(body, allowedFields) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'El cuerpo debe ser un objeto JSON.');
  }
  if (Object.keys(body).some((field) => !allowedFields.includes(field))) {
    throw new HttpError(400, 'El cuerpo contiene campos no permitidos.');
  }
}

export function requiredText(value, field, maxLength = Infinity) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, `${field} debe ser un texto no vacío.`);
  }
  const normalized = value.trim();
  // Contar caracteres Unicode como PostgreSQL, no unidades UTF-16 de JavaScript.
  if ([...normalized].length > maxLength) {
    throw new HttpError(400, `${field} admite hasta ${maxLength} caracteres.`);
  }
  if (normalized.includes('\u0000')) {
    throw new HttpError(400, `${field} contiene un carácter no permitido.`);
  }
  return normalized;
}
