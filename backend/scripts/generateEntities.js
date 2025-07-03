#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Controller template following the user controller pattern
const generateControllerTemplate = (modelName, fields) => {
  const ModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  const primaryKey = fields.primaryKey || `${modelName}_id`;
  const requiredFields = fields.required || [];
  const allFields = fields.all || [];

  return `import ${ModelName}Model from '../models/${modelName}.model.js';

class ${ModelName}Controller {

  async register(req, res) {
    try {
      const { ${allFields.join(', ')} } = req.body;
      // Basic validation
      if (${requiredFields.map(field => `!${field}`).join(' || ')}) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      
      const ${modelName}Id = await ${ModelName}Model.create({
        ${allFields.join(',\n        ')}
      });
      res.status(201).json({
        message: '${ModelName} created successfully',
        id: ${modelName}Id
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    try {
      // Verify if the ${ModelName} already exists
      const ${modelName}Model = await ${ModelName}Model.showActive();
      if (!${modelName}Model) {
        return res.status(409).json({ error: 'The ${ModelName} no already exists' });
      }
      res.status(201).json({
        message: '${ModelName} successfully',
        data: ${modelName}Model
      });
    } catch (error) {
      console.error('Error in registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    try {
      const { ${allFields.join(', ')} } = req.body;
      const id = req.params.id;
      // Basic validation
      if (${requiredFields.map(field => `!${field}`).join(' || ')} || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Verify if the ${ModelName} already exists  
      const existing${ModelName} = await ${ModelName}Model.findByIdActive(id);
      if (!existing${ModelName}) {
        return res.status(409).json({ data: '', error: 'The ${ModelName} no already exists' });
      }   

      const update${ModelName}Model = await ${ModelName}Model.update(id, { 
        ${allFields.join(', ')} 
      });
      res.status(201).json({
        message: '${ModelName} update successfully',
        data: update${ModelName}Model
      });
    } catch (error) {
      console.error('Error in registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Verify if the ${ModelName} already exists
      const delete${ModelName}Model = await ${ModelName}Model.delete(id);
      res.status(201).json({
        message: '${ModelName} delete successfully',
        data: delete${ModelName}Model
      });
    } catch (error) {
      console.error('Error in registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Verify if the ${ModelName} already exists
      const existing${ModelName}Model = await ${ModelName}Model.findByIdActive(id);
      if (!existing${ModelName}Model) {
        return res.status(409).json({ error: 'The ${ModelName} No already exists' });
      }
      res.status(201).json({
        message: '${ModelName} successfully',
        data: existing${ModelName}Model
      });
    } catch (error) {
      console.error('Error in registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new ${ModelName}Controller();`;
};

// Model template following the user model pattern
const generateModelTemplate = (modelName, tableName, fields) => {
  const ModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  const primaryKey = fields.primaryKey || `${modelName}_id`;
  const allFields = fields.all || [];

  return `import { connect } from '../config/db/connectMysql.js';

class ${ModelName}Model {

  static async create({ ${allFields.join(', ')} }) {
    try {
      const [result] = await connect.query(
        'INSERT INTO ${tableName} (${allFields.join(', ')}) VALUES (${allFields.map(() => '?').join(', ')})',
        [${allFields.join(', ')}]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating ${modelName}:', error);
      return null;
    }
  }

  static async show() {
    try {
      const [rows] = await connect.query(
        'SELECT * FROM ${tableName} ORDER BY ${primaryKey}'
      );
      return rows;
    } catch (error) {
      console.error('Error showing ${modelName}s:', error);
      return [];
    }
  }

  static async showActive() {
    try {
      const [rows] = await connect.query(
        'SELECT * FROM ${tableName} WHERE status_id = 1 ORDER BY ${primaryKey}'
      );
      return rows;
    } catch (error) {
      console.error('Error showing active ${modelName}s:', error);
      return [];
    }
  }

  static async update(id, { ${allFields.join(', ')} }) {
    try {
      const [result] = await connect.query(
        'UPDATE ${tableName} SET ${allFields.map(field => `${field} = ?`).join(', ')} WHERE ${primaryKey} = ?',
        [${allFields.join(', ')}, id]
      );
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error updating ${modelName}:', error);
      return null;
    }
  }

  static async delete(id) {
    try {
      const [result] = await connect.query(
        'DELETE FROM ${tableName} WHERE ${primaryKey} = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting ${modelName}:', error);
      return false;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await connect.query(
        'SELECT * FROM ${tableName} WHERE ${primaryKey} = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding ${modelName} by id:', error);
      return null;
    }
  }

  static async findByIdActive(id) {
    try {
      const [rows] = await connect.query(
        'SELECT * FROM ${tableName} WHERE ${primaryKey} = ? AND status_id = 1',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding active ${modelName} by id:', error);
      return null;
    }
  }
}

export default ${ModelName}Model;`;
};

// Test template for controllers
const generateControllerTestTemplate = (modelName, fields) => {
  const ModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  const testData = fields.testData || {};

  return `import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import ${ModelName}Controller from '../../controllers/${modelName}.controller.js';
import ${ModelName}Model from '../../models/${modelName}.model.js';
import { TestHelper, createMockReq, createMockRes } from '../helpers/testHelper.js';

describe('${ModelName} Controller', () => {
  beforeEach(async () => {
    await TestHelper.resetDatabase();
  });

  afterEach(async () => {
    await TestHelper.clearDatabase();
  });

  describe('register', () => {
    it('should create a new ${modelName} successfully', async () => {
      const req = createMockReq(${JSON.stringify(testData, null, 8)});
      const res = createMockRes();

      await ${ModelName}Controller.register(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', '${ModelName} created successfully');
      expect(res.data).to.have.property('id');
    });

    it('should return error for missing required fields', async () => {
      const req = createMockReq({});
      const res = createMockRes();

      await ${ModelName}Controller.register(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data).to.have.property('error', 'Required fields are missing');
    });
  });

  describe('show', () => {
    it('should return all active ${modelName}s', async () => {
      await ${ModelName}Model.create(${JSON.stringify(testData, null, 8)});

      const req = createMockReq();
      const res = createMockRes();

      await ${ModelName}Controller.show(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', '${ModelName} successfully');
      expect(res.data).to.have.property('data');
      expect(res.data.data).to.be.an('array');
    });
  });

  describe('update', () => {
    it('should update ${modelName} successfully', async () => {
      const ${modelName}Id = await ${ModelName}Model.create(${JSON.stringify(testData, null, 8)});

      const req = createMockReq(${JSON.stringify(testData, null, 8)}, { id: ${modelName}Id });
      const res = createMockRes();

      await ${ModelName}Controller.update(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', '${ModelName} update successfully');
    });
  });

  describe('delete', () => {
    it('should delete ${modelName} successfully', async () => {
      const ${modelName}Id = await ${ModelName}Model.create(${JSON.stringify(testData, null, 8)});

      const req = createMockReq({}, { id: ${modelName}Id });
      const res = createMockRes();

      await ${ModelName}Controller.delete(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', '${ModelName} delete successfully');
    });
  });

  describe('findById', () => {
    it('should find ${modelName} by id successfully', async () => {
      const ${modelName}Id = await ${ModelName}Model.create(${JSON.stringify(testData, null, 8)});

      const req = createMockReq({}, { id: ${modelName}Id });
      const res = createMockRes();

      await ${ModelName}Controller.findById(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', '${ModelName} successfully');
      expect(res.data).to.have.property('data');
    });
  });
});`;
};

// Define entity configurations
const entities = {
  vehicle: {
    tableName: 'vehicle',
    primaryKey: 'vehicle_id',
    required: ['license_plate', 'vehicle_type', 'status_id'],
    all: ['license_plate', 'brand', 'model', 'color', 'vehicle_type', 'status_id', 'user_id'],
    testData: {
      license_plate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      color: 'Blue',
      vehicle_type: 'Car',
      status_id: 1,
      user_id: null
    }
  },
  visitor: {
    tableName: 'visitor',
    primaryKey: 'visitor_id',
    required: ['visitor_name', 'visitor_document', 'status_id'],
    all: ['visitor_name', 'visitor_document', 'visitor_phone', 'visitor_email', 'status_id', 'property_id'],
    testData: {
      visitor_name: 'John Doe',
      visitor_document: '12345678',
      visitor_phone: '+1234567890',
      visitor_email: 'john@example.com',
      status_id: 1,
      property_id: null
    }
  },
  property: {
    tableName: 'property',
    primaryKey: 'property_id',
    required: ['property_name', 'property_type', 'status_id'],
    all: ['property_name', 'property_type', 'property_description', 'property_address', 'status_id'],
    testData: {
      property_name: 'Apartment 101',
      property_type: 'Apartment',
      property_description: 'Two bedroom apartment',
      property_address: '123 Main St',
      status_id: 1
    }
  },
  // Add more entities as needed...
};

console.log('Entity configuration loaded for:', Object.keys(entities).join(', '));
export { generateControllerTemplate, generateModelTemplate, generateControllerTestTemplate, entities };
