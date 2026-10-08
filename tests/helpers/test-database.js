// Validar antes de importar la app: el pool lee DATABASE_URL al cargar el módulo.
export function validateTestDatabase(testUrl, appUrl) {
  let target;
  let application;
  try {
    target = new URL(testUrl);
    application = appUrl ? new URL(appUrl) : null;
  } catch {
    throw new Error('Configura TEST_DATABASE_URL con una URL local válida; no se abrió ninguna conexión.');
  }
  if (
    !['postgres:', 'postgresql:'].includes(target.protocol)
    || !['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)
    || target.pathname !== '/miniblog_test'
    || application?.pathname === target.pathname
    || target.search || target.hash
  ) {
    throw new Error('Los tests requieren la base local separada miniblog_test, sin parámetros de URL.');
  }
  return testUrl;
}
