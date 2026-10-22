BEGIN;

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL,
  passenger_id UUID NOT NULL,
  seats_reserved INTEGER NOT NULL,
  deposit_amount NUMERIC(10,2) NOT NULL,
  payment_id VARCHAR(255),
  status booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bookings_trip_id_fkey
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE RESTRICT,
  CONSTRAINT bookings_passenger_id_fkey
    FOREIGN KEY (passenger_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT bookings_seats_reserved_positive
    CHECK (seats_reserved > 0),
  CONSTRAINT bookings_deposit_amount_non_negative
    CHECK (deposit_amount >= 0)
);

CREATE INDEX bookings_trip_id_idx ON bookings (trip_id);
CREATE INDEX bookings_passenger_id_idx ON bookings (passenger_id);

CREATE UNIQUE INDEX bookings_payment_id_unique
  ON bookings (payment_id)
  WHERE payment_id IS NOT NULL;

COMMIT;
