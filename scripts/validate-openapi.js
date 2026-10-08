import SwaggerParser from '@apidevtools/swagger-parser';
import { fileURLToPath } from 'node:url';

try {
  const document = await SwaggerParser.validate(
    fileURLToPath(new URL('../docs/openapi.json', import.meta.url)),
    { resolve: { external: false } },
  );
  const methods = ['get', 'post', 'put', 'delete'];
  const operations = Object.values(document.paths)
    .flatMap((path) => methods.filter((method) => path[method]));
  console.log(`OpenAPI ${document.openapi} válido: ${operations.length} operaciones documentadas.`);
} catch (error) {
  console.error('OpenAPI inválido:', error.message);
  process.exitCode = 1;
}
