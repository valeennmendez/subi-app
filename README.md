# Subi

Subi es una plataforma web de carpooling para viajes de larga distancia. Conecta
conductores con asientos libres con pasajeros que necesitan viajar: los
conductores publican viajes y los pasajeros reservan asientos pagando una seña
del 15% con MercadoPago. El resto del viaje se paga al conductor fuera de la app.

## Stack

- Frontend: React + Vite + Tailwind CSS (JavaScript)
- Backend: Node.js + Express (JavaScript)
- Base de datos: PostgreSQL en Docker
- Autenticación: JWT propio en cookie httpOnly
- Pagos: MercadoPago sandbox

## Estado

Fase 0: base del proyecto. Todavía no hay código de frontend ni de backend.

## Requisitos

- Docker Desktop con Docker Compose
- Node.js (para las fases siguientes)

## Variables de entorno

### Base de datos (raíz)

1. Copiá `.env.example` a `.env` en la raíz.
2. Completá `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB`.
3. El puerto del host es `5433` por defecto; podés cambiarlo con `POSTGRES_HOST_PORT`.

El `.env` de la raíz es el que usa `docker-compose.yml` y no se commitea.
Estos mismos valores deben coincidir con el `DATABASE_URL` de `backend/.env`:

```dotenv
DATABASE_URL=postgres://tu_usuario:tu_password@localhost:5433/tu_base_de_datos
```

### Aplicaciones

Cada aplicación tiene su `.env.example`. Copialo a `.env` y completá los valores:

- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`

Nunca commitees los archivos `.env`.

## Levantar la base de datos

Desde la raíz del repositorio:

```bash
docker compose up -d
docker compose ps
docker compose logs -f postgres
```

PostgreSQL queda disponible en `localhost:5433` (o el puerto configurado en
`POSTGRES_HOST_PORT`) con la base indicada en `POSTGRES_DB`. El contenedor
escucha internamente en el puerto `5432`.

Si falta alguna variable obligatoria, Compose falla con un mensaje que indica
cuál falta.

## Detener la base de datos

```bash
docker compose stop
docker compose down
```

`docker compose down` conserva los datos en el volumen `postgres_data`.

Existe una opción de `docker compose down` que además elimina el volumen
`postgres_data` y, con él, todos los datos de la base. Usala solo a propósito,
cuando realmente quieras borrar la base.
