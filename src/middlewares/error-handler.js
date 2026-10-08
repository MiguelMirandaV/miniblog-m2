import { HttpError } from '../errors.js';

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let status = 500;
  let message = 'Error interno del servidor.';

  if (error instanceof HttpError) {
    status = error.status;
    message = error.message;
  } else if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'El cuerpo contiene JSON inválido.';
  } else if (error.type === 'entity.too.large') {
    status = 413;
    message = 'El cuerpo supera el límite de 100 KB.';
  }

  if (status === 500) {
    console.error('Error no controlado:', { method: req.method, code: error.code ?? 'INTERNAL_ERROR' });
  }
  res.status(status).json({ error: message, status });
}
