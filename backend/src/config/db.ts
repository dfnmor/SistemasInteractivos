import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import {
  Tutor,
  PerfilNino,
  Cuento,
  EjercicioCuento,
  ProgresoCuento,
  MetricaIntento,
  Recompensa,
  CanjeRecompensa,
} from '../models/types';

dotenv.config();

/**
 * Configuración del Pool de PostgreSQL (`db_meexuu`)
 */
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'db_meexuu',
  user: process.env.DB_USER || 'meexuu_admin',
  password: process.env.DB_PASSWORD || 'meexuu_secret_2026',
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.warn('[DB Pool Warning] Error inesperado en cliente inactivo de PostgreSQL:', err.message);
});

/**
 * Verificación de salud de la conexión con PostgreSQL (Docker `db_meexuu`)
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  database: string;
  serverTime?: string;
  mode: 'postgresql' | 'in-memory-fallback';
  error?: string;
}> {
  const dbName = process.env.DB_NAME || 'db_meexuu';
  try {
    const result = await pool.query('SELECT NOW() as server_time, current_database() as db_name');
    return {
      connected: true,
      database: result.rows[0]?.db_name || dbName,
      serverTime: result.rows[0]?.server_time,
      mode: 'postgresql',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error de conexión desconocido';
    return {
      connected: false,
      database: dbName,
      mode: 'in-memory-fallback',
      error: message,
    };
  }
}

/**
 * Helper para ejecutar consultas SQL en PostgreSQL
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

/**
 * Respaldo sincronizado con /database/seed.sql (1 tutor, 2 perfiles, 9 cuentos, 27 ejercicios, 3 recompensas)
 */
export const fallbackStore: {
  tutores: Tutor[];
  perfiles: PerfilNino[];
  cuentos: Cuento[];
  ejercicios: EjercicioCuento[];
  progresos: ProgresoCuento[];
  metricas: MetricaIntento[];
  recompensas: Recompensa[];
  canjes: CanjeRecompensa[];
} = {
  tutores: [
    {
      id_tutor: 1,
      nombre: 'Laura Gómez (Mamá y Tutora Principal)',
      email: 'laura.gomez@meexuu.org',
      fecha_registro: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ],
  perfiles: [
    {
      id_perfil: 1,
      id_tutor: 1,
      nombre_apodo: 'Mateo (Sordera Parcial • Lector Inicial)',
      fecha_nacimiento: '2020-04-15',
      tipo_sordera: 'PARCIAL',
      nivel_lectura: 'LECTURA_INICIAL',
      puntos_acumulados: 90,
    },
    {
      id_perfil: 2,
      id_tutor: 1,
      nombre_apodo: 'Sofía (Sordera Total • No Lectora)',
      fecha_nacimiento: '2020-08-22',
      tipo_sordera: 'TOTAL',
      nivel_lectura: 'NO_LECTOR',
      puntos_acumulados: 70,
    },
  ],
  cuentos: [
    {
      id_cuento: 1,
      titulo: 'El Conejito y la Luna',
      descripcion: 'Acompaña al conejo Pepo a dar las buenas noches bajo las estrellas usando señas básicas de LSM.',
      tipo: 'LSM',
      nivel_lectura: 'NO_LECTOR',
      orden_dificultad: 1,
      num_palabras: 3,
      imagen_portada: '🐰🌙',
      activo: true,
    },
    {
      id_cuento: 2,
      titulo: 'Mis Primeros Saludos',
      descripcion: 'Aprende a saludar con tus manos a mamá, papá y amigos al despertar cada mañana.',
      tipo: 'LSM',
      nivel_lectura: 'NO_LECTOR',
      orden_dificultad: 1,
      num_palabras: 3,
      imagen_portada: '👋🏽🌞',
      activo: true,
    },
    {
      id_cuento: 3,
      titulo: 'Cantando con Mamá',
      descripcion: 'Descubre cómo juntar los labios suavemente para pronunciar fonemas bilabiales (/m/ - /a/) frente al espejo.',
      tipo: 'ARTICULACION',
      nivel_lectura: 'NO_LECTOR',
      orden_dificultad: 1,
      num_palabras: 2,
      imagen_portada: '👩🏽‍🍼🎵',
      activo: true,
    },
    {
      id_cuento: 4,
      titulo: 'El Gato Mimoso en Casa',
      descripcion: 'Milo el gatito explora su hogar y saluda a su familia con señas claras de animales y objetos cotidianos.',
      tipo: 'LSM',
      nivel_lectura: 'LECTURA_INICIAL',
      orden_dificultad: 2,
      num_palabras: 5,
      imagen_portada: '🐱🏠',
      activo: true,
    },
    {
      id_cuento: 5,
      titulo: 'Colores en el Parque',
      descripcion: 'Un paseo soleado descubriendo las señas de árbol, perro y pelota mientras jugamos en el parque.',
      tipo: 'LSM',
      nivel_lectura: 'LECTURA_INICIAL',
      orden_dificultad: 2,
      num_palabras: 5,
      imagen_portada: '🌳🐕',
      activo: true,
    },
    {
      id_cuento: 6,
      titulo: 'La Casa del Sol Brillante',
      descripcion: 'Practica la apertura vocálica y el soplo suave diciendo palabras sencillas como Casa, Sopa y Agua.',
      tipo: 'ARTICULACION',
      nivel_lectura: 'LECTURA_INICIAL',
      orden_dificultad: 2,
      num_palabras: 4,
      imagen_portada: '☀️🏡',
      activo: true,
    },
    {
      id_cuento: 7,
      titulo: 'La Escuela de los Amigos',
      descripcion: 'Una aventura en el salón de clases donde compartimos libros, colores y saludos completos en LSM.',
      tipo: 'LSM',
      nivel_lectura: 'LECTOR_AVANZADO',
      orden_dificultad: 3,
      num_palabras: 8,
      imagen_portada: '🏫📚',
      activo: true,
    },
    {
      id_cuento: 8,
      titulo: 'Un Día con mi Familia',
      descripcion: 'Narrativa completa sobre desayunar juntos, agradecer y compartir momentos felices en LSM.',
      tipo: 'LSM',
      nivel_lectura: 'LECTOR_AVANZADO',
      orden_dificultad: 3,
      num_palabras: 8,
      imagen_portada: '👨‍👩‍👧‍👦❤️',
      activo: true,
    },
    {
      id_cuento: 9,
      titulo: 'El Viaje del Tren Sonoro',
      descripcion: 'Historias rimadas con apoyo labial en cámara lenta para fortalecer sílabas y ritmo fonético.',
      tipo: 'ARTICULACION',
      nivel_lectura: 'LECTOR_AVANZADO',
      orden_dificultad: 3,
      num_palabras: 7,
      imagen_portada: '🚂✨',
      activo: true,
    },
  ],
  ejercicios: [
    { id_ejercicio: 1, id_cuento: 1, patron_referencia_id: 101, palabra_o_sena: 'HOLA', orden_en_cuento: 1 },
    { id_ejercicio: 2, id_cuento: 1, patron_referencia_id: 102, palabra_o_sena: 'LUNA', orden_en_cuento: 2 },
    { id_ejercicio: 3, id_cuento: 1, patron_referencia_id: 103, palabra_o_sena: 'CONEJO', orden_en_cuento: 3 },
    { id_ejercicio: 4, id_cuento: 2, patron_referencia_id: 104, palabra_o_sena: 'MAMÁ', orden_en_cuento: 1 },
    { id_ejercicio: 5, id_cuento: 2, patron_referencia_id: 105, palabra_o_sena: 'PAPÁ', orden_en_cuento: 2 },
    { id_ejercicio: 6, id_cuento: 2, patron_referencia_id: 106, palabra_o_sena: 'ADIÓS', orden_en_cuento: 3 },
    { id_ejercicio: 7, id_cuento: 3, patron_referencia_id: 107, palabra_o_sena: 'MA-MÁ', orden_en_cuento: 1 },
    { id_ejercicio: 8, id_cuento: 3, patron_referencia_id: 108, palabra_o_sena: 'PA-PÁ', orden_en_cuento: 2 },
    { id_ejercicio: 9, id_cuento: 3, patron_referencia_id: 109, palabra_o_sena: 'A-MOR', orden_en_cuento: 3 },
    { id_ejercicio: 10, id_cuento: 4, patron_referencia_id: 201, palabra_o_sena: 'GATO', orden_en_cuento: 1 },
    { id_ejercicio: 11, id_cuento: 4, patron_referencia_id: 202, palabra_o_sena: 'CASA', orden_en_cuento: 2 },
    { id_ejercicio: 12, id_cuento: 4, patron_referencia_id: 203, palabra_o_sena: 'AMIGO', orden_en_cuento: 3 },
    { id_ejercicio: 13, id_cuento: 5, patron_referencia_id: 204, palabra_o_sena: 'ÁRBOL', orden_en_cuento: 1 },
    { id_ejercicio: 14, id_cuento: 5, patron_referencia_id: 205, palabra_o_sena: 'PERRO', orden_en_cuento: 2 },
    { id_ejercicio: 15, id_cuento: 5, patron_referencia_id: 206, palabra_o_sena: 'PELOTA', orden_en_cuento: 3 },
    { id_ejercicio: 16, id_cuento: 6, patron_referencia_id: 207, palabra_o_sena: 'CA-SA', orden_en_cuento: 1 },
    { id_ejercicio: 17, id_cuento: 6, patron_referencia_id: 208, palabra_o_sena: 'SO-PA', orden_en_cuento: 2 },
    { id_ejercicio: 18, id_cuento: 6, patron_referencia_id: 209, palabra_o_sena: 'A-GUA', orden_en_cuento: 3 },
    { id_ejercicio: 19, id_cuento: 7, patron_referencia_id: 301, palabra_o_sena: 'BUENOS DÍAS', orden_en_cuento: 1 },
    { id_ejercicio: 20, id_cuento: 7, patron_referencia_id: 302, palabra_o_sena: 'LIBRO', orden_en_cuento: 2 },
    { id_ejercicio: 21, id_cuento: 7, patron_referencia_id: 303, palabra_o_sena: 'GRACIAS', orden_en_cuento: 3 },
    { id_ejercicio: 22, id_cuento: 8, patron_referencia_id: 304, palabra_o_sena: 'FAMILIA', orden_en_cuento: 1 },
    { id_ejercicio: 23, id_cuento: 8, patron_referencia_id: 305, palabra_o_sena: 'COMER', orden_en_cuento: 2 },
    { id_ejercicio: 24, id_cuento: 8, patron_referencia_id: 306, palabra_o_sena: 'FELIZ', orden_en_cuento: 3 },
    { id_ejercicio: 25, id_cuento: 9, patron_referencia_id: 307, palabra_o_sena: 'ES-TRE-LLA', orden_en_cuento: 1 },
    { id_ejercicio: 26, id_cuento: 9, patron_referencia_id: 308, palabra_o_sena: 'SON-RI-SA', orden_en_cuento: 2 },
    { id_ejercicio: 27, id_cuento: 9, patron_referencia_id: 309, palabra_o_sena: 'A-MI-GOS', orden_en_cuento: 3 },
  ],
  progresos: [
    { id_progreso: 1, id_perfil: 1, id_cuento: 1, estado: 'COMPLETADO', puntos_obtenidos: 30, fecha_completado: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id_progreso: 2, id_perfil: 1, id_cuento: 4, estado: 'EN_PROGRESO', puntos_obtenidos: 20, fecha_completado: null },
    { id_progreso: 3, id_perfil: 2, id_cuento: 1, estado: 'COMPLETADO', puntos_obtenidos: 30, fecha_completado: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id_progreso: 4, id_perfil: 2, id_cuento: 2, estado: 'EN_PROGRESO', puntos_obtenidos: 15, fecha_completado: null },
  ],
  metricas: [
    { id_intento: 1, id_perfil: 1, id_ejercicio: 1, porcentaje_precision: 91.5, resultado: 'CORRECTO', puntos_otorgados: 25, fecha_hora: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id_intento: 2, id_perfil: 1, id_ejercicio: 2, porcentaje_precision: 64.0, resultado: 'REINTENTO', puntos_otorgados: 0, fecha_hora: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id_intento: 3, id_perfil: 1, id_ejercicio: 2, porcentaje_precision: 88.0, resultado: 'CORRECTO', puntos_otorgados: 25, fecha_hora: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id_intento: 4, id_perfil: 1, id_ejercicio: 10, porcentaje_precision: 94.0, resultado: 'CORRECTO', puntos_otorgados: 25, fecha_hora: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id_intento: 5, id_perfil: 2, id_ejercicio: 1, porcentaje_precision: 89.0, resultado: 'CORRECTO', puntos_otorgados: 25, fecha_hora: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id_intento: 6, id_perfil: 2, id_ejercicio: 4, porcentaje_precision: 92.5, resultado: 'CORRECTO', puntos_otorgados: 25, fecha_hora: new Date(Date.now() - 12 * 3600000).toISOString() },
  ],
  recompensas: [
    { id_recompensa: 1, nombre: 'Super Estrella Dorada', costo_puntos: 30, icono_url: '⭐' },
    { id_recompensa: 2, nombre: 'Manita Maestra LSM', costo_puntos: 50, icono_url: '🖐️' },
    { id_recompensa: 3, nombre: 'Trofeo Voz Clara', costo_puntos: 80, icono_url: '🎙️' },
  ],
  canjes: [
    { id_canje: 1, id_perfil: 1, id_recompensa: 1, fecha_canje: new Date(Date.now() - 1 * 86400000).toISOString() },
  ],
};
