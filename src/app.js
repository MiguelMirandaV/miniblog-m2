import express from 'express';
import authorsRouter from './routes/authors.js';
import postsRouter from './routes/posts.js';
import docsRouter from './routes/docs.js';
import { HttpError } from './errors.js';
import { errorHandler } from './middlewares/error-handler.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(docsRouter);
app.use('/authors', authorsRouter);
app.use('/posts', postsRouter);

app.use((req, res, next) => next(new HttpError(404, 'Ruta no encontrada.')));
app.use(errorHandler);

// Exportar sin abrir un puerto permite probar la aplicación con Supertest.
export default app;
