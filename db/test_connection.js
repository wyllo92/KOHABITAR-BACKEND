import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const configs = [
    {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      port: process.env.DB_PORT || 3306,
    },
    {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: '',
      port: process.env.DB_PORT || 3306,
    },
    {
      host: process.env.DB_HOST || 'localhost',
      user: 'root',
      password: '',
      port: process.env.DB_PORT || 3306,
    }
  ];

  for (let i = 0; i < configs.length; i++) {
    console.log(`\nTesting configuration ${i + 1}:`, {
      host: configs[i].host,
      user: configs[i].user,
      password: configs[i].password ? '[HIDDEN]' : '[EMPTY]',
      port: configs[i].port
    });
    
    try {
      const connection = await mysql.createConnection(configs[i]);
      console.log(' Connection successful!');
      
      // Test database access
      try {
        await connection.execute(`USE conjunto_residencial;`);
        console.log(' Database access successful!');
      } catch (dbError) {
        console.log('Database access failed:', dbError.message);
      }
      
      await connection.end();
      return configs[i];
      
    } catch (error) {
      console.log(' Connection failed:', error.message);
    }
  }
  
  return null;
}

testConnection().then(result => {
  if (result) {
    console.log('\nFound working configuration:', result);
  } else {
    console.log('\nNo working configuration found');
  }
}).catch(console.error);
