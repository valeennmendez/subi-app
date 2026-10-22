BEGIN;

CREATE TYPE trip_status AS ENUM (
  'scheduled',
  'completed',
  'cancelled'
);

CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled_by_passenger'
);

COMMIT;
