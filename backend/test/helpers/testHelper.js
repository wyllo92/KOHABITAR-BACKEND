import { connect } from '../../config/db/connectMysql.js';
import dotenv from 'dotenv';

dotenv.config();

// Test database helper functions
export class TestHelper {
  static async clearDatabase() {
    // Clear test data in reverse order of dependencies
    const tables = [
      'reservation', 'payment', 'invoice', 'notification', 
      'vehicle', 'parkingslot', 'amenity', 'property', 'profile', 
      'user', 'role', 'status'
    ];
    
    for (const table of tables) {
      try {
        await connect.query(`DELETE FROM ${table} WHERE 1=1`);
      } catch (error) {
        console.log(`Warning: Could not clear table ${table}:`, error.message);
      }
    }
  }

  static async createTestData() {
    // Create basic test data needed for tests
    try {
      // Create status records
      await connect.query(`INSERT IGNORE INTO status (status_id, status_name) VALUES 
        (1, 'Active'), (2, 'Inactive')`);
      
      // Create roles
      await connect.query(`INSERT IGNORE INTO role (role_id, role_name, role_description, status_id) VALUES 
        (1, 'Admin', 'Administrator role', 1), 
        (2, 'User', 'Regular user role', 1)`);
      
      // Create test user
      await connect.query(`INSERT IGNORE INTO user (user_id, user_name, user_password, role_id, status_id, created_at, updated_at) VALUES 
        (1, 'testuser', '$2b$10$test.hash.password', 1, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')`);
        
      // Create test property
      await connect.query(`INSERT IGNORE INTO property (property_id, property_name, property_type, property_createAt, property_updateAt) VALUES 
        (1, 'Test Property', 'Apartment', '2024-01-01', '2024-01-01')`);
        
    } catch (error) {
      console.error('Error creating test data:', error);
    }
  }

  static async resetDatabase() {
    await this.clearDatabase();
    await this.createTestData();
  }
}

// Mock request and response objects for testing
export const createMockReq = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
  headers: {},
  user: null
});

export const createMockRes = () => {
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.data = data;
      return this;
    },
    send: function(data) {
      this.data = data;
      return this;
    },
    statusCode: 200,
    data: null
  };
  return res;
};
