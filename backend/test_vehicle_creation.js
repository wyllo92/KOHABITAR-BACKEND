import mysql from 'mysql2/promise';

async function testDirectInsert() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'conjunto_residencial'
  });
  
  try {
    console.log('=== Checking existing data ===');
    
    // Check status table
    const [statusResults] = await connection.execute('SELECT * FROM status');
    console.log('Status records:', statusResults.length);
    
    // Check role table  
    const [roleResults] = await connection.execute('SELECT * FROM role');
    console.log('Role records:', roleResults.length);
    
    // Check user table
    const [userResults] = await connection.execute('SELECT * FROM user');
    console.log('User records:', userResults.length);
    
    // Check property table
    const [propertyResults] = await connection.execute('SELECT * FROM property');
    console.log('Property records:', propertyResults.length);
    
    console.log('\n=== Creating test data ===');
    
    // Create status if needed
    if (statusResults.length === 0) {
      await connection.execute(`INSERT INTO status (status_id, status_name) VALUES (1, 'Active'), (2, 'Inactive')`);
      console.log('Created status records');
    }
    
    // Create role if needed
    if (roleResults.length === 0) {
      await connection.execute(`INSERT INTO role (role_id, role_name, role_description, status_id) VALUES (1, 'Admin', 'Administrator role', 1)`);
      console.log('Created role records');
    }
    
    // Create user if needed
    if (userResults.length === 0) {
      await connection.execute(`INSERT INTO user (user_id, user_name, user_password, role_id, status_id, created_at, updated_at) VALUES (1, 'testuser', 'testpass', 1, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')`);
      console.log('Created user record');
    }
    
    // Create property if needed
    if (propertyResults.length === 0) {
      await connection.execute(`INSERT INTO property (property_id, property_name, property_type, property_createAt, property_updateAt) VALUES (1, 'Test Property', 'Apartment', '2024-01-01', '2024-01-01')`);
      console.log('Created property record');
    }
    
    console.log('\n=== Testing vehicle insertion ===');
    
    // Now try to insert vehicle
    const vehicleQuery = `INSERT INTO vehicle (model, type, color, license_plate, user_id, property_id, parkingZone_id, status_id, vehicle_createAt, vehicle_updateAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const vehicleValues = ['Toyota', 'Car', 'Red', 'TEST123', 1, 1, null, 1, '2024-01-01', '2024-01-01'];
    
    const [vehicleResult] = await connection.execute(vehicleQuery, vehicleValues);
    console.log('Vehicle inserted with ID:', vehicleResult.insertId);
    
    // Verify vehicle was created
    const [vehicles] = await connection.execute('SELECT * FROM vehicle WHERE vehicle_id = ?', [vehicleResult.insertId]);
    console.log('Vehicle verified:', vehicles.length > 0 ? 'YES' : 'NO');
    
    // Clean up the test vehicle
    await connection.execute('DELETE FROM vehicle WHERE vehicle_id = ?', [vehicleResult.insertId]);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

testDirectInsert();
