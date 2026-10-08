import express, { Router } from 'express';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-dist';

const router = Router();
const specPath = fileURLToPath(new URL('../../docs/openapi.json', import.meta.url));
const uiPath = fileURLToPath(new URL('../../docs/ui/', import.meta.url));

router.get('/openapi.json', (req, res) => res.sendFile(specPath));
// Publicar solo los archivos de documentación, nunca la raíz del repositorio.
router.use('/docs/assets', express.static(swaggerUi.getAbsoluteFSPath(), { index: false }));
router.use('/docs', express.static(uiPath));

export default router;
