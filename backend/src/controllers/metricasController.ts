import { Request, Response } from 'express';
import { query, fallbackStore } from '../config/db';
import { MetricaIntento, ResultadoIntento } from '../models/types';

/**
 * CU-05 / CU-06 / RF-07 / RNF-08:
 * Registrar el intento de Visión Artificial (LSM) o Articulación Oral y devolver
 * retroalimentación inmediata positiva (no punitiva) y puntos de refuerzo.
 */
export const registrarMetricaIntento = async (req: Request, res: Response): Promise<void> => {
  const { id_perfil, id_ejercicio, porcentaje_precision } = req.body;

  if (!id_perfil || !id_ejercicio || porcentaje_precision === undefined) {
    res.status(400).json({
      error: 'Se requieren id_perfil, id_ejercicio y porcentaje_precision',
    });
    return;
  }

  const precision = Math.min(100, Math.max(0, Number(porcentaje_precision)));
  // Umbral pedagógico amigable: >= 75% se considera CORRECTO; menor es REINTENTO con puntos de aliento (RNF-08)
  const resultado: ResultadoIntento = precision >= 75 ? 'CORRECTO' : 'REINTENTO';
  const puntosOtorgados =
    resultado === 'CORRECTO' ? (precision >= 90 ? 25 : 20) : 10;

  const retroalimentacionDUA =
    resultado === 'CORRECTO'
      ? {
          titulo: '¡Excelente postura y ejecución!',
          mensaje: `Lograste una coincidencia del ${precision.toFixed(0)}%. ¡Ganaste +${puntosOtorgados} estrellas!`,
          icono: '🌟',
          nivelConfort: 'ZONA_SEGURA',
        }
      : {
          titulo: '¡Muy buen esfuerzo! Intentemos una vez más',
          mensaje: `Tu movimiento tuvo ${precision.toFixed(0)}% de coincidencia. ¡Ganaste +${puntosOtorgados} estrellas por practicar!`,
          icono: '💪',
          nivelConfort: 'ZONA_SEGURA',
        };

  try {
    const insertRes = await query<MetricaIntento>(
      `INSERT INTO TABLA_METRICA_INTENTO
         (id_perfil, id_ejercicio, porcentaje_precision, resultado, puntos_otorgados, fecha_hora)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING *`,
      [Number(id_perfil), Number(id_ejercicio), precision, resultado, puntosOtorgados]
    );

    const perfilRes = await query(
      `UPDATE TABLA_PERFIL
       SET puntos_acumulados = puntos_acumulados + $1
       WHERE id_perfil = $2
       RETURNING puntos_acumulados`,
      [puntosOtorgados, Number(id_perfil)]
    );

    res.status(201).json({
      source: 'postgresql',
      data: insertRes.rows[0],
      puntos_acumulados_actualizados: perfilRes.rows[0]?.puntos_acumulados,
      retroalimentacion: retroalimentacionDUA,
    });
  } catch (_err) {
    const nextId =
      fallbackStore.metricas.reduce((max, m) => Math.max(max, m.id_intento), 0) + 1;
    const nuevaMetrica: MetricaIntento = {
      id_intento: nextId,
      id_perfil: Number(id_perfil),
      id_ejercicio: Number(id_ejercicio),
      porcentaje_precision: precision,
      resultado,
      puntos_otorgados: puntosOtorgados,
      fecha_hora: new Date().toISOString(),
    };
    fallbackStore.metricas.unshift(nuevaMetrica);

    const perfil = fallbackStore.perfiles.find((p) => p.id_perfil === Number(id_perfil));
    if (perfil) {
      perfil.puntos_acumulados += puntosOtorgados;
    }

    res.status(201).json({
      source: 'in-memory-fallback',
      data: nuevaMetrica,
      puntos_acumulados_actualizados: perfil?.puntos_acumulados ?? puntosOtorgados,
      retroalimentacion: retroalimentacionDUA,
    });
  }
};

/**
 * CU-07 / CU-08 / RF-12:
 * Obtener panel de seguimiento y estadísticas detalladas de un niño para el Padre/Tutor
 */
export const getEstadisticasPerfil = async (req: Request, res: Response): Promise<void> => {
  const idPerfil = Number(req.params.id_perfil);

  if (Number.isNaN(idPerfil)) {
    res.status(400).json({ error: 'id_perfil inválido' });
    return;
  }

  try {
    const perfilRes = await query(
      'SELECT * FROM TABLA_PERFIL WHERE id_perfil = $1',
      [idPerfil]
    );

    if (perfilRes.rowCount === 0) {
      res.status(404).json({ error: 'Perfil no encontrado' });
      return;
    }

    const metricasRes = await query(
      `SELECT m.*, e.palabra_o_sena, c.titulo AS titulo_cuento, c.tipo AS tipo_cuento
       FROM TABLA_METRICA_INTENTO m
       JOIN TABLA_EJERCICIO_CUENTO e ON m.id_ejercicio = e.id_ejercicio
       JOIN TABLA_CUENTO c ON e.id_cuento = c.id_cuento
       WHERE m.id_perfil = $1
       ORDER BY m.fecha_hora DESC`,
      [idPerfil]
    );

    const progresoRes = await query(
      `SELECT pc.*, c.titulo AS titulo_cuento, c.tipo AS tipo_cuento
       FROM TABLA_PROGRESO_CUENTO pc
       JOIN TABLA_CUENTO c ON pc.id_cuento = c.id_cuento
       WHERE pc.id_perfil = $1`,
      [idPerfil]
    );

    const metricas = metricasRes.rows;
    const progresos = progresoRes.rows;

    const cuentosCompletados = progresos.filter((p) => p.estado === 'COMPLETADO').length;
    const senasAcertadas = metricas.filter(
      (m) => m.tipo_cuento === 'LSM' && m.resultado === 'CORRECTO'
    ).length;
    const palabrasPronunciadas = metricas.filter(
      (m) => m.tipo_cuento === 'ARTICULACION' && m.resultado === 'CORRECTO'
    ).length;
    const precisionPromedio =
      metricas.length > 0
        ? Number(
            (
              metricas.reduce((acc, m) => acc + Number(m.porcentaje_precision), 0) /
              metricas.length
            ).toFixed(1)
          )
        : 0;

    res.json({
      source: 'postgresql',
      data: {
        perfil: perfilRes.rows[0],
        resumen: {
          cuentos_completados: cuentosCompletados,
          cuentos_en_progreso: progresos.filter((p) => p.estado === 'EN_PROGRESO').length,
          senas_acertadas: senasAcertadas,
          palabras_pronunciadas: palabrasPronunciadas,
          total_intentos: metricas.length,
          precision_promedio: precisionPromedio,
          tiempo_uso_estimado_min: Math.max(15, metricas.length * 4 + cuentosCompletados * 8),
        },
        progreso_cuentos: progresos,
        historial_intentos: metricas,
      },
    });
  } catch (_err) {
    const perfil = fallbackStore.perfiles.find((p) => p.id_perfil === idPerfil);
    if (!perfil) {
      res.status(404).json({ error: 'Perfil no encontrado' });
      return;
    }

    const metricas = fallbackStore.metricas
      .filter((m) => m.id_perfil === idPerfil)
      .map((m) => {
        const ej = fallbackStore.ejercicios.find((e) => e.id_ejercicio === m.id_ejercicio);
        const cuento = fallbackStore.cuentos.find((c) => c.id_cuento === ej?.id_cuento);
        return {
          ...m,
          palabra_o_sena: ej?.palabra_o_sena || 'Seña',
          titulo_cuento: cuento?.titulo || 'Cuento',
          tipo_cuento: cuento?.tipo || 'LSM',
        };
      });

    const progresos = fallbackStore.progresos
      .filter((p) => p.id_perfil === idPerfil)
      .map((p) => {
        const cuento = fallbackStore.cuentos.find((c) => c.id_cuento === p.id_cuento);
        return {
          ...p,
          titulo_cuento: cuento?.titulo || 'Cuento',
          tipo_cuento: cuento?.tipo || 'LSM',
        };
      });

    const cuentosCompletados = progresos.filter((p) => p.estado === 'COMPLETADO').length;
    const senasAcertadas = metricas.filter(
      (m) => m.tipo_cuento === 'LSM' && m.resultado === 'CORRECTO'
    ).length;
    const palabrasPronunciadas = metricas.filter(
      (m) => m.tipo_cuento === 'ARTICULACION' && m.resultado === 'CORRECTO'
    ).length;
    const precisionPromedio =
      metricas.length > 0
        ? Number(
            (
              metricas.reduce((acc, m) => acc + Number(m.porcentaje_precision), 0) /
              metricas.length
            ).toFixed(1)
          )
        : 0;

    res.json({
      source: 'in-memory-fallback',
      data: {
        perfil,
        resumen: {
          cuentos_completados: cuentosCompletados,
          cuentos_en_progreso: progresos.filter((p) => p.estado === 'EN_PROGRESO').length,
          senas_acertadas: senasAcertadas,
          palabras_pronunciadas: palabrasPronunciadas,
          total_intentos: metricas.length,
          precision_promedio: precisionPromedio,
          tiempo_uso_estimado_min: Math.max(15, metricas.length * 4 + cuentosCompletados * 8),
        },
        progreso_cuentos: progresos,
        historial_intentos: metricas,
      },
    });
  }
};
