BEGIN;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  rating_average NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_rating_average_range
    CHECK (rating_average IS NULL OR rating_average BETWEEN 0 AND 5)
);

CREATE UNIQUE INDEX users_email_lower_unique ON users (lower(email));

COMMIT;
