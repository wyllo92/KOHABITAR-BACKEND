import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import VehicleController from '../../controllers/vehicle.controller.js';
import VehicleModel from '../../models/vehicle.model.js';
import { TestHelper, createMockReq, createMockRes } from '../helpers/testHelper.js';

describe('Vehicle Controller', () => {
  beforeEach(async () => {
    await TestHelper.resetDatabase();
  });

  afterEach(async () => {
    await TestHelper.clearDatabase();
  });

  describe('register', () => {
    it('should create a new vehicle successfully', async () => {
      const req = createMockReq({
        license_plate: 'ABC123',
        model: 'Corolla',
        type: 'Car',
        color: 'Blue',
        user_id: 1,
        property_id: 1,
        parkingZone_id: null,
        status_id: 1
      });
      const res = createMockRes();

      await VehicleController.register(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'Vehicle created successfully');
      expect(res.data).to.have.property('id');
    });

    it('should return error for missing required fields', async () => {
      const req = createMockReq({
        model: 'Corolla'
        // Missing required fields
      });
      const res = createMockRes();

      await VehicleController.register(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data).to.have.property('error', 'Required fields are missing');
    });
  });

  describe('show', () => {
    it('should return all active vehicles', async () => {
      // Create test vehicle
      await VehicleModel.create({
        license_plate: 'TEST123',
        brand: 'Test Brand',
        model: 'Test Model',
        color: 'Red',
        vehicle_type: 'Car',
        status_id: 1,
        user_id: null
      });

      const req = createMockReq();
      const res = createMockRes();

      await VehicleController.show(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'Vehicle successfully');
      expect(res.data).to.have.property('data');
      expect(res.data.data).to.be.an('array');
    });
  });

  describe('update', () => {
    it('should update vehicle successfully', async () => {
      // Create test vehicle
      const vehicleId = await VehicleModel.create({
        license_plate: 'TEST123',
        brand: 'Test Brand',
        model: 'Test Model',
        color: 'Red',
        vehicle_type: 'Car',
        status_id: 1,
        user_id: null
      });

      const req = createMockReq(
        {
          license_plate: 'UPDATED123',
          brand: 'Updated Brand',
          model: 'Updated Model',
          color: 'Blue',
          vehicle_type: 'SUV',
          status_id: 1,
          user_id: null
        },
        { id: vehicleId }
      );
      const res = createMockRes();

      await VehicleController.update(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'Vehicle update successfully');
    });

    it('should return error for non-existent vehicle', async () => {
      const req = createMockReq(
        {
          license_plate: 'UPDATED123',
          vehicle_type: 'Car',
          status_id: 1
        },
        { id: 999 }
      );
      const res = createMockRes();

      await VehicleController.update(req, res);

      expect(res.statusCode).to.equal(409);
      expect(res.data).to.have.property('error', 'The Vehicle no already exists');
    });
  });

  describe('delete', () => {
    it('should delete vehicle successfully', async () => {
      // Create test vehicle
      const vehicleId = await VehicleModel.create({
        license_plate: 'TEST123',
        brand: 'Test Brand',
        model: 'Test Model',
        color: 'Red',
        vehicle_type: 'Car',
        status_id: 1,
        user_id: null
      });

      const req = createMockReq({}, { id: vehicleId });
      const res = createMockRes();

      await VehicleController.delete(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'Vehicle delete successfully');
    });
  });

  describe('findById', () => {
    it('should find vehicle by id successfully', async () => {
      // Create test vehicle
      const vehicleId = await VehicleModel.create({
        license_plate: 'TEST123',
        brand: 'Test Brand',
        model: 'Test Model',
        color: 'Red',
        vehicle_type: 'Car',
        status_id: 1,
        user_id: null
      });

      const req = createMockReq({}, { id: vehicleId });
      const res = createMockRes();

      await VehicleController.findById(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'Vehicle successfully');
      expect(res.data).to.have.property('data');
    });

    it('should return error for non-existent vehicle', async () => {
      const req = createMockReq({}, { id: 999 });
      const res = createMockRes();

      await VehicleController.findById(req, res);

      expect(res.statusCode).to.equal(409);
      expect(res.data).to.have.property('error', 'The Vehicle No already exists');
    });
  });
});
