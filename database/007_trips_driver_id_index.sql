SET client_encoding = 'UTF8';

BEGIN;

CREATE INDEX trips_driver_id_idx
  ON trips (driver_id);

COMMIT;
