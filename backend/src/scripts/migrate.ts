import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

async function runMigrations(): Promise<void> {
  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  console.log(`[MEEXUU DB] Ejecutando esquema SQL desde: ${schemaPath}`);

  try {
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sqlContent);
    console.log('[MEEXUU DB] Esquema relacional e inicialización completados con éxito en db_meexuu.');
  } catch (err) {
    console.error('[MEEXUU DB] Error al ejecutar migración SQL:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigrations();
