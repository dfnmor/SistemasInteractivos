import {
  PerfilNino,
  Cuento,
  Recompensa,
  EstadisticasPerfilData,
  TipoSordera,
  NivelLectura,
  MetricaIntento,
} from '../types/meexuu';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5174/api';

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
      mode: 'offline',
    };
  }
}

export async function fetchPerfiles(): Promise<PerfilNino[]> {
  const res = await fetch(`${API_BASE}/perfiles`);
  if (!res.ok) throw new Error('Error al obtener perfiles desde la API');
  const json = await res.json();
  return json.data;
}

export async function crearNuevoPerfil(payload: {
  nombre_apodo: string;
  fecha_nacimiento: string;
  tipo_sordera: TipoSordera;
  nivel_lectura: NivelLectura;
}): Promise<PerfilNino> {
  const res = await fetch(`${API_BASE}/perfiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al crear perfil en PostgreSQL');
  const json = await res.json();
  return json.data;
}

export async function actualizarPerfilAdaptativo(
  id_perfil: number,
  payload: {
    nombre_apodo?: string;
    tipo_sordera?: TipoSordera;
    nivel_lectura?: NivelLectura;
  }
): Promise<PerfilNino> {
  const res = await fetch(`${API_BASE}/perfiles/${id_perfil}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al actualizar perfil en PostgreSQL');
  const json = await res.json();
  return json.data;
}

export async function fetchCuentos(params?: {
  tipo?: string;
  nivel_lectura?: string;
  id_perfil?: number;
}): Promise<Cuento[]> {
  const search = new URLSearchParams();
  if (params?.tipo) search.set('tipo', params.tipo);
  if (params?.nivel_lectura) search.set('nivel_lectura', params.nivel_lectura);
  if (params?.id_perfil) search.set('id_perfil', String(params.id_perfil));

  const res = await fetch(`${API_BASE}/cuentos?${search.toString()}`);
  if (!res.ok) throw new Error('Error al obtener catálogo de cuentos desde la API');
  const json = await res.json();
  return json.data;
}

export async function guardarProgresoCuento(
  id_cuento: number,
  id_perfil: number,
  puntos_obtenidos = 30,
  estado: 'EN_PROGRESO' | 'COMPLETADO' = 'COMPLETADO'
): Promise<void> {
  const res = await fetch(`${API_BASE}/cuentos/${id_cuento}/progreso`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_perfil,
      estado,
      puntos_obtenidos,
    }),
  });
  if (!res.ok) throw new Error('Error al guardar progreso del cuento');
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
  const res = await fetch(`${API_BASE}/metricas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al registrar intento en TABLA_METRICA_INTENTO');
  return await res.json();
}

export async function fetchEstadisticasPerfil(
  id_perfil: number
): Promise<EstadisticasPerfilData> {
  const res = await fetch(`${API_BASE}/metricas/perfil/${id_perfil}`);
  if (!res.ok) throw new Error('Error al obtener estadísticas del perfil desde PostgreSQL');
  const json = await res.json();
  return json.data;
}

export async function fetchRecompensas(id_perfil: number): Promise<Recompensa[]> {
  const res = await fetch(`${API_BASE}/recompensas?id_perfil=${id_perfil}`);
  if (!res.ok) throw new Error('Error al obtener recompensas desde PostgreSQL');
  const json = await res.json();
  return json.data;
}

export async function canjearRecompensaApi(
  id_perfil: number,
  id_recompensa: number
): Promise<{
  ok: boolean;
  mensaje: string;
  puntos_acumulados_actualizados?: number;
}> {
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
}
