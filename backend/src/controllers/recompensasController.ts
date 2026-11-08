import { Request, Response } from 'express';
import { query, fallbackStore } from '../config/db';
import { Recompensa } from '../models/types';

/**
 * RF-11 / CU-09: Obtener catálogo de recompensas e indicar cuáles ya canjeó el niño
 */
export const getRecompensas = async (req: Request, res: Response): Promise<void> => {
  const { id_perfil } = req.query;

  try {
    const recRes = await query<Recompensa>(
      'SELECT * FROM TABLA_RECOMPENSA ORDER BY costo_puntos ASC, id_recompensa ASC'
    );

    let canjeadasIds = new Set<number>();
    if (id_perfil) {
      const canjesRes = await query(
        'SELECT id_recompensa FROM TABLA_CANJE_RECOMPENSA WHERE id_perfil = $1',
        [Number(id_perfil)]
      );
      canjesRes.rows.forEach((row) => canjeadasIds.add(row.id_recompensa));
    }

    const data = recRes.rows.map((r) => ({
      ...r,
      desbloqueada: canjeadasIds.has(r.id_recompensa),
    }));

    res.json({
      source: 'postgresql',
      data,
    });
  } catch (_err) {
    const canjeadasIds = new Set<number>(
      id_perfil
        ? fallbackStore.canjes
            .filter((c) => c.id_perfil === Number(id_perfil))
            .map((c) => c.id_recompensa)
        : []
    );

    const data = fallbackStore.recompensas.map((r) => ({
      ...r,
      desbloqueada: canjeadasIds.has(r.id_recompensa),
    }));

    res.json({
      source: 'in-memory-fallback',
      data,
    });
  }
};

/**
 * CU-09: Canjear una recompensa con los puntos acumulados del niño
 * Incluye Flujo Alternativo 5b: si no tiene suficientes puntos, informa amablemente sin penalizar.
 */
export const canjearRecompensa = async (req: Request, res: Response): Promise<void> => {
  const { id_perfil, id_recompensa } = req.body;

  if (!id_perfil || !id_recompensa) {
    res.status(400).json({ error: 'Se requieren id_perfil e id_recompensa' });
    return;
  }

  const perfilId = Number(id_perfil);
  const recompensaId = Number(id_recompensa);

  try {
    const perfilRes = await query(
      'SELECT * FROM TABLA_PERFIL WHERE id_perfil = $1',
      [perfilId]
    );
    const recRes = await query<Recompensa>(
      'SELECT * FROM TABLA_RECOMPENSA WHERE id_recompensa = $1',
      [recompensaId]
    );

    if (perfilRes.rowCount === 0 || recRes.rowCount === 0) {
      res.status(404).json({ error: 'Perfil o recompensa no encontrados' });
      return;
    }

    const perfil = perfilRes.rows[0];
    const recompensa = recRes.rows[0];

    const yaCanjeada = await query(
      'SELECT * FROM TABLA_CANJE_RECOMPENSA WHERE id_perfil = $1 AND id_recompensa = $2',
      [perfilId, recompensaId]
    );

    if ((yaCanjeada.rowCount ?? 0) > 0) {
      res.status(400).json({
        error: '¡Ya tienes este trofeo en tu colección!',
      });
      return;
    }

    // Flujo Alternativo 5b (CU-09): Puntos insuficientes
    if (perfil.puntos_acumulados < recompensa.costo_puntos) {
      const faltantes = recompensa.costo_puntos - perfil.puntos_acumulados;
      res.status(400).json({
        error: `¡Te faltan ${faltantes} estrellas para desbloquear "${recompensa.nombre}"! Practica un ejercicio más.`,
        puntos_actuales: perfil.puntos_acumulados,
        costo_recompensa: recompensa.costo_puntos,
      });
      return;
    }

    const nuevoSaldo = perfil.puntos_acumulados - recompensa.costo_puntos;

    await query(
      'UPDATE TABLA_PERFIL SET puntos_acumulados = $1 WHERE id_perfil = $2',
      [nuevoSaldo, perfilId]
    );

    const canjeRes = await query(
      `INSERT INTO TABLA_CANJE_RECOMPENSA (id_perfil, id_recompensa, fecha_canje)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [perfilId, recompensaId]
    );

    res.status(201).json({
      source: 'postgresql',
      message: `¡Felicidades! Desbloqueaste "${recompensa.nombre}" ${recompensa.icono_url}`,
      puntos_acumulados_actualizados: nuevoSaldo,
      data: canjeRes.rows[0],
    });
  } catch (_err) {
    const perfil = fallbackStore.perfiles.find((p) => p.id_perfil === perfilId);
    const recompensa = fallbackStore.recompensas.find(
      (r) => r.id_recompensa === recompensaId
    );

    if (!perfil || !recompensa) {
      res.status(404).json({ error: 'Perfil o recompensa no encontrados' });
      return;
    }

    const yaCanjeada = fallbackStore.canjes.some(
      (c) => c.id_perfil === perfilId && c.id_recompensa === recompensaId
    );
    if (yaCanjeada) {
      res.status(400).json({ error: '¡Ya tienes este trofeo en tu colección!' });
      return;
    }

    if (perfil.puntos_acumulados < recompensa.costo_puntos) {
      const faltantes = recompensa.costo_puntos - perfil.puntos_acumulados;
      res.status(400).json({
        error: `¡Te faltan ${faltantes} estrellas para desbloquear "${recompensa.nombre}"! Practica un ejercicio más.`,
        puntos_actuales: perfil.puntos_acumulados,
        costo_recompensa: recompensa.costo_puntos,
      });
      return;
    }

    perfil.puntos_acumulados -= recompensa.costo_puntos;
    const nextId =
      fallbackStore.canjes.reduce((max, c) => Math.max(max, c.id_canje), 0) + 1;
    const nuevoCanje = {
      id_canje: nextId,
      id_perfil: perfilId,
      id_recompensa: recompensaId,
      fecha_canje: new Date().toISOString(),
    };
    fallbackStore.canjes.push(nuevoCanje);

    res.status(201).json({
      source: 'in-memory-fallback',
      message: `¡Felicidades! Desbloqueaste "${recompensa.nombre}" ${recompensa.icono_url}`,
      puntos_acumulados_actualizados: perfil.puntos_acumulados,
      data: nuevoCanje,
    });
  }
};

