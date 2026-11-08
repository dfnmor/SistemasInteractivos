import { Request, Response } from 'express';
import { query, fallbackStore } from '../config/db';
import { PerfilNino, TipoSordera, NivelLectura } from '../models/types';

const TIPOS_SORDERA_VALIDOS: TipoSordera[] = ['TOTAL', 'PARCIAL'];
const NIVELES_LECTURA_VALIDOS: NivelLectura[] = [
  'NO_LECTOR',
  'LECTURA_INICIAL',
  'LECTOR_AVANZADO',
];

/**
 * CU-01 / CU-02: Listar todos los perfiles adaptativos de niños registrados
 */
export const getPerfiles = async (req: Request, res: Response): Promise<void> => {
  const { id_tutor } = req.query;

  try {
    let sql = `
      SELECT p.id_perfil, p.id_tutor, p.nombre_apodo, p.fecha_nacimiento,
             p.tipo_sordera, p.nivel_lectura, p.puntos_acumulados,
             t.nombre AS nombre_tutor, t.email AS email_tutor
      FROM TABLA_PERFIL p
      LEFT JOIN TABLA_TUTOR t ON p.id_tutor = t.id_tutor
    `;
    const params: unknown[] = [];

    if (id_tutor) {
      sql += ' WHERE p.id_tutor = $1';
      params.push(Number(id_tutor));
    }

    sql += ' ORDER BY p.id_perfil ASC';

    const result = await query(sql, params);
    res.json({
      source: 'postgresql',
      total: result.rowCount,
      data: result.rows,
    });
  } catch (_err) {
    let perfiles = [...fallbackStore.perfiles];
    if (id_tutor) {
      perfiles = perfiles.filter((p) => p.id_tutor === Number(id_tutor));
    }
    const enriched = perfiles.map((p) => {
      const tutor = fallbackStore.tutores.find((t) => t.id_tutor === p.id_tutor);
      return {
        ...p,
        nombre_tutor: tutor?.nombre || 'Tutor Principal',
        email_tutor: tutor?.email || 'tutor@meexuu.org',
      };
    });
    res.json({
      source: 'in-memory-fallback',
      total: enriched.length,
      data: enriched,
    });
  }
};

/**
 * CU-01: Obtener detalle de un perfil adaptativo por su ID (Inicio de Sesión del Niño)
 */
export const getPerfilById = async (req: Request, res: Response): Promise<void> => {
  const idPerfil = Number(req.params.id);

  if (Number.isNaN(idPerfil)) {
    res.status(400).json({ error: 'ID de perfil inválido' });
    return;
  }

  try {
    const perfilRes = await query<PerfilNino>(
      `SELECT id_perfil, id_tutor, nombre_apodo, fecha_nacimiento,
              tipo_sordera, nivel_lectura, puntos_acumulados
       FROM TABLA_PERFIL WHERE id_perfil = $1`,
      [idPerfil]
    );

    if (perfilRes.rowCount === 0) {
      res.status(404).json({ error: 'Perfil infantil no encontrado' });
      return;
    }

    const progresoRes = await query(
      `SELECT pc.*, c.titulo AS titulo_cuento, c.tipo AS tipo_cuento
       FROM TABLA_PROGRESO_CUENTO pc
       JOIN TABLA_CUENTO c ON pc.id_cuento = c.id_cuento
       WHERE pc.id_perfil = $1
       ORDER BY pc.id_cuento ASC`,
      [idPerfil]
    );

    const canjesRes = await query(
      `SELECT cr.*, r.nombre AS nombre_recompensa, r.icono_url, r.costo_puntos
       FROM TABLA_CANJE_RECOMPENSA cr
       JOIN TABLA_RECOMPENSA r ON cr.id_recompensa = r.id_recompensa
       WHERE cr.id_perfil = $1
       ORDER BY cr.fecha_canje DESC`,
      [idPerfil]
    );

    res.json({
      source: 'postgresql',
      data: {
        ...perfilRes.rows[0],
        progreso_cuentos: progresoRes.rows,
        recompensas_canjeadas: canjesRes.rows,
      },
    });
  } catch (_err) {
    const perfil = fallbackStore.perfiles.find((p) => p.id_perfil === idPerfil);
    if (!perfil) {
      res.status(404).json({ error: 'Perfil infantil no encontrado' });
      return;
    }

    const progreso_cuentos = fallbackStore.progresos
      .filter((pr) => pr.id_perfil === idPerfil)
      .map((pr) => {
        const cuento = fallbackStore.cuentos.find((c) => c.id_cuento === pr.id_cuento);
        return {
          ...pr,
          titulo_cuento: cuento?.titulo,
          tipo_cuento: cuento?.tipo,
        };
      });

    const recompensas_canjeadas = fallbackStore.canjes
      .filter((c) => c.id_perfil === idPerfil)
      .map((c) => {
        const rec = fallbackStore.recompensas.find((r) => r.id_recompensa === c.id_recompensa);
        return {
          ...c,
          nombre_recompensa: rec?.nombre,
          icono_url: rec?.icono_url,
          costo_puntos: rec?.costo_puntos,
        };
      });

    res.json({
      source: 'in-memory-fallback',
      data: {
        ...perfil,
        progreso_cuentos,
        recompensas_canjeadas,
      },
    });
  }
};

/**
 * CU-02: Crear Cuenta / Gestionar Perfil (Padre/Tutor registra nuevo perfil infantil)
 */
export const createPerfil = async (req: Request, res: Response): Promise<void> => {
  const {
    id_tutor = 1,
    nombre_apodo,
    fecha_nacimiento = '2020-05-10',
    tipo_sordera,
    nivel_lectura,
  } = req.body;

  if (!nombre_apodo || !tipo_sordera || !nivel_lectura) {
    res.status(400).json({
      error: 'Faltan campos requeridos: nombre_apodo, tipo_sordera y nivel_lectura son obligatorios.',
    });
    return;
  }

  if (!TIPOS_SORDERA_VALIDOS.includes(tipo_sordera)) {
    res.status(400).json({
      error: `tipo_sordera inválido. Valores permitidos: ${TIPOS_SORDERA_VALIDOS.join(', ')}`,
    });
    return;
  }

  if (!NIVELES_LECTURA_VALIDOS.includes(nivel_lectura)) {
    res.status(400).json({
      error: `nivel_lectura inválido. Valores permitidos: ${NIVELES_LECTURA_VALIDOS.join(', ')}`,
    });
    return;
  }

  try {
    const result = await query<PerfilNino>(
      `INSERT INTO TABLA_PERFIL (id_tutor, nombre_apodo, fecha_nacimiento, tipo_sordera, nivel_lectura, puntos_acumulados)
       VALUES ($1, $2, $3, $4, $5, 0)
       RETURNING *`,
      [Number(id_tutor), String(nombre_apodo).trim(), fecha_nacimiento, tipo_sordera, nivel_lectura]
    );

    res.status(201).json({
      source: 'postgresql',
      message: 'Perfil adaptativo creado exitosamente',
      data: result.rows[0],
    });
  } catch (_err) {
    const nextId =
      fallbackStore.perfiles.reduce((max, p) => Math.max(max, p.id_perfil), 0) + 1;
    const nuevoPerfil: PerfilNino = {
      id_perfil: nextId,
      id_tutor: Number(id_tutor),
      nombre_apodo: String(nombre_apodo).trim(),
      fecha_nacimiento,
      tipo_sordera,
      nivel_lectura,
      puntos_acumulados: 0,
    };
    fallbackStore.perfiles.push(nuevoPerfil);

    res.status(201).json({
      source: 'in-memory-fallback',
      message: 'Perfil adaptativo creado exitosamente',
      data: nuevoPerfil,
    });
  }
};

/**
 * CU-02: Actualizar configuración adaptativa del perfil (tipo_sordera, nivel_lectura o nombre_apodo)
 */
export const updatePerfil = async (req: Request, res: Response): Promise<void> => {
  const idPerfil = Number(req.params.id);
  const { nombre_apodo, tipo_sordera, nivel_lectura } = req.body;

  if (Number.isNaN(idPerfil)) {
    res.status(400).json({ error: 'ID de perfil inválido' });
    return;
  }

  if (tipo_sordera && !TIPOS_SORDERA_VALIDOS.includes(tipo_sordera)) {
    res.status(400).json({ error: 'tipo_sordera debe ser TOTAL o PARCIAL' });
    return;
  }

  if (nivel_lectura && !NIVELES_LECTURA_VALIDOS.includes(nivel_lectura)) {
    res.status(400).json({
      error: 'nivel_lectura debe ser NO_LECTOR, LECTURA_INICIAL o LECTOR_AVANZADO',
    });
    return;
  }

  try {
    const result = await query<PerfilNino>(
      `UPDATE TABLA_PERFIL
       SET nombre_apodo = COALESCE($1, nombre_apodo),
           tipo_sordera = COALESCE($2, tipo_sordera),
           nivel_lectura = COALESCE($3, nivel_lectura)
       WHERE id_perfil = $4
       RETURNING *`,
      [nombre_apodo || null, tipo_sordera || null, nivel_lectura || null, idPerfil]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Perfil no encontrado' });
      return;
    }

    res.json({
      source: 'postgresql',
      message: 'Perfil adaptativo actualizado correctamente',
      data: result.rows[0],
    });
  } catch (_err) {
    const perfil = fallbackStore.perfiles.find((p) => p.id_perfil === idPerfil);
    if (!perfil) {
      res.status(404).json({ error: 'Perfil no encontrado' });
      return;
    }

    if (nombre_apodo) perfil.nombre_apodo = nombre_apodo;
    if (tipo_sordera) perfil.tipo_sordera = tipo_sordera;
    if (nivel_lectura) perfil.nivel_lectura = nivel_lectura;

    res.json({
      source: 'in-memory-fallback',
      message: 'Perfil adaptativo actualizado correctamente',
      data: perfil,
    });
  }
};

/**
 * Listar tutores registrados (TABLA_TUTOR)
 */
export const getTutores = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT id_tutor, nombre, email, fecha_registro FROM TABLA_TUTOR ORDER BY id_tutor ASC'
    );
    res.json({ source: 'postgresql', data: result.rows });
  } catch (_err) {
    res.json({ source: 'in-memory-fallback', data: fallbackStore.tutores });
  }
};
