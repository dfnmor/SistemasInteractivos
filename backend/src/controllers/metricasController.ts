import { Request, Response } from 'express';
import { PoolClient } from 'pg';
import { pool, query, fallbackStore } from '../config/db';
import { MetricaIntento, ResultadoIntento } from '../models/types';

/**
 * CU-05 / CU-06 / RF-07 / RNF-08 / DIX09:
 * Registrar cada intento en TABLA_METRICA_INTENTO vía API.
 * - Si porcentaje_precision > 60 -> CORRECTO (+25 puntos en la primera aprobación)
 * - Si porcentaje_precision <= 60 -> REINTENTO (0 puntos, sin penalización)
 */
export const registrarMetricaIntento = async (req: Request, res: Response): Promise<void> => {
  const { id_perfil, id_ejercicio, porcentaje_precision } = req.body;

  if (
    !id_perfil ||
    !id_ejercicio ||
    porcentaje_precision === undefined ||
    !Number.isFinite(Number(porcentaje_precision))
  ) {
    res.status(400).json({
      error: 'Se requieren id_perfil, id_ejercicio y porcentaje_precision',
    });
    return;
  }

  const precision = Math.min(100, Math.max(0, Number(porcentaje_precision)));
  const aprobado = precision > 60;
  const resultado: ResultadoIntento = aprobado ? 'CORRECTO' : 'REINTENTO';

  const retroalimentacionDUA =
    resultado === 'CORRECTO'
      ? {
          titulo: '¡Excelente! Seña reconocida correctamente',
          mensaje: `Lograste una precisión del ${precision.toFixed(0)}%.`,
          icono: '🌟',
          nivelConfort: 'ZONA_SEGURA',
        }
      : {
          titulo: '¡Casi! Intenta otra vez',
          mensaje: `Tu ejecución tuvo ${precision.toFixed(0)}% de coincidencia. Observa la seña en cámara lenta (0.5x) e inténtalo de nuevo sin penalización.`,
          icono: '💪',
          nivelConfort: 'ZONA_SEGURA',
        };

  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const ejercicioRes = await client.query<{
      id_cuento: number;
      orden_dificultad: number;
    }>(
      `SELECT e.id_cuento, c.orden_dificultad
       FROM TABLA_EJERCICIO_CUENTO e
       JOIN TABLA_CUENTO c ON c.id_cuento = e.id_cuento
       WHERE e.id_ejercicio = $1`,
      [Number(id_ejercicio)]
    );
    if (ejercicioRes.rowCount === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Ejercicio no encontrado' });
      return;
    }

    const idCuento = ejercicioRes.rows[0].id_cuento;

    const aprobacionAnterior = await client.query(
      `SELECT 1
       FROM TABLA_METRICA_INTENTO
       WHERE id_perfil = $1 AND id_ejercicio = $2 AND porcentaje_precision > 60
       LIMIT 1`,
      [Number(id_perfil), Number(id_ejercicio)]
    );
    const puntosOtorgados = !aprobado
      ? 0
      : aprobacionAnterior.rowCount === 0
      ? 25
      : 10;
    const insertRes = await client.query<MetricaIntento>(
      `INSERT INTO TABLA_METRICA_INTENTO
         (id_perfil, id_ejercicio, porcentaje_precision, resultado, puntos_otorgados, fecha_hora)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING *`,
      [Number(id_perfil), Number(id_ejercicio), precision, resultado, puntosOtorgados]
    );

    const perfilRes = await client.query(
      `UPDATE TABLA_PERFIL
       SET puntos_acumulados = puntos_acumulados + $1
       WHERE id_perfil = $2
       RETURNING puntos_acumulados`,
      [puntosOtorgados, Number(id_perfil)]
    );

    const progresoRes = await client.query<{ total: number; aprobados: number }>(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (
           WHERE EXISTS (
             SELECT 1
             FROM TABLA_METRICA_INTENTO m
             WHERE m.id_perfil = $1
               AND m.id_ejercicio = e.id_ejercicio
               AND m.porcentaje_precision > 60
           )
         )::int AS aprobados
       FROM TABLA_EJERCICIO_CUENTO e
       WHERE e.id_cuento = $2`,
      [Number(id_perfil), idCuento]
    );
    const cuentoCompletado =
      progresoRes.rows[0].total > 0 &&
      progresoRes.rows[0].aprobados === progresoRes.rows[0].total;

    await client.query(
      `INSERT INTO TABLA_PROGRESO_CUENTO
         (id_perfil, id_cuento, estado, puntos_obtenidos, fecha_completado)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id_perfil, id_cuento)
       DO UPDATE SET
         estado = EXCLUDED.estado,
         puntos_obtenidos = TABLA_PROGRESO_CUENTO.puntos_obtenidos + EXCLUDED.puntos_obtenidos,
         fecha_completado = CASE
           WHEN EXCLUDED.estado = 'COMPLETADO'
             THEN COALESCE(TABLA_PROGRESO_CUENTO.fecha_completado, EXCLUDED.fecha_completado)
           ELSE NULL
         END`,
      [
        Number(id_perfil),
        idCuento,
        cuentoCompletado ? 'COMPLETADO' : 'EN_PROGRESO',
        puntosOtorgados,
        cuentoCompletado ? new Date().toISOString() : null,
      ]
    );

    await client.query('COMMIT');
    res.status(201).json({
      source: 'postgresql',
      data: insertRes.rows[0],
      id_cuento: idCuento,
      cuento_completado: cuentoCompletado,
      puntos_acumulados_actualizados: perfilRes.rows[0]?.puntos_acumulados,
      retroalimentacion: retroalimentacionDUA,
    });
  } catch (_err) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('[Métricas] No se pudo revertir la transacción:', rollbackError);
      }
    }
    const nextId =
      fallbackStore.metricas.reduce((max, m) => Math.max(max, m.id_intento), 0) + 1;
    const ejercicio = fallbackStore.ejercicios.find(
      (e) => e.id_ejercicio === Number(id_ejercicio)
    );
    if (!ejercicio) {
      res.status(404).json({ error: 'Ejercicio no encontrado' });
      return;
    }
    const aprobacionAnterior = fallbackStore.metricas.some(
      (m) =>
        m.id_perfil === Number(id_perfil) &&
        m.id_ejercicio === Number(id_ejercicio) &&
        m.porcentaje_precision > 60
    );
    const puntosOtorgados = !aprobado ? 0 : !aprobacionAnterior ? 25 : 10;
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

    const ejerciciosCuento = fallbackStore.ejercicios.filter(
      (e) => e.id_cuento === ejercicio.id_cuento
    );
    const aprobadosCuento = ejerciciosCuento.filter((e) =>
      fallbackStore.metricas.some(
        (m) =>
          m.id_perfil === Number(id_perfil) &&
          m.id_ejercicio === e.id_ejercicio &&
          m.porcentaje_precision > 60
      )
    ).length;
    const cuentoCompletado =
      ejerciciosCuento.length > 0 && aprobadosCuento === ejerciciosCuento.length;
    const progreso = fallbackStore.progresos.find(
      (p) =>
        p.id_perfil === Number(id_perfil) &&
        p.id_cuento === ejercicio.id_cuento
    );
    if (progreso) {
      progreso.estado = cuentoCompletado ? 'COMPLETADO' : 'EN_PROGRESO';
      progreso.puntos_obtenidos += puntosOtorgados;
      progreso.fecha_completado = cuentoCompletado
        ? progreso.fecha_completado || new Date().toISOString()
        : null;
    } else {
      fallbackStore.progresos.push({
        id_progreso:
          fallbackStore.progresos.reduce(
            (max, p) => Math.max(max, p.id_progreso),
            0
          ) + 1,
        id_perfil: Number(id_perfil),
        id_cuento: ejercicio.id_cuento,
        estado: cuentoCompletado ? 'COMPLETADO' : 'EN_PROGRESO',
        puntos_obtenidos: puntosOtorgados,
        fecha_completado: cuentoCompletado ? new Date().toISOString() : null,
      });
    }

    res.status(201).json({
      source: 'in-memory-fallback',
      data: nuevaMetrica,
      id_cuento: ejercicio.id_cuento,
      cuento_completado: cuentoCompletado,
      puntos_acumulados_actualizados: perfil?.puntos_acumulados ?? puntosOtorgados,
      retroalimentacion: retroalimentacionDUA,
    });
  } finally {
    client?.release();
  }
};

/**
 * CU-07 / CU-08 / RF-12:
 * Obtener panel de seguimiento con datos reales desde PostgreSQL:
 * - Progreso por cuento (TABLA_PROGRESO_CUENTO)
 * - Intentos registrados (TABLA_METRICA_INTENTO)
 * - Precisión promedio
 * - Recompensas canjeadas (TABLA_CANJE_RECOMPENSA)
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
      `SELECT pc.*, c.titulo AS titulo_cuento, c.tipo AS tipo_cuento, c.nivel_lectura
       FROM TABLA_PROGRESO_CUENTO pc
       JOIN TABLA_CUENTO c ON pc.id_cuento = c.id_cuento
       WHERE pc.id_perfil = $1
       ORDER BY pc.id_cuento ASC`,
      [idPerfil]
    );

    const canjesRes = await query(
      `SELECT cr.id_canje, cr.id_perfil, cr.id_recompensa, cr.fecha_canje,
              r.nombre AS nombre_recompensa, r.icono_url, r.costo_puntos
       FROM TABLA_CANJE_RECOMPENSA cr
       JOIN TABLA_RECOMPENSA r ON cr.id_recompensa = r.id_recompensa
       WHERE cr.id_perfil = $1
       ORDER BY cr.fecha_canje DESC`,
      [idPerfil]
    );

    const metricas = metricasRes.rows;
    const progresos = progresoRes.rows;
    const canjes = canjesRes.rows;

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
          tiempo_uso_estimado_min: Math.max(10, metricas.length * 4 + cuentosCompletados * 8),
        },
        progreso_cuentos: progresos,
        historial_intentos: metricas,
        recompensas_canjeadas: canjes,
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

    const canjes = fallbackStore.canjes
      .filter((c) => c.id_perfil === idPerfil)
      .map((c) => {
        const rec = fallbackStore.recompensas.find((r) => r.id_recompensa === c.id_recompensa);
        return {
          ...c,
          nombre_recompensa: rec?.nombre || 'Recompensa',
          icono_url: rec?.icono_url || '⭐',
          costo_puntos: rec?.costo_puntos || 30,
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
          tiempo_uso_estimado_min: Math.max(10, metricas.length * 4 + cuentosCompletados * 8),
        },
        progreso_cuentos: progresos,
        historial_intentos: metricas,
        recompensas_canjeadas: canjes,
      },
    });
  }
};
