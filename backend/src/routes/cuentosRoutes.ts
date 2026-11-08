import { Router } from 'express';
import {
  getCuentos,
  getCuentoById,
  registrarProgresoCuento,
} from '../controllers/cuentosController';

const router = Router();

// GET /api/cuentos?tipo=LSM&nivel_lectura=NO_LECTOR&id_perfil=1 (CU-03)
router.get('/', getCuentos);

// GET /api/cuentos/:id -> Detalle del cuento y ejercicios NUI/AR (CU-04)
router.get('/:id', getCuentoById);

// POST /api/cuentos/:id/progreso -> Registrar avance o finalización del cuento (CU-04 / RF-02 / RF-10)
router.post('/:id/progreso', registrarProgresoCuento);

export default router;
