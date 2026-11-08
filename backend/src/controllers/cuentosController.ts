import { Request, Response } from 'express';
import { query, fallbackStore } from '../config/db';
import { Cuento, EjercicioCuento, EstadoProgreso } from '../models/types';

/**
 * CU-03: Seleccionar Cuento / Módulo (RF-03, RF-04, RF-08)
 * Permite filtrar por `tipo` ('LSM' | 'ARTICULACION') y `nivel_lectura` ('NO_LECTOR' | 'LECTURA_INICIAL' | 'LECTOR_AVANZADO')
 */
export const getCuentos = async (req: Request, res: Response): Promise<void> => {
  const { tipo, nivel_lectura, id_perfil } = req.query;

  try {
    const conditions: string[] = ['c.activo = TRUE'];
    const params: unknown[] = [];

    if (tipo) {
      params.push(String(tipo).toUpperCase());
      conditions.push(`c.tipo = $${params.length}`);
    }

    if (nivel_lectura) {
      params.push(String(nivel_lectura).toUpperCase());
      conditions.push(`c.nivel_lectura = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const cuentosRes = await query<Cuento>(
      `SELECT c.*
       FROM TABLA_CUENTO c
       ${whereClause}
       ORDER BY c.orden_dificultad ASC, c.id_cuento ASC`,
      params
    );

    const ejerciciosRes = await query<EjercicioCuento>(
      'SELECT * FROM TABLA_EJERCICIO_CUENTO ORDER BY id_cuento ASC, orden_en_cuento ASC'
    );

    let progresosMap = new Map<number, { estado: EstadoProgreso; puntos_obtenidos: number }>();
    if (id_perfil) {
      const progRes = await query(
        'SELECT id_cuento, estado, puntos_obtenidos FROM TABLA_PROGRESO_CUENTO WHERE id_perfil = $1',
        [Number(id_perfil)]
      );
      progRes.rows.forEach((row) => {
        progresosMap.set(row.id_cuento, {
          estado: row.estado,
          puntos_obtenidos: row.puntos_obtenidos,
        });
      });
    }

    const data = cuentosRes.rows.map((cuento) => ({
      ...cuento,
      ejercicios: ejerciciosRes.rows.filter((e) => e.id_cuento === cuento.id_cuento),
      progreso_usuario: progresosMap.get(cuento.id_cuento) || null,
    }));

    res.json({
      source: 'postgresql',
      total: data.length,
      data,
    });
  } catch (_err) {
    let cuentos = fallbackStore.cuentos.filter((c) => c.activo);

    if (tipo) {
      cuentos = cuentos.filter((c) => c.tipo === String(tipo).toUpperCase());
    }
    if (nivel_lectura) {
      cuentos = cuentos.filter((c) => c.nivel_lectura === String(nivel_lectura).toUpperCase());
    }

    const data = cuentos
      .sort((a, b) => a.orden_dificultad - b.orden_dificultad)
      .map((cuento) => {
        const ejercicios = fallbackStore.ejercicios
          .filter((e) => e.id_cuento === cuento.id_cuento)
          .sort((a, b) => a.orden_en_cuento - b.orden_en_cuento);

        const prog = id_perfil
          ? fallbackStore.progresos.find(
              (p) => p.id_perfil === Number(id_perfil) && p.id_cuento === cuento.id_cuento
            )
          : null;

        return {
          ...cuento,
          ejercicios,
          progreso_usuario: prog
            ? { estado: prog.estado, puntos_obtenidos: prog.puntos_obtenidos }
            : null,
        };
      });

    res.json({
      source: 'in-memory-fallback',
      total: data.length,
      data,
    });
  }
};

/**
 * CU-04: Ver Cuento con todos sus Nodos de Interacción (TABLA_EJERCICIO_CUENTO)
 */
export const getCuentoById = async (req: Request, res: Response): Promise<void> => {
  const idCuento = Number(req.params.id);

  if (Number.isNaN(idCuento)) {
    res.status(400).json({ error: 'ID de cuento inválido' });
    return;
  }

  try {
    const cuentoRes = await query<Cuento>(
      'SELECT * FROM TABLA_CUENTO WHERE id_cuento = $1',
      [idCuento]
    );

    if (cuentoRes.rowCount === 0) {
      res.status(404).json({ error: 'Cuento no encontrado' });
      return;
    }

    const ejerciciosRes = await query<EjercicioCuento>(
      'SELECT * FROM TABLA_EJERCICIO_CUENTO WHERE id_cuento = $1 ORDER BY orden_en_cuento ASC',
      [idCuento]
    );

    res.json({
      source: 'postgresql',
      data: {
        ...cuentoRes.rows[0],
        ejercicios: ejerciciosRes.rows,
      },
    });
  } catch (_err) {
    const cuento = fallbackStore.cuentos.find((c) => c.id_cuento === idCuento);
    if (!cuento) {
      res.status(404).json({ error: 'Cuento no encontrado' });
      return;
    }

    const ejercicios = fallbackStore.ejercicios
      .filter((e) => e.id_cuento === idCuento)
      .sort((a, b) => a.orden_en_cuento - b.orden_en_cuento);

    res.json({
      source: 'in-memory-fallback',
      data: {
        ...cuento,
        ejercicios,
      },
    });
  }
};

/**
 * CU-04 / RF-02 / RF-10: Registrar o actualizar el progreso de un niño en un cuento
 */
export const registrarProgresoCuento = async (req: Request, res: Response): Promise<void> => {
  const idCuento = Number(req.params.id);
  const { id_perfil, estado = 'COMPLETADO', puntos_obtenidos = 30 } = req.body;

  if (Number.isNaN(idCuento) || !id_perfil) {
    res.status(400).json({ error: 'Se requiere id_cuento válido e id_perfil' });
    return;
  }

  const puntos = Math.max(0, Number(puntos_obtenidos) || 0);
  const estadoValido: EstadoProgreso =
    estado === 'EN_PROGRESO' ? 'EN_PROGRESO' : 'COMPLETADO';

  try {
    const fechaCompletado = estadoValido === 'COMPLETADO' ? new Date().toISOString() : null;

    const progresoRes = await query(
      `INSERT INTO TABLA_PROGRESO_CUENTO (id_perfil, id_cuento, estado, puntos_obtenidos, fecha_completado)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id_perfil, id_cuento)
       DO UPDATE SET
         estado = EXCLUDED.estado,
         puntos_obtenidos = GREATEST(TABLA_PROGRESO_CUENTO.puntos_obtenidos, EXCLUDED.puntos_obtenidos),
         fecha_completado = COALESCE(EXCLUDED.fecha_completado, TABLA_PROGRESO_CUENTO.fecha_completado)
       RETURNING *`,
      [Number(id_perfil), idCuento, estadoValido, puntos, fechaCompletado]
    );

    if (puntos > 0 && estadoValido === 'COMPLETADO') {
      await query(
        `UPDATE TABLA_PERFIL
         SET puntos_acumulados = puntos_acumulados + $1
         WHERE id_perfil = $2`,
        [puntos, Number(id_perfil)]
      );
    }

    res.status(201).json({
      source: 'postgresql',
      message: 'Progreso del cuento actualizado y puntos otorgados',
      data: progresoRes.rows[0],
    });
  } catch (_err) {
    const existing = fallbackStore.progresos.find(
      (p) => p.id_perfil === Number(id_perfil) && p.id_cuento === idCuento
    );

    const now = estadoValido === 'COMPLETADO' ? new Date().toISOString() : null;

    if (existing) {
      existing.estado = estadoValido;
      existing.puntos_obtenidos = Math.max(existing.puntos_obtenidos, puntos);
      existing.fecha_completado = now || existing.fecha_completado;
    } else {
      const nextId =
        fallbackStore.progresos.reduce((max, p) => Math.max(max, p.id_progreso), 0) + 1;
      fallbackStore.progresos.push({
        id_progreso: nextId,
        id_perfil: Number(id_perfil),
        id_cuento: idCuento,
        estado: estadoValido,
        puntos_obtenidos: puntos,
        fecha_completado: now,
      });
    }

    const perfil = fallbackStore.perfiles.find((p) => p.id_perfil === Number(id_perfil));
    if (perfil && puntos > 0 && estadoValido === 'COMPLETADO') {
      perfil.puntos_acumulados += puntos;
    }

    res.status(201).json({
      source: 'in-memory-fallback',
      message: 'Progreso del cuento actualizado y puntos otorgados',
      data: existing || fallbackStore.progresos[fallbackStore.progresos.length - 1],
    });
  }
};
