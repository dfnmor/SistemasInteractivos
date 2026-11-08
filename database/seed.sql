-- =============================================================================
-- PROYECTO: "Señas y Sonrisas" - Plataforma Interactiva de LSM y Articulación Oral
-- CLAVE DEL SISTEMA: TSI-2026-MEEXUU (MEEXUU Framework - Equipo ARDITAS)
-- ARCHIVO: /database/seed.sql (Datos Iniciales Oficiales para Demostración E2E)
-- =============================================================================

BEGIN;

-- Limpieza previa de datos conservando estructura y reiniciando secuencias SERIAL
TRUNCATE TABLE
    TABLA_CANJE_RECOMPENSA,
    TABLA_RECOMPENSA,
    TABLA_METRICA_INTENTO,
    TABLA_PROGRESO_CUENTO,
    TABLA_EJERCICIO_CUENTO,
    TABLA_CUENTO,
    TABLA_PERFIL,
    TABLA_TUTOR
RESTART IDENTITY CASCADE;

-- =============================================================================
-- 1. TUTOR (1 Tutor responsable de la cuenta)
-- =============================================================================
INSERT INTO TABLA_TUTOR (nombre, email, password_hash, fecha_registro) VALUES
('Laura Gómez (Mamá y Tutora Principal)', 'laura.gomez@meexuu.org', '$2b$10$MeexuuHashTutorDemo2026ArditaS1234567890', CURRENT_TIMESTAMP - INTERVAL '10 days');

-- =============================================================================
-- 2. PERFILES DE EJEMPLO (2 Perfiles: Sordera Parcial y Sordera Total)
-- =============================================================================
INSERT INTO TABLA_PERFIL (id_tutor, nombre_apodo, fecha_nacimiento, tipo_sordera, nivel_lectura, puntos_acumulados) VALUES
(1, 'Mateo (Sordera Parcial • Lector Inicial)', '2020-04-15', 'PARCIAL', 'LECTURA_INICIAL', 90),
(1, 'Sofía (Sordera Total • No Lectora)', '2020-08-22', 'TOTAL', 'NO_LECTOR', 70);

-- =============================================================================
-- 3. CATÁLOGO DE CUENTOS (9 Cuentos = 3 por cada Nivel de Lectura)
-- =============================================================================

-- NIVEL 1: NO_LECTOR (3 cuentos)
INSERT INTO TABLA_CUENTO (titulo, descripcion, tipo, nivel_lectura, orden_dificultad, num_palabras, imagen_portada, activo) VALUES
(
    'El Conejito y la Luna',
    'Acompaña al conejo Pepo a dar las buenas noches bajo las estrellas usando señas básicas de LSM.',
    'LSM',
    'NO_LECTOR',
    1,
    3,
    '🐰🌙',
    TRUE
),
(
    'Mis Primeros Saludos',
    'Aprende a saludar con tus manos a mamá, papá y amigos al despertar cada mañana.',
    'LSM',
    'NO_LECTOR',
    1,
    3,
    '👋🏽🌞',
    TRUE
),
(
    'Cantando con Mamá',
    'Descubre cómo juntar los labios suavemente para pronunciar fonemas bilabiales (/m/ - /a/) frente al espejo.',
    'ARTICULACION',
    'NO_LECTOR',
    1,
    2,
    '👩🏽‍🍼🎵',
    TRUE
),

-- NIVEL 2: LECTURA_INICIAL (3 cuentos)
(
    'El Gato Mimoso en Casa',
    'Milo el gatito explora su hogar y saluda a su familia con señas claras de animales y objetos cotidianos.',
    'LSM',
    'LECTURA_INICIAL',
    2,
    5,
    '🐱🏠',
    TRUE
),
(
    'Colores en el Parque',
    'Un paseo soleado descubriendo las señas de árbol, perro y pelota mientras jugamos en el parque.',
    'LSM',
    'LECTURA_INICIAL',
    2,
    5,
    '🌳🐕',
    TRUE
),
(
    'La Casa del Sol Brillante',
    'Practica la apertura vocálica y el soplo suave diciendo palabras sencillas como Casa, Sopa y Agua.',
    'ARTICULACION',
    'LECTURA_INICIAL',
    2,
    4,
    '☀️🏡',
    TRUE
),

-- NIVEL 3: LECTOR_AVANZADO (3 cuentos)
(
    'La Escuela de los Amigos',
    'Una aventura en el salón de clases donde compartimos libros, colores y saludos completos en LSM.',
    'LSM',
    'LECTOR_AVANZADO',
    3,
    8,
    '🏫📚',
    TRUE
),
(
    'Un Día con mi Familia',
    'Narrativa completa sobre desayunar juntos, agradecer y compartir momentos felices en LSM.',
    'LSM',
    'LECTOR_AVANZADO',
    3,
    8,
    '👨‍👩‍👧‍👦❤️',
    TRUE
),
(
    'El Viaje del Tren Sonoro',
    'Historias rimadas con apoyo labial en cámara lenta para fortalecer sílabas y ritmo fonético.',
    'ARTICULACION',
    'LECTOR_AVANZADO',
    3,
    7,
    '🚂✨',
    TRUE
);

-- =============================================================================
-- 4. EJERCICIOS POR CUENTO (Nodos de Interacción NUI/AR para los 9 cuentos)
-- =============================================================================
INSERT INTO TABLA_EJERCICIO_CUENTO (id_cuento, patron_referencia_id, palabra_o_sena, orden_en_cuento) VALUES
-- Cuento 1: El Conejito y la Luna (NO_LECTOR - LSM)
(1, 101, 'HOLA', 1),
(1, 102, 'LUNA', 2),
(1, 103, 'CONEJO', 3),
-- Cuento 2: Mis Primeros Saludos (NO_LECTOR - LSM)
(2, 104, 'MAMÁ', 1),
(2, 105, 'PAPÁ', 2),
(2, 106, 'ADIÓS', 3),
-- Cuento 3: Cantando con Mamá (NO_LECTOR - ARTICULACION)
(3, 107, 'MA-MÁ', 1),
(3, 108, 'PA-PÁ', 2),
(3, 109, 'A-MOR', 3),
-- Cuento 4: El Gato Mimoso en Casa (LECTURA_INICIAL - LSM)
(4, 201, 'GATO', 1),
(4, 202, 'CASA', 2),
(4, 203, 'AMIGO', 3),
-- Cuento 5: Colores en el Parque (LECTURA_INICIAL - LSM)
(5, 204, 'ÁRBOL', 1),
(5, 205, 'PERRO', 2),
(5, 206, 'PELOTA', 3),
-- Cuento 6: La Casa del Sol Brillante (LECTURA_INICIAL - ARTICULACION)
(6, 207, 'CA-SA', 1),
(6, 208, 'SO-PA', 2),
(6, 209, 'A-GUA', 3),
-- Cuento 7: La Escuela de los Amigos (LECTOR_AVANZADO - LSM)
(7, 301, 'BUENOS DÍAS', 1),
(7, 302, 'LIBRO', 2),
(7, 303, 'GRACIAS', 3),
-- Cuento 8: Un Día con mi Familia (LECTOR_AVANZADO - LSM)
(8, 304, 'FAMILIA', 1),
(8, 305, 'COMER', 2),
(8, 306, 'FELIZ', 3),
-- Cuento 9: El Viaje del Tren Sonoro (LECTOR_AVANZADO - ARTICULACION)
(9, 307, 'ES-TRE-LLA', 1),
(9, 308, 'SON-RI-SA', 2),
(9, 309, 'A-MI-GOS', 3);

-- =============================================================================
-- 5. CATÁLOGO DE RECOMPENSAS (3 Recompensas Desbloqueables por Puntos)
-- =============================================================================
INSERT INTO TABLA_RECOMPENSA (nombre, costo_puntos, icono_url) VALUES
('Super Estrella Dorada', 30, '⭐'),
('Manita Maestra LSM', 50, '🖐️'),
('Trofeo Voz Clara', 80, '🎙️');

-- =============================================================================
-- 6. PROGRESO, MÉTRICAS DE INTENTOS Y CANJES INICIALES PARA EL DASHBOARD
-- =============================================================================
INSERT INTO TABLA_PROGRESO_CUENTO (id_perfil, id_cuento, estado, puntos_obtenidos, fecha_completado) VALUES
(1, 1, 'COMPLETADO', 30, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 4, 'EN_PROGRESO', 20, NULL),
(2, 1, 'COMPLETADO', 30, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 2, 'EN_PROGRESO', 15, NULL);

INSERT INTO TABLA_METRICA_INTENTO (id_perfil, id_ejercicio, porcentaje_precision, resultado, puntos_otorgados, fecha_hora) VALUES
(1, 1, 91.50, 'CORRECTO', 25, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 2, 64.00, 'REINTENTO', 0, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 2, 88.00, 'CORRECTO', 25, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 10, 94.00, 'CORRECTO', 25, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 1, 89.00, 'CORRECTO', 25, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 4, 92.50, 'CORRECTO', 25, CURRENT_TIMESTAMP - INTERVAL '12 hours');

INSERT INTO TABLA_CANJE_RECOMPENSA (id_perfil, id_recompensa, fecha_canje) VALUES
(1, 1, CURRENT_TIMESTAMP - INTERVAL '1 day');

COMMIT;
