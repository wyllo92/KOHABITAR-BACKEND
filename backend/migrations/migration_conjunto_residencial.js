import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'conjunto_residencial',
  multipleStatements: true
};

export async function runMigration() {
  let connection;
  try {
    // Leer el archivo SQL completo
    const sqlPath = path.resolve(__dirname, '../data/db/conjunto_residencial.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Crear conexión
    connection = await mysql.createConnection(dbConfig);
    console.log('Conectado a la base de datos MySQL');

    // Ejecutar el SQL
    await connection.query(sql);
    console.log('¡Migración de conjunto_residencial completada exitosamente!');
    return { success: true };
  } catch (error) {
    console.error('Error en la migración:', error);
    return { success: false, error };
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión a la base de datos cerrada');
    }
  }
} 