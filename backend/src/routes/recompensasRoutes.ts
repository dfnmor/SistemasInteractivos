import { Router } from 'express';
import {
  getRecompensas,
  canjearRecompensa,
} from '../controllers/recompensasController';

const router = Router();

// GET /api/recompensas?id_perfil=1 -> Catálogo de trofeos y estado de desbloqueo (RF-11)
router.get('/', getRecompensas);

// POST /api/recompensas/canjear -> Canjear recompensa por puntos acumulados (CU-09)
router.post('/canjear', canjearRecompensa);

export default router;
