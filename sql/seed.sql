BEGIN;

INSERT INTO authors (name, email, bio)
VALUES
  ('Ana García', 'ana@example.com', 'Escribe sobre JavaScript y desarrollo backend.'),
  ('Carlos Ruiz', 'carlos@example.com', 'Comparte conceptos de bases de datos.'),
  ('María López', 'maria@example.com', 'Explora el diseño de APIs REST.')
ON CONFLICT (email) DO NOTHING;

-- Buscar al autor por email evita depender de IDs fijos como 1, 2 y 3.
-- Repetir este seed secuencialmente no duplica los ejemplos ni sobrescribe ediciones.
INSERT INTO posts (author_id, title, content, published)
SELECT authors.id, examples.title, examples.content, examples.published
FROM (
  VALUES
    ('ana@example.com', 'Introducción a Node.js',
      'Node.js permite ejecutar JavaScript fuera del navegador.', TRUE),
    ('carlos@example.com', 'Relaciones en PostgreSQL',
      'Las claves foráneas mantienen relaciones válidas entre tablas.', TRUE),
    ('ana@example.com', 'APIs REST',
      'Una API REST utiliza recursos y métodos HTTP para exponer operaciones.', TRUE),
    ('maria@example.com', 'Manejo de errores en Express',
      'Un middleware central permite responder errores de forma consistente.', FALSE),
    ('ana@example.com', 'Async y await',
      'Async y await permiten escribir operaciones asíncronas de forma clara.', FALSE)
) AS examples (email, title, content, published)
INNER JOIN authors ON authors.email = examples.email
WHERE NOT EXISTS (
  SELECT 1
  FROM posts
  WHERE posts.author_id = authors.id AND posts.title = examples.title
);

COMMIT;
