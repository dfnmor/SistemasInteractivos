-- =============================================================================
-- PROYECTO: "Señas y Sonrisas" - Plataforma Interactiva de LSM y Articulación Oral
-- CLAVE DEL SISTEMA: TSI-2026-MEEXUU (MEEXUU Framework - Equipo ARDITAS)
-- ARCHIVO: /database/schema.sql (DDL Estructural - Actividad 7)
-- =============================================================================

BEGIN;

-- Limpieza preventiva idempotente
DROP VIEW IF EXISTS TABLA_PERFIL_NINO CASCADE;
DROP TABLE IF EXISTS TABLA_CANJE_RECOMPENSA CASCADE;
DROP TABLE IF EXISTS TABLA_RECOMPENSA CASCADE;
DROP TABLE IF EXISTS TABLA_METRICA_INTENTO CASCADE;
DROP TABLE IF EXISTS TABLA_PROGRESO_CUENTO CASCADE;
DROP TABLE IF EXISTS TABLA_EJERCICIO_CUENTO CASCADE;
DROP TABLE IF EXISTS TABLA_CUENTO CASCADE;
DROP TABLE IF EXISTS TABLA_PERFIL CASCADE;
DROP TABLE IF EXISTS TABLA_TUTOR CASCADE;

DROP TYPE IF EXISTS resultado_intento_enum CASCADE;
DROP TYPE IF EXISTS estado_progreso_enum CASCADE;
DROP TYPE IF EXISTS tipo_cuento_enum CASCADE;
DROP TYPE IF EXISTS nivel_lectura_enum CASCADE;
DROP TYPE IF EXISTS tipo_sordera_enum CASCADE;

-- =============================================================================
-- 1. TIPOS ENUMERADOS (DOMINIOS ADAPTATIVOS DUA / MEEXUU)
-- =============================================================================
CREATE TYPE tipo_sordera_enum AS ENUM ('TOTAL', 'PARCIAL');
CREATE TYPE nivel_lectura_enum AS ENUM ('NO_LECTOR', 'LECTURA_INICIAL', 'LECTOR_AVANZADO');
CREATE TYPE tipo_cuento_enum AS ENUM ('LSM', 'ARTICULACION');
CREATE TYPE estado_progreso_enum AS ENUM ('EN_PROGRESO', 'COMPLETADO');
CREATE TYPE resultado_intento_enum AS ENUM ('CORRECTO', 'REINTENTO');

-- =============================================================================
-- 2. TABLAS RELACIONALES (ACTIVIDAD 7)
-- =============================================================================

CREATE TABLE TABLA_TUTOR (
    id_tutor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TABLA_PERFIL (
    id_perfil SERIAL PRIMARY KEY,
    id_tutor INT NOT NULL REFERENCES TABLA_TUTOR(id_tutor) ON DELETE CASCADE,
    nombre_apodo VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    tipo_sordera tipo_sordera_enum NOT NULL,
    nivel_lectura nivel_lectura_enum NOT NULL,
    puntos_acumulados INT NOT NULL DEFAULT 0 CHECK (puntos_acumulados >= 0)
);

-- Vista auto-actualizable para compatibilidad dual entre TABLA_PERFIL y TABLA_PERFIL_NINO
CREATE OR REPLACE VIEW TABLA_PERFIL_NINO AS
SELECT
    id_perfil,
    id_tutor,
    nombre_apodo,
    fecha_nacimiento,
    tipo_sordera,
    nivel_lectura,
    puntos_acumulados
FROM TABLA_PERFIL;

CREATE TABLE TABLA_CUENTO (
    id_cuento SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    tipo tipo_cuento_enum NOT NULL,
    nivel_lectura nivel_lectura_enum NOT NULL,
    orden_dificultad INT NOT NULL,
    num_palabras INT NOT NULL DEFAULT 1 CHECK (num_palabras > 0),
    imagen_portada VARCHAR(500),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE TABLA_EJERCICIO_CUENTO (
    id_ejercicio SERIAL PRIMARY KEY,
    id_cuento INT NOT NULL REFERENCES TABLA_CUENTO(id_cuento) ON DELETE CASCADE,
    patron_referencia_id INT NOT NULL,
    palabra_o_sena VARCHAR(200) NOT NULL,
    orden_en_cuento INT NOT NULL
);

CREATE TABLE TABLA_PROGRESO_CUENTO (
    id_progreso SERIAL PRIMARY KEY,
    id_perfil INT NOT NULL REFERENCES TABLA_PERFIL(id_perfil) ON DELETE CASCADE,
    id_cuento INT NOT NULL REFERENCES TABLA_CUENTO(id_cuento) ON DELETE CASCADE,
    estado estado_progreso_enum NOT NULL DEFAULT 'EN_PROGRESO',
    puntos_obtenidos INT NOT NULL DEFAULT 0 CHECK (puntos_obtenidos >= 0),
    fecha_completado TIMESTAMP,
    CONSTRAINT uq_progreso_perfil_cuento UNIQUE (id_perfil, id_cuento)
);

CREATE TABLE TABLA_METRICA_INTENTO (
    id_intento SERIAL PRIMARY KEY,
    id_perfil INT NOT NULL REFERENCES TABLA_PERFIL(id_perfil) ON DELETE CASCADE,
    id_ejercicio INT NOT NULL REFERENCES TABLA_EJERCICIO_CUENTO(id_ejercicio) ON DELETE CASCADE,
    porcentaje_precision DECIMAL(5,2) NOT NULL CHECK (porcentaje_precision >= 0.00 AND porcentaje_precision <= 100.00),
    resultado resultado_intento_enum NOT NULL,
    puntos_otorgados INT NOT NULL DEFAULT 0 CHECK (puntos_otorgados >= 0),
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TABLA_RECOMPENSA (
    id_recompensa SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    costo_puntos INT NOT NULL CHECK (costo_puntos >= 0),
    icono_url VARCHAR(500) NOT NULL
);

CREATE TABLE TABLA_CANJE_RECOMPENSA (
    id_canje SERIAL PRIMARY KEY,
    id_perfil INT NOT NULL REFERENCES TABLA_PERFIL(id_perfil) ON DELETE CASCADE,
    id_recompensa INT NOT NULL REFERENCES TABLA_RECOMPENSA(id_recompensa) ON DELETE CASCADE,
    fecha_canje TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_canje_perfil_recompensa UNIQUE (id_perfil, id_recompensa)
);

-- =============================================================================
-- 3. ÍNDICES DE RENDIMIENTO (RNF-03)
-- =============================================================================
CREATE INDEX idx_perfil_tutor ON TABLA_PERFIL(id_tutor);
CREATE INDEX idx_cuento_filtros ON TABLA_CUENTO(tipo, nivel_lectura, activo);
CREATE INDEX idx_ejercicio_cuento ON TABLA_EJERCICIO_CUENTO(id_cuento, orden_en_cuento);
CREATE INDEX idx_progreso_perfil ON TABLA_PROGRESO_CUENTO(id_perfil, estado);
CREATE INDEX idx_metrica_perfil_fecha ON TABLA_METRICA_INTENTO(id_perfil, fecha_hora DESC);
CREATE INDEX idx_canje_perfil ON TABLA_CANJE_RECOMPENSA(id_perfil);

COMMIT;
