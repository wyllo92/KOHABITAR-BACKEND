import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

async function dropDocumentTypeTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await connection.execute('DROP TABLE IF EXISTS document_type');
    console.log('Document type table dropped successfully');
  } catch (error) {
    console.error('Error dropping table:', error.message);
  } finally {
    await connection.end();
  }
}

dropDocumentTypeTable();
