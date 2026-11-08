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
  connectionTimeoutMillis: 2500,
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
 * Almacén de Respaldo en Memoria (In-Memory Mirror de `/database/schema.sql`)
 * Garantiza continuidad operativa RNF-06 (Disponibilidad en contextos con conectividad limitada)
 * en caso de que el contenedor Docker PostgreSQL aún no haya sido iniciado.
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
      nombre: 'Laura Gómez (Mamá de Mateo)',
      email: 'laura.gomez@meexuu.org',
      fecha_registro: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id_tutor: 2,
      nombre: 'Terapeuta Lic. Valeria Méndez',
      email: 'valeria.terapeuta@meexuu.org',
      fecha_registro: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ],
  perfiles: [
    {
      id_perfil: 1,
      id_tutor: 1,
      nombre_apodo: 'Mateo (Niño A: Lector Inicial)',
      fecha_nacimiento: '2020-04-15',
      tipo_sordera: 'PARCIAL',
      nivel_lectura: 'LECTURA_INICIAL',
      puntos_acumulados: 120,
    },
    {
      id_perfil: 2,
      id_tutor: 1,
      nombre_apodo: 'Sofía (Niño B: No Lectora)',
      fecha_nacimiento: '2020-08-22',
      tipo_sordera: 'TOTAL',
      nivel_lectura: 'NO_LECTOR',
      puntos_acumulados: 85,
    },
    {
      id_perfil: 3,
      id_tutor: 2,
      nombre_apodo: 'Leo (Niño C: Parcial + Audífono)',
      fecha_nacimiento: '2020-02-10',
      tipo_sordera: 'PARCIAL',
      nivel_lectura: 'LECTURA_INICIAL',
      puntos_acumulados: 95,
    },
    {
      id_perfil: 4,
      id_tutor: 2,
      nombre_apodo: 'Valentina (Niño D: LSM Nativa)',
      fecha_nacimiento: '2019-11-30',
      tipo_sordera: 'TOTAL',
      nivel_lectura: 'LECTOR_AVANZADO',
      puntos_acumulados: 160,
    },
  ],
  cuentos: [
    {
      id_cuento: 1,
      titulo: 'El Conejito y la Luna',
      descripcion:
        'Acompaña al conejo Pepo a descubrir cómo dar las buenas noches usando Lengua de Señas Mexicana bajo las estrellas.',
      tipo: 'LSM',
      nivel_lectura: 'NO_LECTOR',
      orden_dificultad: 1,
      num_palabras: 3,
      imagen_portada: '/assets/cuentos/conejito-luna.svg',
      activo: true,
    },
    {
      id_cuento: 2,
      titulo: 'El Gato Mimoso en Casa',
      descripcion:
        'Milo el gatito explora su hogar y saluda a su familia con señas claras de animales y objetos cotidianos.',
      tipo: 'LSM',
      nivel_lectura: 'LECTURA_INICIAL',
      orden_dificultad: 2,
      num_palabras: 5,
      imagen_portada: '/assets/cuentos/gato-mimoso.svg',
      activo: true,
    },
    {
      id_cuento: 3,
      titulo: 'La Escuela de los Amigos',
      descripcion:
        'Una aventura en el salón de clases donde compartimos libros, colores y saludos completos en LSM.',
      tipo: 'LSM',
      nivel_lectura: 'LECTOR_AVANZADO',
      orden_dificultad: 3,
      num_palabras: 8,
      imagen_portada: '/assets/cuentos/escuela-amigos.svg',
      activo: true,
    },
    {
      id_cuento: 4,
      titulo: 'Cantando con Mamá',
      descripcion:
        'Descubre cómo juntar los labios suavemente para pronunciar fonemas bilabiales (/m/ - /a/) junto a Mamá.',
      tipo: 'ARTICULACION',
      nivel_lectura: 'NO_LECTOR',
      orden_dificultad: 1,
      num_palabras: 2,
      imagen_portada: '/assets/cuentos/cantando-mama.svg',
      activo: true,
    },
    {
      id_cuento: 5,
      titulo: 'La Casa del Sol Brillante',
      descripcion:
        'Practica la apertura vocálica y el soplo suave diciendo palabras sencillas como Casa, Sol y Agua frente al espejo AR.',
      tipo: 'ARTICULACION',
      nivel_lectura: 'LECTURA_INICIAL',
      orden_dificultad: 2,
      num_palabras: 4,
      imagen_portada: '/assets/cuentos/casa-sol.svg',
      activo: true,
    },
    {
      id_cuento: 6,
      titulo: 'El Viaje del Tren Sonoro',
      descripcion:
        'Historias rimadas con apoyo labial en cámara lenta para fortalecer sílabas trabadas y ritmo fonético.',
      tipo: 'ARTICULACION',
      nivel_lectura: 'LECTOR_AVANZADO',
      orden_dificultad: 3,
      num_palabras: 7,
      imagen_portada: '/assets/cuentos/tren-sonoro.svg',
      activo: true,
    },
  ],
  ejercicios: [
    { id_ejercicio: 1, id_cuento: 1, patron_referencia_id: 101, palabra_o_sena: 'HOLA (Saludo)', orden_en_cuento: 1 },
    { id_ejercicio: 2, id_cuento: 1, patron_referencia_id: 102, palabra_o_sena: 'LUNA', orden_en_cuento: 2 },
    { id_ejercicio: 3, id_cuento: 1, patron_referencia_id: 103, palabra_o_sena: 'CONEJO', orden_en_cuento: 3 },
    { id_ejercicio: 4, id_cuento: 2, patron_referencia_id: 201, palabra_o_sena: 'GATO', orden_en_cuento: 1 },
    { id_ejercicio: 5, id_cuento: 2, patron_referencia_id: 202, palabra_o_sena: 'CASA', orden_en_cuento: 2 },
    { id_ejercicio: 6, id_cuento: 2, patron_referencia_id: 203, palabra_o_sena: 'AMIGO', orden_en_cuento: 3 },
    { id_ejercicio: 7, id_cuento: 3, patron_referencia_id: 301, palabra_o_sena: 'BUENOS DÍAS', orden_en_cuento: 1 },
    { id_ejercicio: 8, id_cuento: 3, patron_referencia_id: 302, palabra_o_sena: 'LIBRO', orden_en_cuento: 2 },
    { id_ejercicio: 9, id_cuento: 3, patron_referencia_id: 303, palabra_o_sena: 'GRACIAS', orden_en_cuento: 3 },
    { id_ejercicio: 10, id_cuento: 4, patron_referencia_id: 401, palabra_o_sena: '/m/ - /a/ • MA-MÁ', orden_en_cuento: 1 },
    { id_ejercicio: 11, id_cuento: 4, patron_referencia_id: 402, palabra_o_sena: '/p/ - /a/ • PA-PÁ', orden_en_cuento: 2 },
    { id_ejercicio: 12, id_cuento: 5, patron_referencia_id: 501, palabra_o_sena: 'CA-SA', orden_en_cuento: 1 },
    { id_ejercicio: 13, id_cuento: 5, patron_referencia_id: 502, palabra_o_sena: 'SO-PA', orden_en_cuento: 2 },
    { id_ejercicio: 14, id_cuento: 5, patron_referencia_id: 503, palabra_o_sena: 'A-GUA', orden_en_cuento: 3 },
    { id_ejercicio: 15, id_cuento: 6, patron_referencia_id: 601, palabra_o_sena: 'ES-TRE-LLA', orden_en_cuento: 1 },
    { id_ejercicio: 16, id_cuento: 6, patron_referencia_id: 602, palabra_o_sena: 'SON-RI-SA', orden_en_cuento: 2 },
  ],
  progresos: [
    { id_progreso: 1, id_perfil: 1, id_cuento: 1, estado: 'EN_PROGRESO', puntos_obtenidos: 60, fecha_completado: null },
    { id_progreso: 2, id_perfil: 1, id_cuento: 2, estado: 'COMPLETADO', puntos_obtenidos: 40, fecha_completado: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id_progreso: 3, id_perfil: 1, id_cuento: 4, estado: 'COMPLETADO', puntos_obtenidos: 20, fecha_completado: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id_progreso: 4, id_perfil: 2, id_cuento: 1, estado: 'COMPLETADO', puntos_obtenidos: 85, fecha_completado: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id_progreso: 5, id_perfil: 3, id_cuento: 4, estado: 'COMPLETADO', puntos_obtenidos: 50, fecha_completado: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id_progreso: 6, id_perfil: 3, id_cuento: 5, estado: 'EN_PROGRESO', puntos_obtenidos: 45, fecha_completado: null },
    { id_progreso: 7, id_perfil: 4, id_cuento: 3, estado: 'COMPLETADO', puntos_obtenidos: 100, fecha_completado: new Date(Date.now() - 1 * 86400000).toISOString() },
  ],
  metricas: [
    { id_intento: 1, id_perfil: 1, id_ejercicio: 1, porcentaje_precision: 88.0, resultado: 'CORRECTO', puntos_otorgados: 20, fecha_hora: new Date(Date.now() - 4 * 86400000).toISOString() },
    { id_intento: 2, id_perfil: 1, id_ejercicio: 2, porcentaje_precision: 74.5, resultado: 'REINTENTO', puntos_otorgados: 10, fecha_hora: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id_intento: 3, id_perfil: 1, id_ejercicio: 2, porcentaje_precision: 91.2, resultado: 'CORRECTO', puntos_otorgados: 20, fecha_hora: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id_intento: 4, id_perfil: 1, id_ejercicio: 4, porcentaje_precision: 94.0, resultado: 'CORRECTO', puntos_otorgados: 25, fecha_hora: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id_intento: 5, id_perfil: 1, id_ejercicio: 10, porcentaje_precision: 89.5, resultado: 'CORRECTO', puntos_otorgados: 25, fecha_hora: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id_intento: 6, id_perfil: 1, id_ejercicio: 12, porcentaje_precision: 86.4, resultado: 'CORRECTO', puntos_otorgados: 20, fecha_hora: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id_intento: 7, id_perfil: 2, id_ejercicio: 1, porcentaje_precision: 92.0, resultado: 'CORRECTO', puntos_otorgados: 30, fecha_hora: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id_intento: 8, id_perfil: 2, id_ejercicio: 3, porcentaje_precision: 85.0, resultado: 'CORRECTO', puntos_otorgados: 25, fecha_hora: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id_intento: 9, id_perfil: 3, id_ejercicio: 10, porcentaje_precision: 90.0, resultado: 'CORRECTO', puntos_otorgados: 25, fecha_hora: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id_intento: 10, id_perfil: 4, id_ejercicio: 7, porcentaje_precision: 96.5, resultado: 'CORRECTO', puntos_otorgados: 35, fecha_hora: new Date(Date.now() - 1 * 86400000).toISOString() },
  ],
  recompensas: [
    { id_recompensa: 1, nombre: 'Super Estrella', costo_puntos: 30, icono_url: '⭐' },
    { id_recompensa: 2, nombre: 'Manita Maestra', costo_puntos: 50, icono_url: '🖐️' },
    { id_recompensa: 3, nombre: 'Voz Clara', costo_puntos: 50, icono_url: '🎙️' },
    { id_recompensa: 4, nombre: 'Conejito Lunar Guardián', costo_puntos: 80, icono_url: '🐰' },
    { id_recompensa: 5, nombre: 'Corona de Arcoíris DUA', costo_puntos: 100, icono_url: '👑' },
    { id_recompensa: 6, nombre: 'Gafas de Explorador AR', costo_puntos: 120, icono_url: '🥽' },
  ],
  canjes: [
    { id_canje: 1, id_perfil: 1, id_recompensa: 1, fecha_canje: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id_canje: 2, id_perfil: 1, id_recompensa: 2, fecha_canje: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id_canje: 3, id_perfil: 2, id_recompensa: 1, fecha_canje: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id_canje: 4, id_perfil: 4, id_recompensa: 1, fecha_canje: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id_canje: 5, id_perfil: 4, id_recompensa: 2, fecha_canje: new Date(Date.now() - 1 * 86400000).toISOString() },
  ],
};
