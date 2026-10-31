import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { api, ApiError } from '../api/client.js';
import { Header } from '../components/Header.jsx';
import { Button } from '../components/ui/Button.jsx';
import {
  AlertIcon,
  CalendarIcon,
  OriginIcon,
  PinIcon,
  PriceIcon,
  UsersIcon,
} from '../components/ui/icons.jsx';
import { TextField } from '../components/ui/TextField.jsx';
import { useToast } from '../toast/useToast.js';
import {
  MAX_PRICE_PER_SEAT,
  MAX_SEATS,
  MIN_SEATS,
  TRIP_FIELDS,
  buildDepartureTime,
  validateTripField,
  validateTripForm,
} from '../utils/tripValidation.js';

const INITIAL_VALUES = {
  origin_city: '',
  destination_city: '',
  departure_time: '',
  total_seats: '',
  price_per_seat: '',
};

export function CreateTripPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const departureRef = useRef(null);
  const totalSeatsRef = useRef(null);
  const priceRef = useRef(null);

  const fieldRefs = {
    origin_city: originRef,
    destination_city: destinationRef,
    departure_time: departureRef,
    total_seats: totalSeatsRef,
    price_per_seat: priceRef,
  };

  function setFieldError(field, message) {
    setErrors((current) => {
      const next = { ...current };

      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }

      return next;
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));

    setErrors((current) => {
      const next = { ...current };
      delete next[name];

      // El error de origen y destino iguales se muestra en destino, así que
      // al editar cualquiera de los dos se limpia el par.
      if (name === 'origin_city' || name === 'destination_city') {
        delete next.origin_city;
        delete next.destination_city;
      }

      return next;
    });

    setFormError('');
  }

  function handleBlur(event) {
    const { name } = event.target;

    if (name === 'origin_city') {
      setFieldError('origin_city', validateTripField('origin_city', values));

      // Si ya hay destino, se revalida para detectar el caso de igualdad.
      if (values.destination_city) {
        setFieldError(
          'destination_city',
          validateTripField('destination_city', values),
        );
      }

      return;
    }

    const message = validateTripField(name, values);

    if (message) setFieldError(name, message);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submittingRef.current) return;

    const normalizedValues = {
      ...values,
      origin_city: values.origin_city.trim(),
      destination_city: values.destination_city.trim(),
    };
    const nextErrors = validateTripForm(normalizedValues);

    setValues(normalizedValues);
    setErrors(nextErrors);
    setFormError('');

    const firstInvalidField = TRIP_FIELDS.find(
      (field) => nextErrors[field],
    );

    if (firstInvalidField) {
      fieldRefs[firstInvalidField].current?.focus();
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      await api.post('/trips', {
        origin_city: normalizedValues.origin_city,
        destination_city: normalizedValues.destination_city,
        departure_time: buildDepartureTime(normalizedValues.departure_time),
        total_seats: Number(normalizedValues.total_seats),
        price_per_seat: Number(normalizedValues.price_per_seat),
      });

      showToast({
        type: 'success',
        message: 'Tu viaje se publicó correctamente.',
      });
      navigate('/viajes/mios');
    } catch (error) {
      // Todo error del servidor que no sea de un campo se muestra arriba.
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'No pudimos publicar tu viaje. Intentá de nuevo.',
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <Header />

      <main className="mx-auto w-full max-w-[1120px] px-4 py-8 min-[800px]:px-10 min-[800px]:pt-12 min-[800px]:pb-16">
        <section>
          <h1 className="text-[32px] font-bold leading-[1.2] text-ink min-[800px]:text-[36px]">
            Publicar viaje
          </h1>
          <p className="mt-2 text-base text-muted">
            Contanos de dónde salís y a dónde vas.
          </p>
        </section>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="mt-8 rounded-card border border-line bg-canvas p-6"
        >
          {formError ? (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-alert border border-error-line bg-error-soft px-4 py-3.5 text-sm font-semibold text-error"
            >
              <AlertIcon className="mt-0.5 size-5 shrink-0" />
              <p>{formError}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-[18px] min-[800px]:grid-cols-6">
            <TextField
              id="trip-origin"
              name="origin_city"
              label="Origen"
              icon={OriginIcon}
              type="text"
              autoComplete="off"
              placeholder="Ej.: Buenos Aires"
              value={values.origin_city}
              onChange={handleChange}
              onBlur={handleBlur}
              inputRef={originRef}
              error={errors.origin_city}
              required
              className="min-[800px]:col-span-3"
            />

            <TextField
              id="trip-destination"
              name="destination_city"
              label="Destino"
              icon={PinIcon}
              type="text"
              autoComplete="off"
              placeholder="Ej.: Rosario"
              value={values.destination_city}
              onChange={handleChange}
              onBlur={handleBlur}
              inputRef={destinationRef}
              error={errors.destination_city}
              required
              className="min-[800px]:col-span-3"
            />

            <TextField
              id="trip-departure"
              name="departure_time"
              label="Fecha y hora de salida"
              icon={CalendarIcon}
              type="datetime-local"
              value={values.departure_time}
              onChange={handleChange}
              onBlur={handleBlur}
              inputRef={departureRef}
              error={errors.departure_time}
              required
              className="min-[800px]:col-span-2"
            />

            <TextField
              id="trip-seats"
              name="total_seats"
              label="Asientos disponibles"
              icon={UsersIcon}
              type="number"
              inputMode="numeric"
              min={MIN_SEATS}
              max={MAX_SEATS}
              step={1}
              placeholder="Ej.: 3"
              helpText={`De ${MIN_SEATS} a ${MAX_SEATS} asientos`}
              value={values.total_seats}
              onChange={handleChange}
              onBlur={handleBlur}
              inputRef={totalSeatsRef}
              error={errors.total_seats}
              required
              className="min-[800px]:col-span-2"
            />

            <TextField
              id="trip-price"
              name="price_per_seat"
              label="Precio por asiento"
              icon={PriceIcon}
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_PRICE_PER_SEAT}
              step={1}
              placeholder="Ej.: 12000"
              helpText="Al reservar se cobra una seña del 15%."
              value={values.price_per_seat}
              onChange={handleChange}
              onBlur={handleBlur}
              inputRef={priceRef}
              error={errors.price_per_seat}
              required
              className="min-[800px]:col-span-2"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="mt-6"
          >
            {submitting ? 'Publicando...' : 'Publicar viaje'}
          </Button>
        </form>
      </main>
    </div>
  );
}
