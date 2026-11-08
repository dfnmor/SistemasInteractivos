export type TipoSordera = 'TOTAL' | 'PARCIAL';
export type NivelLectura = 'NO_LECTOR' | 'LECTURA_INICIAL' | 'LECTOR_AVANZADO';
export type TipoCuento = 'LSM' | 'ARTICULACION';
export type EstadoProgreso = 'EN_PROGRESO' | 'COMPLETADO';
export type ResultadoIntento = 'CORRECTO' | 'REINTENTO';

export type VistaActiva =
  | 'INICIO_PERFIL'
  | 'MENU_PRINCIPAL'
  | 'CATALOGO_CUENTOS'
  | 'PRACTICA_V1'
  | 'PRACTICA_V2'
  | 'MODULO_2_ARTICULACION'
  | 'PANEL_TUTOR';

export interface ConfiguracionAccesibilidad {
  tamanoTexto: 'NORMAL' | 'GRANDE' | 'EXTRA_GRANDE';
  contraste: 'AAA_ESTANDAR' | 'AAA_ALTO_CONTRASTE';
  velocidadAnimacion: 0.5 | 1.0;
  nivelDecibeles: number;
  pausaSensorialActiva: boolean;
  modoPreExploracionSilenciosa: boolean;
}

export interface PerfilNino {
  id_perfil: number;
  id_tutor: number;
  nombre_apodo: string;
  fecha_nacimiento: string;
  tipo_sordera: TipoSordera;
  nivel_lectura: NivelLectura;
  puntos_acumulados: number;
  nombre_tutor?: string;
  email_tutor?: string;
}

export interface EjercicioCuento {
  id_ejercicio: number;
  id_cuento: number;
  patron_referencia_id: number;
  palabra_o_sena: string;
  orden_en_cuento: number;
}

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
  progreso_usuario?: {
    estado: EstadoProgreso;
    puntos_obtenidos: number;
  } | null;
}

export interface MetricaIntento {
  id_intento: number;
  id_perfil: number;
  id_ejercicio: number;
  porcentaje_precision: number;
  resultado: ResultadoIntento;
  puntos_otorgados: number;
  fecha_hora: string;
  palabra_o_sena?: string;
  titulo_cuento?: string;
  tipo_cuento?: TipoCuento;
}

export interface Recompensa {
  id_recompensa: number;
  nombre: string;
  costo_puntos: number;
  icono_url: string;
  desbloqueada?: boolean;
}

export interface CanjeRecompensaItem {
  id_canje: number;
  id_perfil: number;
  id_recompensa: number;
  fecha_canje: string;
  nombre_recompensa: string;
  icono_url: string;
  costo_puntos: number;
}

export interface EstadisticasPerfilData {
  perfil: PerfilNino;
  resumen: {
    cuentos_completados: number;
    cuentos_en_progreso: number;
    senas_acertadas: number;
    palabras_pronunciadas: number;
    total_intentos: number;
    precision_promedio: number;
    tiempo_uso_estimado_min: number;
  };
  progreso_cuentos: Array<{
    id_progreso: number;
    id_perfil: number;
    id_cuento: number;
    estado: EstadoProgreso;
    puntos_obtenidos: number;
    fecha_completado: string | null;
    titulo_cuento?: string;
    tipo_cuento?: TipoCuento;
    nivel_lectura?: NivelLectura;
  }>;
  historial_intentos: MetricaIntento[];
  recompensas_canjeadas: CanjeRecompensaItem[];
}
