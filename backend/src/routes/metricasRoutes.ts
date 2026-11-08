import { Router } from 'express';
import {
  registrarMetricaIntento,
  getEstadisticasPerfil,
} from '../controllers/metricasController';

const router = Router();

// POST /api/metricas -> Registrar intento de visión artificial o articulación oral (CU-05, CU-06, RF-07)
router.post('/', registrarMetricaIntento);

// GET /api/metricas/perfil/:id_perfil -> Estadísticas y Panel de Seguimiento para Padre/Tutor (CU-07, CU-08, RF-12)
router.get('/perfil/:id_perfil', getEstadisticasPerfil);

export default router;
