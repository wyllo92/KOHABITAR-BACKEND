import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

// Database configuration without database name
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
};

async function createDatabase() {
    let connection;
    try {
        console.log('Connecting to MySQL server...');
        connection = await mysql.createConnection(dbConfig);

        const databaseName = process.env.DB_NAME || 'conjunto_residencial';
        console.log(`Creating database: ${databaseName}`);

        // Create database if it doesn't exist
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`);

        console.log(`Database '${databaseName}' created successfully or already exists.`);

    } catch (error) {
        console.error('Error creating database:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the database creation
createDatabase().catch(console.error);
