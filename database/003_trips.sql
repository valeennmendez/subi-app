BEGIN;

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL,
  origin_city VARCHAR(120) NOT NULL,
  destination_city VARCHAR(120) NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  price_per_seat NUMERIC(10,2) NOT NULL,
  status trip_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT trips_driver_id_fkey
    FOREIGN KEY (driver_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT trips_total_seats_positive
    CHECK (total_seats > 0),
  CONSTRAINT trips_available_seats_range
    CHECK (available_seats >= 0 AND available_seats <= total_seats),
  CONSTRAINT trips_price_per_seat_positive
    CHECK (price_per_seat > 0)
);

CREATE INDEX trips_search_idx
  ON trips (origin_city, destination_city, departure_time);

COMMIT;
