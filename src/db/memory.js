// Almacenamiento temporal de la etapa HTTP: se reemplazará por PostgreSQL.
const createdAt = new Date().toISOString();

export const memory = {
  authors: [
    { id: 1, name: 'Ana García', email: 'ana@example.com', bio: 'Escribe sobre JavaScript y desarrollo backend.', created_at: createdAt },
    { id: 2, name: 'Carlos Ruiz', email: 'carlos@example.com', bio: 'Comparte conceptos de bases de datos.', created_at: createdAt },
    { id: 3, name: 'María López', email: 'maria@example.com', bio: 'Explora el diseño de APIs REST.', created_at: createdAt },
  ],
  posts: [
    { id: 1, author_id: 1, title: 'Introducción a Node.js', content: 'Node.js permite ejecutar JavaScript fuera del navegador.', published: true, created_at: createdAt },
    { id: 2, author_id: 2, title: 'Relaciones en PostgreSQL', content: 'Las claves foráneas mantienen relaciones válidas entre tablas.', published: true, created_at: createdAt },
    { id: 3, author_id: 1, title: 'APIs REST', content: 'Una API REST utiliza recursos y métodos HTTP para exponer operaciones.', published: true, created_at: createdAt },
    { id: 4, author_id: 3, title: 'Manejo de errores en Express', content: 'Un middleware central permite responder errores de forma consistente.', published: false, created_at: createdAt },
    { id: 5, author_id: 1, title: 'Async y await', content: 'Async y await permiten escribir operaciones asíncronas de forma clara.', published: false, created_at: createdAt },
  ],
  nextAuthorId: 4,
  nextPostId: 6,
};
