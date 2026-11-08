/**
 * Modelos de Dominio y Tipos Relacionales - "Señas y Sonrisas" (TSI-2026-MEEXUU)
 * Basado en Fase 1 (Casos de Uso) y Fase 2 (Actividad 4: Diagrama de Clases y Actividad 7: Modelo E-R)
 */

export type TipoSordera = 'TOTAL' | 'PARCIAL';
export type NivelLectura = 'NO_LECTOR' | 'LECTURA_INICIAL' | 'LECTOR_AVANZADO';
export type TipoCuento = 'LSM' | 'ARTICULACION';
export type EstadoProgreso = 'EN_PROGRESO' | 'COMPLETADO';
export type ResultadoIntento = 'CORRECTO' | 'REINTENTO';

/**
 * TABLA_TUTOR - Actor 2: Padre, Madre, Tutor o Terapeuta (Inclusion Partner)
 */
export interface Tutor {
  id_tutor: number;
  nombre: string;
  email: string;
  password_hash?: string;
  fecha_registro: string;
}

/**
 * Clase ConfiguracionAccesibilidad (Fase 2, Actividad 4.3 - Diagrama de Clases)
 * Controla parámetros DUA y WCAG 2.2 AAA del perfil infantil.
 */
export interface ConfiguracionAccesibilidad {
  tamanoTexto: 'NORMAL' | 'GRANDE' | 'EXTRA_GRANDE';
  contraste: 'AAA_ESTANDAR' | 'AAA_ALTO_CONTRASTE';
  retroalimentacionVisual: boolean;
  reproduccionAutomatica: boolean;
  velocidadAnimacion: 0.5 | 1.0;
  limiteDecibeles: number; // <50 dB Zona Segura, 50-65 dB Advertencia, >65 dB Atenuación
  pausaSensorialActiva: boolean;
}

/**
 * TABLA_PERFIL / TABLA_PERFIL_NINO - Actor 1: Niño de ~6 años con hipoacusia
 * Soporta los Perfiles Adaptativos Niño A, Niño B, Niño C y Niño D (Fase 1, Actividad 3)
 */
export interface PerfilNino {
  id_perfil: number;
  id_tutor: number;
  nombre_apodo: string;
  fecha_nacimiento: string;
  tipo_sordera: TipoSordera;
  nivel_lectura: NivelLectura;
  puntos_acumulados: number;
  configuracion_accesibilidad?: ConfiguracionAccesibilidad;
}

/**
 * TABLA_EJERCICIO_CUENTO - Nodo de interacción NUI/AR dentro de un cuento
 */
export interface EjercicioCuento {
  id_ejercicio: number;
  id_cuento: number;
  patron_referencia_id: number;
  palabra_o_sena: string;
  orden_en_cuento: number;
}

/**
 * TABLA_CUENTO - Catálogo de cuentos interactivos por niveles
 */
export interface Cuento {
  id_cuento: number;
  titulo: string;
  descripcion: string;
  tipo: TipoCuento;
  nivel_lectura: NivelLectura;
  orden_dificultad: number;
  num_palabras: number;
  imagen_portada: string;
  activo: boolean;
  ejercicios?: EjercicioCuento[];
}

/**
 * TABLA_PROGRESO_CUENTO - Registro de avance en cuentos por perfil infantil
 */
export interface ProgresoCuento {
  id_progreso: number;
  id_perfil: number;
  id_cuento: number;
  estado: EstadoProgreso;
  puntos_obtenidos: number;
  fecha_completado: string | null;
  titulo_cuento?: string;
  tipo_cuento?: TipoCuento;
}

/**
 * TABLA_METRICA_INTENTO - Registro de precisión de visión artificial (Módulo 1 LSM y Módulo 2 Articulación)
 */
export interface MetricaIntento {
  id_intento: number;
  id_perfil: number;
  id_ejercicio: number;
  porcentaje_precision: number;
  resultado: ResultadoIntento;
  puntos_otorgados: number;
  fecha_hora: string;
  palabra_o_sena?: string;
  tipo_cuento?: TipoCuento;
  titulo_cuento?: string;
}

/**
 * TABLA_RECOMPENSA - Catálogo de insignias y recompensas desbloqueables
 */
export interface Recompensa {
  id_recompensa: number;
  nombre: string;
  costo_puntos: number;
  icono_url: string;
}

/**
 * TABLA_CANJE_RECOMPENSA - Historial de recompensas canjeadas por el niño
 */
export interface CanjeRecompensa {
  id_canje: number;
  id_perfil: number;
  id_recompensa: number;
  fecha_canje: string;
  nombre_recompensa?: string;
  icono_url?: string;
  costo_puntos?: number;
}

