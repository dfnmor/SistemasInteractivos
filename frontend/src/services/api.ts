import {
  PerfilNino,
  Cuento,
  Recompensa,
  EstadisticasPerfilData,
  TipoSordera,
  NivelLectura,
  MetricaIntento,
} from '../types/meexuu';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Datos semilla locales para garantizar el cumplimiento de RNF-06:
 * "Los cuentos ya descargados deben poder reproducirse sin conexión,
 * considerando contextos escolares con conectividad limitada."
 */
const OFFLINE_PERFILES: PerfilNino[] = [
  {
    id_perfil: 1,
    id_tutor: 1,
    nombre_apodo: 'Mateo (Niño A: Lector Inicial)',
    fecha_nacimiento: '2020-04-15',
    tipo_sordera: 'PARCIAL',
    nivel_lectura: 'LECTURA_INICIAL',
    puntos_acumulados: 120,
    nombre_tutor: 'Laura Gómez (Mamá de Mateo)',
  },
  {
    id_perfil: 2,
    id_tutor: 1,
    nombre_apodo: 'Sofía (Niño B: No Lectora)',
    fecha_nacimiento: '2020-08-22',
    tipo_sordera: 'TOTAL',
    nivel_lectura: 'NO_LECTOR',
    puntos_acumulados: 85,
    nombre_tutor: 'Laura Gómez (Mamá de Mateo)',
  },
  {
    id_perfil: 3,
    id_tutor: 2,
    nombre_apodo: 'Leo (Niño C: Parcial + Audífono)',
    fecha_nacimiento: '2020-02-10',
    tipo_sordera: 'PARCIAL',
    nivel_lectura: 'LECTURA_INICIAL',
    puntos_acumulados: 95,
    nombre_tutor: 'Terapeuta Lic. Valeria Méndez',
  },
  {
    id_perfil: 4,
    id_tutor: 2,
    nombre_apodo: 'Valentina (Niño D: LSM Nativa)',
    fecha_nacimiento: '2019-11-30',
    tipo_sordera: 'TOTAL',
    nivel_lectura: 'LECTOR_AVANZADO',
    puntos_acumulados: 160,
    nombre_tutor: 'Terapeuta Lic. Valeria Méndez',
  },
];

const OFFLINE_CUENTOS: Cuento[] = [
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
    progreso_usuario: { estado: 'EN_PROGRESO', puntos_obtenidos: 60 },
    ejercicios: [
      { id_ejercicio: 1, id_cuento: 1, patron_referencia_id: 101, palabra_o_sena: 'HOLA (Saludo)', orden_en_cuento: 1 },
      { id_ejercicio: 2, id_cuento: 1, patron_referencia_id: 102, palabra_o_sena: 'LUNA', orden_en_cuento: 2 },
      { id_ejercicio: 3, id_cuento: 1, patron_referencia_id: 103, palabra_o_sena: 'CONEJO', orden_en_cuento: 3 },
    ],
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
    progreso_usuario: { estado: 'COMPLETADO', puntos_obtenidos: 40 },
    ejercicios: [
      { id_ejercicio: 4, id_cuento: 2, patron_referencia_id: 201, palabra_o_sena: 'GATO', orden_en_cuento: 1 },
      { id_ejercicio: 5, id_cuento: 2, patron_referencia_id: 202, palabra_o_sena: 'CASA', orden_en_cuento: 2 },
      { id_ejercicio: 6, id_cuento: 2, patron_referencia_id: 203, palabra_o_sena: 'AMIGO', orden_en_cuento: 3 },
    ],
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
    progreso_usuario: null,
    ejercicios: [
      { id_ejercicio: 7, id_cuento: 3, patron_referencia_id: 301, palabra_o_sena: 'BUENOS DÍAS', orden_en_cuento: 1 },
      { id_ejercicio: 8, id_cuento: 3, patron_referencia_id: 302, palabra_o_sena: 'LIBRO', orden_en_cuento: 2 },
      { id_ejercicio: 9, id_cuento: 3, patron_referencia_id: 303, palabra_o_sena: 'GRACIAS', orden_en_cuento: 3 },
    ],
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
    progreso_usuario: { estado: 'COMPLETADO', puntos_obtenidos: 20 },
    ejercicios: [
      { id_ejercicio: 10, id_cuento: 4, patron_referencia_id: 401, palabra_o_sena: '/m/ - /a/ • MA-MÁ', orden_en_cuento: 1 },
      { id_ejercicio: 11, id_cuento: 4, patron_referencia_id: 402, palabra_o_sena: '/p/ - /a/ • PA-PÁ', orden_en_cuento: 2 },
    ],
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
    progreso_usuario: null,
    ejercicios: [
      { id_ejercicio: 12, id_cuento: 5, patron_referencia_id: 501, palabra_o_sena: 'CA-SA', orden_en_cuento: 1 },
      { id_ejercicio: 13, id_cuento: 5, patron_referencia_id: 502, palabra_o_sena: 'SO-PA', orden_en_cuento: 2 },
      { id_ejercicio: 14, id_cuento: 5, patron_referencia_id: 503, palabra_o_sena: 'A-GUA', orden_en_cuento: 3 },
    ],
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
    progreso_usuario: null,
    ejercicios: [
      { id_ejercicio: 15, id_cuento: 6, patron_referencia_id: 601, palabra_o_sena: 'ES-TRE-LLA', orden_en_cuento: 1 },
      { id_ejercicio: 16, id_cuento: 6, patron_referencia_id: 602, palabra_o_sena: 'SON-RI-SA', orden_en_cuento: 2 },
    ],
  },
];

const OFFLINE_RECOMPENSAS: Recompensa[] = [
  { id_recompensa: 1, nombre: 'Super Estrella', costo_puntos: 30, icono_url: '⭐', desbloqueada: true },
  { id_recompensa: 2, nombre: 'Manita Maestra', costo_puntos: 50, icono_url: '🖐️', desbloqueada: true },
  { id_recompensa: 3, nombre: 'Voz Clara', costo_puntos: 50, icono_url: '🎙️', desbloqueada: false },
  { id_recompensa: 4, nombre: 'Conejito Lunar Guardián', costo_puntos: 80, icono_url: '🐰', desbloqueada: false },
  { id_recompensa: 5, nombre: 'Corona de Arcoíris DUA', costo_puntos: 100, icono_url: '👑', desbloqueada: false },
  { id_recompensa: 6, nombre: 'Gafas de Explorador AR', costo_puntos: 120, icono_url: '🥽', desbloqueada: false },
];

export async function fetchHealthStatus(): Promise<{
  online: boolean;
  dbConnected: boolean;
  mode: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health endpoint error');
    const json = await res.json();
    return {
      online: true,
      dbConnected: Boolean(json.database?.connected),
      mode: json.database?.mode || 'postgresql',
    };
  } catch {
    return {
      online: false,
      dbConnected: false,
      mode: 'offline-escolar-rnf06',
    };
  }
}

export async function fetchPerfiles(): Promise<PerfilNino[]> {
  try {
    const res = await fetch(`${API_BASE}/perfiles`);
    if (!res.ok) throw new Error('Error al obtener perfiles');
    const json = await res.json();
    return json.data;
  } catch {
    return OFFLINE_PERFILES;
  }
}

export async function crearNuevoPerfil(payload: {
  nombre_apodo: string;
  fecha_nacimiento: string;
  tipo_sordera: TipoSordera;
  nivel_lectura: NivelLectura;
}): Promise<PerfilNino> {
  try {
    const res = await fetch(`${API_BASE}/perfiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al crear perfil');
    const json = await res.json();
    return json.data;
  } catch {
    const nuevo: PerfilNino = {
      id_perfil: OFFLINE_PERFILES.length + 1,
      id_tutor: 1,
      nombre_apodo: payload.nombre_apodo,
      fecha_nacimiento: payload.fecha_nacimiento,
      tipo_sordera: payload.tipo_sordera,
      nivel_lectura: payload.nivel_lectura,
      puntos_acumulados: 0,
    };
    OFFLINE_PERFILES.push(nuevo);
    return nuevo;
  }
}

export async function actualizarPerfilAdaptativo(
  id_perfil: number,
  payload: {
    nombre_apodo?: string;
    tipo_sordera?: TipoSordera;
    nivel_lectura?: NivelLectura;
  }
): Promise<PerfilNino> {
  try {
    const res = await fetch(`${API_BASE}/perfiles/${id_perfil}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al actualizar perfil');
    const json = await res.json();
    return json.data;
  } catch {
    const found = OFFLINE_PERFILES.find((p) => p.id_perfil === id_perfil) || OFFLINE_PERFILES[0];
    if (payload.nombre_apodo) found.nombre_apodo = payload.nombre_apodo;
    if (payload.tipo_sordera) found.tipo_sordera = payload.tipo_sordera;
    if (payload.nivel_lectura) found.nivel_lectura = payload.nivel_lectura;
    return { ...found };
  }
}

export async function fetchCuentos(params?: {
  tipo?: string;
  nivel_lectura?: string;
  id_perfil?: number;
}): Promise<Cuento[]> {
  try {
    const search = new URLSearchParams();
    if (params?.tipo) search.set('tipo', params.tipo);
    if (params?.nivel_lectura) search.set('nivel_lectura', params.nivel_lectura);
    if (params?.id_perfil) search.set('id_perfil', String(params.id_perfil));

    const res = await fetch(`${API_BASE}/cuentos?${search.toString()}`);
    if (!res.ok) throw new Error('Error al obtener cuentos');
    const json = await res.json();
    return json.data;
  } catch {
    let list = [...OFFLINE_CUENTOS];
    if (params?.tipo) list = list.filter((c) => c.tipo === params.tipo);
    if (params?.nivel_lectura) list = list.filter((c) => c.nivel_lectura === params.nivel_lectura);
    return list;
  }
}

export async function guardarProgresoCuento(
  id_cuento: number,
  id_perfil: number,
  puntos_obtenidos = 30
): Promise<void> {
  try {
    await fetch(`${API_BASE}/cuentos/${id_cuento}/progreso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_perfil,
        estado: 'COMPLETADO',
        puntos_obtenidos,
      }),
    });
  } catch {
    const c = OFFLINE_CUENTOS.find((item) => item.id_cuento === id_cuento);
    if (c) {
      c.progreso_usuario = { estado: 'COMPLETADO', puntos_obtenidos };
    }
  }
}

export async function enviarMetricaIntento(payload: {
  id_perfil: number;
  id_ejercicio: number;
  porcentaje_precision: number;
}): Promise<{
  puntos_acumulados_actualizados?: number;
  retroalimentacion: {
    titulo: string;
    mensaje: string;
    icono: string;
  };
  data?: MetricaIntento;
}> {
  try {
    const res = await fetch(`${API_BASE}/metricas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al registrar métrica');
    return await res.json();
  } catch {
    const correcto = payload.porcentaje_precision >= 75;
    const puntos = correcto ? 20 : 10;
    const p = OFFLINE_PERFILES.find((item) => item.id_perfil === payload.id_perfil);
    if (p) p.puntos_acumulados += puntos;
    return {
      puntos_acumulados_actualizados: p?.puntos_acumulados,
      retroalimentacion: {
        titulo: correcto
          ? '¡Excelente postura y ejecución!'
          : '¡Muy buen esfuerzo! Intentemos de nuevo',
        mensaje: `Coincidencia del ${payload.porcentaje_precision.toFixed(0)}%. ¡Ganaste +${puntos} estrellas!`,
        icono: correcto ? '🌟' : '💪',
      },
    };
  }
}

export async function fetchEstadisticasPerfil(
  id_perfil: number
): Promise<EstadisticasPerfilData> {
  try {
    const res = await fetch(`${API_BASE}/metricas/perfil/${id_perfil}`);
    if (!res.ok) throw new Error('Error al obtener estadísticas');
    const json = await res.json();
    return json.data;
  } catch {
    const perfil =
      OFFLINE_PERFILES.find((p) => p.id_perfil === id_perfil) || OFFLINE_PERFILES[0];
    return {
      perfil,
      resumen: {
        cuentos_completados: 2,
        cuentos_en_progreso: 1,
        senas_acertadas: 4,
        palabras_pronunciadas: 2,
        total_intentos: 6,
        precision_promedio: 87.3,
        tiempo_uso_estimado_min: 40,
      },
      progreso_cuentos: [
        {
          id_progreso: 1,
          id_perfil,
          id_cuento: 1,
          estado: 'EN_PROGRESO',
          puntos_obtenidos: 60,
          fecha_completado: null,
          titulo_cuento: 'El Conejito y la Luna',
          tipo_cuento: 'LSM',
        },
        {
          id_progreso: 2,
          id_perfil,
          id_cuento: 2,
          estado: 'COMPLETADO',
          puntos_obtenidos: 40,
          fecha_completado: new Date().toISOString(),
          titulo_cuento: 'El Gato Mimoso en Casa',
          tipo_cuento: 'LSM',
        },
      ],
      historial_intentos: [
        {
          id_intento: 1,
          id_perfil,
          id_ejercicio: 1,
          porcentaje_precision: 88,
          resultado: 'CORRECTO',
          puntos_otorgados: 20,
          fecha_hora: new Date().toISOString(),
          palabra_o_sena: 'HOLA (Saludo)',
          titulo_cuento: 'El Conejito y la Luna',
          tipo_cuento: 'LSM',
        },
        {
          id_intento: 2,
          id_perfil,
          id_ejercicio: 10,
          porcentaje_precision: 89.5,
          resultado: 'CORRECTO',
          puntos_otorgados: 25,
          fecha_hora: new Date().toISOString(),
          palabra_o_sena: '/m/ - /a/ • MA-MÁ',
          titulo_cuento: 'Cantando con Mamá',
          tipo_cuento: 'ARTICULACION',
        },
      ],
    };
  }
}

export async function fetchRecompensas(id_perfil: number): Promise<Recompensa[]> {
  try {
    const res = await fetch(`${API_BASE}/recompensas?id_perfil=${id_perfil}`);
    if (!res.ok) throw new Error('Error al obtener recompensas');
    const json = await res.json();
    return json.data;
  } catch {
    return OFFLINE_RECOMPENSAS;
  }
}

export async function canjearRecompensaApi(
  id_perfil: number,
  id_recompensa: number
): Promise<{
  ok: boolean;
  mensaje: string;
  puntos_acumulados_actualizados?: number;
}> {
  try {
    const res = await fetch(`${API_BASE}/recompensas/canjear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_perfil, id_recompensa }),
    });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false, mensaje: json.error || 'No se pudo realizar el canje' };
    }
    return {
      ok: true,
      mensaje: json.message,
      puntos_acumulados_actualizados: json.puntos_acumulados_actualizados,
    };
  } catch {
    const rec = OFFLINE_RECOMPENSAS.find((r) => r.id_recompensa === id_recompensa);
    if (rec) rec.desbloqueada = true;
    return {
      ok: true,
      mensaje: `¡Desbloqueaste ${rec?.nombre || 'tu trofeo'}!`,
    };
  }
}
