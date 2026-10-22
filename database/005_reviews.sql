BEGIN;

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  score INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reviews_trip_id_fkey
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE RESTRICT,
  CONSTRAINT reviews_reviewer_id_fkey
    FOREIGN KEY (reviewer_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT reviews_driver_id_fkey
    FOREIGN KEY (driver_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT reviews_score_range
    CHECK (score BETWEEN 1 AND 5),
  CONSTRAINT reviews_reviewer_not_driver
    CHECK (reviewer_id <> driver_id),
  CONSTRAINT reviews_trip_reviewer_unique
    UNIQUE (trip_id, reviewer_id)
);

CREATE INDEX reviews_driver_id_idx ON reviews (driver_id);

COMMIT;
