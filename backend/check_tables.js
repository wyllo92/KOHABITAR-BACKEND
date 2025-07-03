import mysql from 'mysql2/promise';

async function checkSchemas() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'conjunto_residencial'
  });
  
  console.log('=== USER TABLE ===');
  const [userCols] = await connection.execute('DESCRIBE user;');
  userCols.forEach(col => console.log(col.Field));
  
  console.log('\n=== PROPERTY TABLE ===');
  const [propCols] = await connection.execute('DESCRIBE property;');
  propCols.forEach(col => console.log(col.Field));
  
  await connection.end();
}

checkSchemas().catch(console.error);
