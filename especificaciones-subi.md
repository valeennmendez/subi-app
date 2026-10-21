# Especificación de Proyecto: Subite — Plataforma de Carpooling (MVP)

## 0. Cómo trabajar en este proyecto (leer primero)

El desarrollador es estudiante de Sistemas y usa este proyecto para aprender y como parte de su portafolio. Necesita **entender cada parte del código**, no solo que funcione.

* **Siempre plan primero:** antes de modificar archivos, mostrá un plan con los archivos que vas a crear o tocar y qué cambia en cada uno. Esperá mi confirmación.
* **Tareas chicas:** una funcionalidad por vez. Si una tarea es muy grande, proponé partirla.
* **Código simple y legible:** preferí soluciones claras antes que abstracciones complejas. Comentá solo lo que no sea evidente.
* **Explicá lo que hacés:** al terminar cada tarea, explicame el flujo paso a paso y las decisiones que tomaste (y qué alternativas descartaste).
* **Pasos de prueba:** al terminar cada tarea, dame una lista de pasos para probarla a mano, incluyendo casos de error.
* **No avances de fase** hasta que la anterior esté probada y aprobada por mí.

Las reglas de Git, seguridad y comandos peligrosos están en `AGENTS.md` (en la raíz del repositorio) y se aplican siempre.

## 1. Resumen del Proyecto

* **Qué es:** Una plataforma web centralizada de carpooling para viajes de larga distancia.
* **Problema que resuelve:** Conecta a conductores que tienen asientos vacíos con pasajeros que necesitan viajar. Reemplaza la coordinación fragmentada en redes sociales con un sistema seguro y organizado.
* **Flujo principal:** Los conductores publican viajes (origen, destino, fecha, asientos, precio). Los pasajeros buscan, eligen sus asientos y abonan una seña del 15% a través de MercadoPago para confirmar la reserva. El inventario se actualiza en tiempo real. El resto del viaje se paga al conductor directamente, **fuera de la aplicación**.

## 2. Stack Tecnológico Estricto

* **Frontend:** React (JavaScript puro, sin TypeScript).
* **Backend:** Node.js con Express (JavaScript puro).
* **Base de Datos:** PostgreSQL, corriendo en un contenedor de **Docker** local (con `docker-compose.yml`). No se usan servicios de base de datos en la nube en esta etapa.
* **Autenticación:** **Propia, con JWT** (ver sección 7). No usar Supabase ni ningún servicio externo de autenticación.
* **Pagos (Señas):** API de MercadoPago (Checkout Pro o API directa para cobrar el 15% del valor total), probado con el entorno **sandbox**.
* **Estilos:** Tailwind CSS con componentes limpios y accesibles (ej. Shadcn UI o similar adaptado a React).

## 3. Funcionalidades del MVP

* **Autenticación:** Registro, inicio de sesión y cierre de sesión con JWT propio. Un mismo usuario puede ser conductor o pasajero.
* **Módulo de Conductor:**
  * Crear un viaje (Origen, Destino, Fecha/Hora, Asientos totales, Precio total por asiento).
  * Ver el listado de sus viajes y los pasajeros que han reservado.
* **Módulo de Pasajero:**
  * Buscador de viajes por ciudad y fecha.
  * Flujo de reserva: Al confirmar, se calcula el 15% del precio y se redirige a MercadoPago.
  * Ver sus reservas ("Mis reservas").
* **Sistema de Cancelaciones y Señas:**
  * Si un pasajero cancela su reserva, los asientos vuelven a estar disponibles automáticamente.
  * La seña no es reembolsable.
* **Sistema de Calificaciones:**
  * Al finalizar un viaje, el pasajero puede calificar al conductor (1 a 5 estrellas) y dejar una reseña breve, lo cual afectará el promedio público del conductor.

### Fuera de alcance del MVP (no implementar)
Chat entre usuarios, notificaciones por email o push, reembolsos, panel de administración, pagos del viaje completo dentro de la app, mapas o geolocalización.

## 4. Modelos de Datos (PostgreSQL)

* **users**
  * `id` (UUID, PK, `DEFAULT gen_random_uuid()`)
  * `email` (VARCHAR, UNIQUE, NOT NULL)
  * `password_hash` (VARCHAR, NOT NULL — nunca se devuelve en ninguna respuesta de la API)
  * `name` (VARCHAR, NOT NULL)
  * `phone` (VARCHAR, NOT NULL — vital para contacto post-pago; se pide en el registro)
  * `rating_average` (DECIMAL - promedio de calificaciones)
  * `created_at` (TIMESTAMP)

* **trips**
  * `id` (UUID, PK)
  * `driver_id` (UUID, FK -> users.id)
  * `origin_city` (VARCHAR)
  * `destination_city` (VARCHAR)
  * `departure_time` (TIMESTAMP)
  * `total_seats` (INT)
  * `available_seats` (INT)
  * `price_per_seat` (DECIMAL)
  * `status` (ENUM: 'scheduled', 'completed', 'cancelled')
  * `created_at` (TIMESTAMP)

* **bookings**
  * `id` (UUID, PK)
  * `trip_id` (UUID, FK -> trips.id)
  * `passenger_id` (UUID, FK -> users.id)
  * `seats_reserved` (INT)
  * `deposit_amount` (DECIMAL - el 15% cobrado)
  * `payment_id` (VARCHAR - ID de transacción de MercadoPago)
  * `status` (ENUM: 'pending', 'confirmed', 'cancelled_by_passenger')
  * `created_at` (TIMESTAMP)

* **reviews**
  * `id` (UUID, PK)
  * `trip_id` (UUID, FK -> trips.id)
  * `reviewer_id` (UUID, FK -> users.id)
  * `driver_id` (UUID, FK -> users.id)
  * `score` (INT - 1 a 5)
  * `comment` (TEXT)
  * `created_at` (TIMESTAMP)

El esquema se crea con scripts SQL versionados en `database/`. No usar referencias a `auth.users`, triggers ni políticas RLS de Supabase.

## 5. Reglas de Diseño (UI/UX)

* **Mobile-First:** La interfaz debe estar optimizada para teléfonos móviles (botones grandes, navegación inferior o menú hamburguesa claro).
* **Contacto post-pago:** El número de teléfono del conductor solo debe ser visible para el pasajero una vez que el estado del `booking` sea `confirmed` (MercadoPago aprobado).
* **Feedback:** Mostrar notificaciones claras (toasts/alertas) tras crear un viaje, error de pago, o cancelación exitosa.

## 6. Reglas de Código y Arquitectura

* **Separación de responsabilidades (API REST):** El backend de Node.js/Express debe exponer endpoints RESTful claros (`/api/auth`, `/api/trips`, `/api/bookings`, `/api/payments/webhook`). El frontend de React solo debe consumir estas rutas.
* **Arquitectura en capas en el backend:** `routes` → `controllers` → `services` (lógica de negocio) → acceso a datos (consultas a PostgreSQL). Los controllers no contienen lógica de negocio ni SQL.
* **Validación de entrada** en el backend para todos los endpoints (por ejemplo con Joi).
* **Transacciones en DB:** La reserva de un asiento debe manejarse con una transacción y bloqueo de la fila del viaje (`SELECT ... FOR UPDATE`) para evitar sobredemanda (race conditions): si dos personas reservan el último asiento a la vez, solo una debe lograrlo.
* **Webhooks de MercadoPago:**
  * La confirmación final de la reserva y la resta de `available_seats` se procesan a través del webhook.
  * **No confiar en el cuerpo del webhook:** consultar el estado real del pago a la API de MercadoPago usando el ID recibido antes de confirmar nada.
  * El procesamiento debe ser **idempotente** (si el mismo aviso llega dos veces, no se descuentan asientos dos veces).
  * En desarrollo se expone el servidor con ngrok para recibir los webhooks del sandbox.

## 7. Autenticación (JWT propio)

* **Registro:** `POST /api/auth/register` con `{ email, password, name, phone }`. Contraseña mínima de 8 caracteres. Si el email ya existe, responder 409.
* **Contraseñas:** hash con bcrypt (10 rondas). Nunca en texto plano ni en logs.
* **Login:** `POST /api/auth/login`. Ante cualquier fallo (email inexistente o contraseña incorrecta) responder **el mismo** 401 con el mensaje genérico "Credenciales inválidas".
* **Logout:** `POST /api/auth/logout` borra la cookie.
* **Sesión actual:** `GET /api/auth/me` devuelve el perfil del usuario autenticado.
* **Token:** JWT con `{ id, email }`, firmado con `JWT_SECRET`, vencimiento de 1 día (`JWT_EXPIRES_IN=1d`).
* **Cookie:** nombre `token`, `httpOnly`, `sameSite: 'lax'`, `secure` solo en producción, `maxAge` de 1 día. **Solo cookie:** no usar header `Authorization: Bearer` ni `localStorage`.
* **Frontend:** todas las peticiones con `credentials: 'include'`. Al cargar la app se consulta `/api/auth/me` para saber si hay sesión.
* **Protección de rutas:** middleware que lee `req.cookies.token`, verifica el JWT y deja `req.user`. Responder 401 "No autenticado" si falta, y 401 "Sesión expirada" si venció. Un middleware opcional permite acceso sin sesión en la búsqueda de viajes.
* **`JWT_SECRET`:** largo y aleatorio, generado con `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`. Solo en `.env`, nunca en el repositorio.

## 8. Variables de entorno

Detallar en archivos `.env.example` (backend y frontend), **sin valores reales**:

* Backend: `PORT`, `NODE_ENV`, `DATABASE_URL`, `FRONTEND_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, credenciales de MercadoPago (access token y public key de prueba), `BACKEND_PUBLIC_URL` (URL de ngrok para webhooks en desarrollo).
* Frontend: `VITE_API_URL`.

## 9. Fases de desarrollo

Cada fase termina probada, commiteada y aprobada antes de pasar a la siguiente.

0. **Base del proyecto:** estructura de carpetas (`frontend/`, `backend/`, `database/`), `docker-compose.yml` con PostgreSQL, `.gitignore`, `.env.example`, `AGENTS.md`, `README` inicial.
1. **Base de datos:** scripts SQL de las cuatro tablas y verificación de la conexión.
2. **Autenticación JWT:** registro, login, logout, `/me` y rutas protegidas.
3. **Viajes (conductor):** crear viaje y listar "mis viajes".
4. **Búsqueda (pasajero):** buscador por ciudad y fecha, y detalle de viaje.
5. **Reserva y pago de la seña:** reserva con transacción, redirección a MercadoPago sandbox y webhook de confirmación.
6. **Mis reservas y cancelaciones.**
7. **Calificaciones.**
8. **Pulido mobile-first, mensajes de error y README final.**

### Fase posterior (NO implementar ahora)
Dockerización completa de frontend y backend, pipeline de CI con GitHub Actions, despliegue en la nube y práctica con Kubernetes (minikube). Se hará una vez terminado y probado el MVP.

## 10. Directiva de inicio

Comenzá por la **Fase 0**, pero **primero presentá el plan** (estructura de carpetas, contenido del `docker-compose.yml`, variables de entorno y archivos que vas a crear) y esperá mi aprobación antes de crear nada. No pases a la Fase 1 sin que yo lo confirme.
