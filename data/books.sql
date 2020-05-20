DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  authors TEXT,
  description TEXT,
  img_url TEXT,
)