SET client_encoding = 'UTF8';

BEGIN;

ALTER TABLE trips
  ADD COLUMN origin_search TEXT
    GENERATED ALWAYS AS (
      translate(lower(origin_city), 'áéíóúñüÁÉÍÓÚÑÜ', 'aeiounuaeiounu')
    ) STORED,
  ADD COLUMN destination_search TEXT
    GENERATED ALWAYS AS (
      translate(lower(destination_city), 'áéíóúñüÁÉÍÓÚÑÜ', 'aeiounuaeiounu')
    ) STORED;

CREATE INDEX trips_origin_search_idx
  ON trips (origin_search text_pattern_ops);

CREATE INDEX trips_destination_search_idx
  ON trips (destination_search text_pattern_ops);

COMMIT;
