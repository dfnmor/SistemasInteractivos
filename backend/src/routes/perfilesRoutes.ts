import { Router } from 'express';
import {
  getPerfiles,
  getPerfilById,
  createPerfil,
  updatePerfil,
  getTutores,
} from '../controllers/perfilesController';

const router = Router();

// GET /api/perfiles/tutores -> Lista de padres/tutores/terapeutas (TABLA_TUTOR)
router.get('/tutores', getTutores);

// GET /api/perfiles -> Lista de perfiles adaptativos infantiles (TABLA_PERFIL)
router.get('/', getPerfiles);

// GET /api/perfiles/:id -> Detalle de un perfil infantil con progreso y trofeos (CU-01)
router.get('/:id', getPerfilById);

// POST /api/perfiles -> Crear nuevo perfil adaptativo infantil (CU-02)
router.post('/', createPerfil);

// PUT /api/perfiles/:id -> Actualizar tipo_sordera o nivel_lectura del perfil (CU-02)
router.put('/:id', updatePerfil);

export default router;
