import { connect } from '../../config/db/connectMysql.js';
import dotenv from 'dotenv';

dotenv.config();

// Test database helper functions
export class TestHelper {
  static async clearDatabase() {
    // Clear test data in reverse order of dependencies
    const tables = [
      'reservation', 'payment', 'invoice', 'notification', 'visitor', 
      'vehicle', 'parkingslot', 'amenity', 'property', 'profile', 
      'user_role', 'user', 'role', 'status', 'document_type'
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
      
      // Create document types
      await connect.query(`INSERT IGNORE INTO document_type (document_type_id, document_type_name, document_type_description, status_id) VALUES 
        (1, 'CC', 'Cedula de Ciudadania', 1),
        (2, 'TI', 'Tarjeta de Identidad', 1)`);
        
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
