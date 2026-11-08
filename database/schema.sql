-- =============================================================================
-- PROYECTO: "Señas y Sonrisas" - Plataforma Interactiva de LSM y Articulación Oral
-- CLAVE DEL SISTEMA: TSI-2026-MEEXUU (MEEXUU Framework - Equipo ARDITAS)
-- DESCRIPCIÓN: Esquema relacional oficial (Fase 2 - Actividad 7) en PostgreSQL 15+
-- =============================================================================

BEGIN;

-- Limpieza preventiva para ejecuciones idempotentes en desarrollo
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
-- 1. DEFINICIÓN DE TIPOS ENUMERADOS (DOMINIOS ADAPTATIVOS DUA / MEEXUU)
-- =============================================================================

-- Condición auditiva del infante (Sordera Total -> LSM prioritario; Parcial -> LSM + Articulación Oral)
CREATE TYPE tipo_sordera_enum AS ENUM ('TOTAL', 'PARCIAL');

-- Nivel de alfabetización / lectura para filtrado dinámico de interfaz (DUA Principio 1)
CREATE TYPE nivel_lectura_enum AS ENUM ('NO_LECTOR', 'LECTURA_INICIAL', 'LECTOR_AVANZADO');

-- Módulo pedagógico al que pertenece el cuento (RF-03, RF-04, RF-08)
CREATE TYPE tipo_cuento_enum AS ENUM ('LSM', 'ARTICULACION');

-- Estado de avance del niño en cada cuento interactivo (RF-02)
CREATE TYPE estado_progreso_enum AS ENUM ('EN_PROGRESO', 'COMPLETADO');

-- Evaluación no punitiva del intento por visión artificial (RF-07, RNF-08: sin estado de "fallo")
CREATE TYPE resultado_intento_enum AS ENUM ('CORRECTO', 'REINTENTO');

-- =============================================================================
-- 2. TABLAS DEL MODELO ENTIDAD-RELACIÓN (FASE 2 - ACTIVIDAD 7)
-- =============================================================================

-- 2.1 TABLA_TUTOR: Padre, madre, tutor legal o terapeuta responsable de la cuenta (Actor 2 / CU-02)
CREATE TABLE TABLA_TUTOR (
    id_tutor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 TABLA_PERFIL: Perfiles adaptativos del niño de ~6 años con hipoacusia (Actor 1 / CU-01, CU-02)
CREATE TABLE TABLA_PERFIL (
    id_perfil SERIAL PRIMARY KEY,
    id_tutor INT NOT NULL REFERENCES TABLA_TUTOR(id_tutor) ON DELETE CASCADE,
    nombre_apodo VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    tipo_sordera tipo_sordera_enum NOT NULL,
    nivel_lectura nivel_lectura_enum NOT NULL,
    puntos_acumulados INT NOT NULL DEFAULT 0 CHECK (puntos_acumulados >= 0)
);

-- Vista auto-actualizable para compatibilidad dual entre TABLA_PERFIL y TABLA_PERFIL_NINO (Diagrama E-R Act. 7)
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

-- 2.3 TABLA_CUENTO: Catálogo progresivo de cuentos interactivos por módulo y nivel de lectura (RF-04, RF-05, RF-08)
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

-- 2.4 TABLA_EJERCICIO_CUENTO: Nodos de interacción con cámara (NUI/AR) dentro de cada cuento (RF-06, RF-09)
CREATE TABLE TABLA_EJERCICIO_CUENTO (
    id_ejercicio SERIAL PRIMARY KEY,
    id_cuento INT NOT NULL REFERENCES TABLA_CUENTO(id_cuento) ON DELETE CASCADE,
    patron_referencia_id INT NOT NULL,
    palabra_o_sena VARCHAR(200) NOT NULL,
    orden_en_cuento INT NOT NULL
);

-- 2.5 TABLA_PROGRESO_CUENTO: Seguimiento de cuentos en curso y completados por perfil infantil (RF-02, CU-04)
CREATE TABLE TABLA_PROGRESO_CUENTO (
    id_progreso SERIAL PRIMARY KEY,
    id_perfil INT NOT NULL REFERENCES TABLA_PERFIL(id_perfil) ON DELETE CASCADE,
    id_cuento INT NOT NULL REFERENCES TABLA_CUENTO(id_cuento) ON DELETE CASCADE,
    estado estado_progreso_enum NOT NULL DEFAULT 'EN_PROGRESO',
    puntos_obtenidos INT NOT NULL DEFAULT 0 CHECK (puntos_obtenidos >= 0),
    fecha_completado TIMESTAMP,
    CONSTRAINT uq_progreso_perfil_cuento UNIQUE (id_perfil, id_cuento)
);

-- 2.6 TABLA_METRICA_INTENTO: Registro de precisión de visión artificial y articulación oral (RF-07, RF-12, CU-05, CU-06)
CREATE TABLE TABLA_METRICA_INTENTO (
    id_intento SERIAL PRIMARY KEY,
    id_perfil INT NOT NULL REFERENCES TABLA_PERFIL(id_perfil) ON DELETE CASCADE,
    id_ejercicio INT NOT NULL REFERENCES TABLA_EJERCICIO_CUENTO(id_ejercicio) ON DELETE CASCADE,
    porcentaje_precision DECIMAL(5,2) NOT NULL CHECK (porcentaje_precision >= 0.00 AND porcentaje_precision <= 100.00),
    resultado resultado_intento_enum NOT NULL,
    puntos_otorgados INT NOT NULL DEFAULT 0 CHECK (puntos_otorgados >= 0),
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.7 TABLA_RECOMPENSA: Catálogo de insignias, trofeos y accesorios desbloqueables (RF-10, RF-11, CU-09)
CREATE TABLE TABLA_RECOMPENSA (
    id_recompensa SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    costo_puntos INT NOT NULL CHECK (costo_puntos >= 0),
    icono_url VARCHAR(500) NOT NULL
);

-- 2.8 TABLA_CANJE_RECOMPENSA: Historial de recompensas desbloqueadas por cada niño (RF-11, CU-09)
CREATE TABLE TABLA_CANJE_RECOMPENSA (
    id_canje SERIAL PRIMARY KEY,
    id_perfil INT NOT NULL REFERENCES TABLA_PERFIL(id_perfil) ON DELETE CASCADE,
    id_recompensa INT NOT NULL REFERENCES TABLA_RECOMPENSA(id_recompensa) ON DELETE CASCADE,
    fecha_canje TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_canje_perfil_recompensa UNIQUE (id_perfil, id_recompensa)
);

-- =============================================================================
-- 3. ÍNDICES DE RENDIMIENTO PARA RESPUESTA OPORTUNA (RNF-03: 1-2 SEGUNDOS)
-- =============================================================================
CREATE INDEX idx_perfil_tutor ON TABLA_PERFIL(id_tutor);
CREATE INDEX idx_cuento_filtros ON TABLA_CUENTO(tipo, nivel_lectura, activo);
CREATE INDEX idx_ejercicio_cuento ON TABLA_EJERCICIO_CUENTO(id_cuento, orden_en_cuento);
CREATE INDEX idx_progreso_perfil ON TABLA_PROGRESO_CUENTO(id_perfil, estado);
CREATE INDEX idx_metrica_perfil_fecha ON TABLA_METRICA_INTENTO(id_perfil, fecha_hora DESC);
CREATE INDEX idx_canje_perfil ON TABLA_CANJE_RECOMPENSA(id_perfil);

-- =============================================================================
-- 4. POBLADO DE DATOS SEMILLA OFICIALES (MEEXUU FRAMEWORK - FASE 1 Y FASE 2)
-- =============================================================================

-- 4.1 Tutores y Especialistas (Inclusion Partners)
INSERT INTO TABLA_TUTOR (nombre, email, password_hash, fecha_registro) VALUES
('Laura Gómez (Mamá de Mateo)', 'laura.gomez@meexuu.org', '$2b$10$MeexuuHashTutorDemo2026ArditaS1234567890', CURRENT_TIMESTAMP - INTERVAL '14 days'),
('Terapeuta Lic. Valeria Méndez', 'valeria.terapeuta@meexuu.org', '$2b$10$MeexuuHashTerapeutaDemo2026ArditaS0987', CURRENT_TIMESTAMP - INTERVAL '10 days');

-- 4.2 Los 4 Perfiles Adaptativos del Niño (Fase 1, Actividad 3, Página 9)
-- Perfil 1 (Niño A): Mateo - 6 años, Hipoacusia Parcial, Alfabetización Inicial (Protagonista del Mockup Act. 6)
-- Perfil 2 (Niño B): Sofía - 6 años, Hipoacusia Completa (Total), No Lectora (Flujos basados en iconografía)
-- Perfil 3 (Niño C): Leo - 6 años, Hipoacusia Parcial + Audífono, Lectura Inicial (Subtítulos sincronizados + Articulación)
-- Perfil 4 (Niño D): Valentina - 6 años, Hipoacusia Completa + LSM Nativa, Lectora Avanzada (Ambiente bilingüe LSM + Español)
INSERT INTO TABLA_PERFIL (id_tutor, nombre_apodo, fecha_nacimiento, tipo_sordera, nivel_lectura, puntos_acumulados) VALUES
(1, 'Mateo (Niño A: Lector Inicial)', '2020-04-15', 'PARCIAL', 'LECTURA_INICIAL', 120),
(1, 'Sofía (Niño B: No Lectora)', '2020-08-22', 'TOTAL', 'NO_LECTOR', 85),
(2, 'Leo (Niño C: Parcial + Audífono)', '2020-02-10', 'PARCIAL', 'LECTURA_INICIAL', 95),
(2, 'Valentina (Niño D: LSM Nativa)', '2019-11-30', 'TOTAL', 'LECTOR_AVANZADO', 160);

-- 4.3 Catálogo de Cuentos por Módulo y Nivel de Lectura (Fase 2, Actividad 6 y Actividad 8)
INSERT INTO TABLA_CUENTO (titulo, descripcion, tipo, nivel_lectura, orden_dificultad, num_palabras, imagen_portada, activo) VALUES
(
    'El Conejito y la Luna',
    'Acompaña al conejo Pepo a descubrir cómo dar las buenas noches usando Lengua de Señas Mexicana bajo las estrellas.',
    'LSM',
    'NO_LECTOR',
    1,
    3,
    '/assets/cuentos/conejito-luna.svg',
    TRUE
),
(
    'El Gato Mimoso en Casa',
    'Milo el gatito explora su hogar y saluda a su familia con señas claras de animales y objetos cotidianos.',
    'LSM',
    'LECTURA_INICIAL',
    2,
    5,
    '/assets/cuentos/gato-mimoso.svg',
    TRUE
),
(
    'La Escuela de los Amigos',
    'Una aventura en el salón de clases donde compartimos libros, colores y saludos completos en LSM.',
    'LSM',
    'LECTOR_AVANZADO',
    3,
    8,
    '/assets/cuentos/escuela-amigos.svg',
    TRUE
),
(
    'Cantando con Mamá',
    'Descubre cómo juntar los labios suavemente para pronunciar fonemas bilabiales (/m/ - /a/) junto a Mamá.',
    'ARTICULACION',
    'NO_LECTOR',
    1,
    2,
    '/assets/cuentos/cantando-mama.svg',
    TRUE
),
(
    'La Casa del Sol Brillante',
    'Practica la apertura vocálica y el soplo suave diciendo palabras sencillas como Casa, Sol y Agua frente al espejo AR.',
    'ARTICULACION',
    'LECTURA_INICIAL',
    2,
    4,
    '/assets/cuentos/casa-sol.svg',
    TRUE
),
(
    'El Viaje del Tren Sonoro',
    'Historias rimadas con apoyo labial en cámara lenta para fortalecer sílabas trabadas y ritmo fonético.',
    'ARTICULACION',
    'LECTOR_AVANZADO',
    3,
    7,
    '/assets/cuentos/tren-sonoro.svg',
    TRUE
);

-- 4.4 Ejercicios de Cuentos (Nodos de Interacción NUI/AR - Fase 1 Act. 6 y Fase 2 Act. 6)
INSERT INTO TABLA_EJERCICIO_CUENTO (id_cuento, patron_referencia_id, palabra_o_sena, orden_en_cuento) VALUES
-- Cuento 1: El Conejito y la Luna (LSM - Nivel 1)
(1, 101, 'HOLA (Saludo)', 1),
(1, 102, 'LUNA', 2),
(1, 103, 'CONEJO', 3),
-- Cuento 2: El Gato Mimoso en Casa (LSM - Nivel 2)
(2, 201, 'GATO', 1),
(2, 202, 'CASA', 2),
(2, 203, 'AMIGO', 3),
-- Cuento 3: La Escuela de los Amigos (LSM - Nivel 3)
(3, 301, 'BUENOS DÍAS', 1),
(3, 302, 'LIBRO', 2),
(3, 303, 'GRACIAS', 3),
-- Cuento 4: Cantando con Mamá (Articulación Oral - Nivel 1)
(4, 401, '/m/ - /a/ • MA-MÁ', 1),
(4, 402, '/p/ - /a/ • PA-PÁ', 2),
-- Cuento 5: La Casa del Sol Brillante (Articulación Oral - Nivel 2)
(5, 501, 'CA-SA', 1),
(5, 502, 'SO-PA', 2),
(5, 503, 'A-GUA', 3),
-- Cuento 6: El Viaje del Tren Sonoro (Articulación Oral - Nivel 3)
(6, 601, 'ES-TRE-LLA', 1),
(6, 602, 'SON-RI-SA', 2);

-- 4.5 Progreso Inicial en Cuentos
INSERT INTO TABLA_PROGRESO_CUENTO (id_perfil, id_cuento, estado, puntos_obtenidos, fecha_completado) VALUES
(1, 1, 'EN_PROGRESO', 60, NULL),
(1, 2, 'COMPLETADO', 40, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 4, 'COMPLETADO', 20, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 1, 'COMPLETADO', 85, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(3, 4, 'COMPLETADO', 50, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 5, 'EN_PROGRESO', 45, NULL),
(4, 3, 'COMPLETADO', 100, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- 4.6 Métricas de Intentos de Visión Artificial (Simulación y Tracking NUI/AR)
INSERT INTO TABLA_METRICA_INTENTO (id_perfil, id_ejercicio, porcentaje_precision, resultado, puntos_otorgados, fecha_hora) VALUES
(1, 1, 88.00, 'CORRECTO', 20, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(1, 2, 74.50, 'REINTENTO', 10, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(1, 2, 91.20, 'CORRECTO', 20, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(1, 4, 94.00, 'CORRECTO', 25, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 10, 89.50, 'CORRECTO', 25, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1, 12, 86.40, 'CORRECTO', 20, CURRENT_TIMESTAMP - INTERVAL '6 hours'),
(2, 1, 92.00, 'CORRECTO', 30, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 3, 85.00, 'CORRECTO', 25, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(3, 10, 90.00, 'CORRECTO', 25, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(4, 7, 96.50, 'CORRECTO', 35, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- 4.7 Catálogo de Recompensas y Trofeos (Mockup Act. 6: Super Estrella, Manita Maestra, Voz Clara)
INSERT INTO TABLA_RECOMPENSA (nombre, costo_puntos, icono_url) VALUES
('Super Estrella', 30, '⭐'),
('Manita Maestra', 50, '🖐️'),
('Voz Clara', 50, '🎙️'),
('Conejito Lunar Guardián', 80, '🐰'),
('Corona de Arcoíris DUA', 100, '👑'),
('Gafas de Explorador AR', 120, '🥽');

-- 4.8 Canjes de Recompensas Iniciales
INSERT INTO TABLA_CANJE_RECOMPENSA (id_perfil, id_recompensa, fecha_canje) VALUES
(1, 1, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(1, 2, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 1, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(4, 1, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(4, 2, CURRENT_TIMESTAMP - INTERVAL '1 day');

COMMIT;
