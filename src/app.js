import express from 'express';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// Exportar sin abrir un puerto permite probar la aplicación con Supertest.
export default app;
