import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkDatabaseConnection } from './config/db';
import perfilesRoutes from './routes/perfilesRoutes';
import cuentosRoutes from './routes/cuentosRoutes';
import metricasRoutes from './routes/metricasRoutes';
import recompensasRoutes from './routes/recompensasRoutes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json());

/**
 * Endpoint de Salud (/api/health)
 * Verifica el estado del servidor API y la conexión con el contenedor PostgreSQL (db_meexuu)
 */
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();

  res.status(200).json({
    status: 'OK',
    sistema: 'Señas y Sonrisas - Plataforma LSM y Articulación Oral',
    clave_sistema: 'TSI-2026-MEEXUU',
    framework: 'MEEXUU Framework (WCAG 2.2 AAA + DUA)',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Rutas Modulares conforme a la Arquitectura de 4 Capas y Casos de Uso
app.use('/api/perfiles', perfilesRoutes);
app.use('/api/cuentos', cuentosRoutes);
app.use('/api/metricas', metricasRoutes);
app.use('/api/recompensas', recompensasRoutes);

// Ruta raíz informativa
app.get('/', (_req: Request, res: Response) => {
  res.json({
    mensaje: 'API de Señas y Sonrisas (MEEXUU Framework) activa',
    endpoints: [
      '/api/health',
      '/api/perfiles',
      '/api/cuentos',
      '/api/metricas',
      '/api/recompensas',
    ],
  });
});

app.listen(PORT, () => {
  console.log(`===================================================================`);
  console.log(`🌟 Servidor API "Señas y Sonrisas" (TSI-2026-MEEXUU) activo`);
  console.log(`🔗 URL Local:   http://localhost:${PORT}`);
  console.log(`🩺 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`===================================================================`);
});

export default app;
