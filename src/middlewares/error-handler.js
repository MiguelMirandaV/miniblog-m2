import { HttpError } from '../errors.js';

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let status = 500;
  let message = 'Error interno del servidor.';

  if (error instanceof HttpError) {
    status = error.status;
    message = error.message;
  } else if (error.code === '23505' && error.constraint === 'authors_email_unique') {
    status = 400;
    message = 'El email ya está registrado.';
  } else if (error.code === '23503' && error.constraint === 'posts_author_id_fkey') {
    status = 400;
    message = 'author_id debe corresponder a un autor existente.';
  } else if (['23502', '23514', '22001', '22003', '22P02', '22021'].includes(error.code)) {
    status = 400;
    message = 'Los datos no cumplen las restricciones de la base de datos.';
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
