import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

async function runMigrationsAndSeed(): Promise<void> {
  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

  console.log(`[MEEXUU DB] 1/2 Ejecutando esquema DDL desde: ${schemaPath}`);
  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('[MEEXUU DB] Esquema relacional creado correctamente.');

    console.log(`[MEEXUU DB] 2/2 Ejecutando datos semilla desde: ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await pool.query(seedSql);
    console.log('[MEEXUU DB] Datos semilla (1 tutor, 2 perfiles, 9 cuentos, 27 ejercicios, 3 recompensas) insertados con éxito en db_meexuu.');
  } catch (err) {
    console.error('[MEEXUU DB] Error al ejecutar migración/seed SQL:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigrationsAndSeed();
