-- ============================================================
-- day-planner-backend — database schema
-- PostgreSQL (Neon)
--
-- Run order matters (foreign keys): users → trips → scheduled_stops.
-- This file builds a fresh database from scratch; run it as-is against
-- an empty database (e.g. the test database).
-- ============================================================


-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name     TEXT         NOT NULL,
    last_name      TEXT         NOT NULL,
    email          TEXT         UNIQUE NOT NULL,
    password_hash  VARCHAR(60)  NOT NULL,  -- bcrypt output is always 60 chars
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Case-insensitive uniqueness. The inline UNIQUE above catches exact
-- duplicates; this functional index catches case variants, so
-- James@X.com and james@x.com cannot both register.
-- Expression indexes cannot be declared inside CREATE TABLE.
CREATE UNIQUE INDEX users_email_lower_idx ON users (LOWER(email));


-- ------------------------------------------------------------
-- trips
-- One row per planned trip. Immutable pipeline output: there is no
-- UPDATE path by design — editing means DELETE + re-POST.
-- ------------------------------------------------------------
CREATE TABLE trips (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_text        TEXT         NOT NULL,
    date            DATE         NOT NULL,
    transport_mode  TEXT         NOT NULL
                                 CHECK (transport_mode IN ('driving', 'walking', 'transit')),
    day_start       TIME         NOT NULL,
    day_end         TIME         NOT NULL,
    feasible        BOOLEAN      NOT NULL,
    summary         TEXT         NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Look up a user's trips (list view) efficiently.
CREATE INDEX trips_user_id_idx ON trips (user_id);


-- ------------------------------------------------------------
-- scheduled_stops
-- Child rows of a trip. ON DELETE CASCADE means deleting a trip
-- removes its stops automatically, and deleting a user removes
-- their trips and, transitively, those trips' stops.
--
-- stop_order is required: SQL has no inherent row order, so reads
-- must ORDER BY it explicitly.
-- ------------------------------------------------------------
CREATE TABLE scheduled_stops (
    id                      UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id                 UUID              NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    stop_order              INTEGER           NOT NULL,
    name                    TEXT              NOT NULL,
    event                   TEXT,
    address                 TEXT,
    place_id                TEXT,
    lat                     DOUBLE PRECISION  NOT NULL,
    lng                     DOUBLE PRECISION  NOT NULL,
    arrival_time            TIME              NOT NULL,
    departure_time          TIME              NOT NULL,
    travel_to_next_minutes  INTEGER
);

-- Fetch a trip's stops in order (detail view / getTrip subquery).
CREATE INDEX scheduled_stops_trip_id_idx ON scheduled_stops (trip_id);

