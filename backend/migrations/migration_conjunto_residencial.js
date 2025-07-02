import { createPool } from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

// Database configuration without database name for initial connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || '3306'
};

async function createDatabase() {
  const connection = createPool(dbConfig);
  
  try {
    console.log('Conectando a MySQL...');
    
    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS conjunto_residencial');
    console.log('Base de datos "conjunto_residencial" creada o ya existe');
    
    // Use the database
    await connection.query('USE conjunto_residencial');
    console.log('Usando base de datos "conjunto_residencial"');
    
    // Read and execute the SQL file
    const fs = await import('fs');
    const path = await import('path');
    const sqlFilePath = path.join(process.cwd(), 'data', 'db', 'conjunto_residencial.sql');
    
    if (fs.existsSync(sqlFilePath)) {
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      
      // Split the SQL content by semicolons and execute each statement
      const statements = sqlContent
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0 && !statement.startsWith('--') && !statement.startsWith('/*'));
      
      for (const statement of statements) {
        if (statement.length > 0) {
          try {
            await connection.query(statement);
            console.log('Ejecutado:', statement.substring(0, 50) + '...');
          } catch (error) {
            console.error('Error ejecutando statement:', error.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
          }
        }
      }
      
      console.log('Migración completada exitosamente');
    } else {
      console.error('Archivo SQL no encontrado:', sqlFilePath);
    }
    
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    await connection.end();
  }
}

// Run the migration
createDatabase(); 