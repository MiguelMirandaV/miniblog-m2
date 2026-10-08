BEGIN;

CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT authors_name_not_blank CHECK (name ~ '[^[:space:]]'),
  CONSTRAINT authors_email_unique UNIQUE (email),
  -- Guardar el correo normalizado permite que UNIQUE cubra diferencias de mayúsculas.
  CONSTRAINT authors_email_normalized CHECK (email = LOWER(BTRIM(email))),
  CONSTRAINT authors_email_format CHECK (
    email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  )
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT posts_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE,
  CONSTRAINT posts_title_not_blank CHECK (title ~ '[^[:space:]]'),
  CONSTRAINT posts_content_not_blank CHECK (content ~ '[^[:space:]]')
);

-- PostgreSQL no crea automáticamente un índice en la columna que referencia otra tabla.
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts (author_id);

COMMIT;
