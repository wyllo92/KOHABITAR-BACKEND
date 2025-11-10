import dotenv from 'dotenv';
import { createPool } from "mysql2/promise";


dotenv.config();
// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'conjunto_residencial',
  port: process.env.DB_PORT || '3306'
};
export const connect = createPool(dbConfig);