import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

async function checkVehicleSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [result] = await connection.execute('DESCRIBE vehicle');
    console.log('Vehicle table schema:');
    console.table(result);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkVehicleSchema();
