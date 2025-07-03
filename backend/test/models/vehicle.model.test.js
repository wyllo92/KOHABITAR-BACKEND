import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import VehicleModel from '../../models/vehicle.model.js';
import { TestHelper } from '../helpers/testHelper.js';

describe('Vehicle Model', () => {
  beforeEach(async () => {
    await TestHelper.resetDatabase();
  });

  afterEach(async () => {
    await TestHelper.clearDatabase();
  });

  describe('create', () => {
    it('should create a new vehicle and return the id', async () => {
      const vehicleData = {
        license_plate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        color: 'Blue',
        vehicle_type: 'Car',
        status_id: 1,
        user_id: null
      };

      const vehicleId = await VehicleModel.create(vehicleData);

      expect(vehicleId).to.be.a('number');
      expect(vehicleId).to.be.greaterThan(0);
    });
  });

  describe('show', () => {
    it('should return all vehicles', async () => {
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

      const vehicles = await VehicleModel.show();

      expect(vehicles).to.be.an('array');
      expect(vehicles.length).to.be.greaterThan(0);
      expect(vehicles[0]).to.have.property('license_plate', 'TEST123');
    });
  });

  describe('showActive', () => {
    it('should return only active vehicles', async () => {
      // Create active vehicle
      await VehicleModel.create({
        license_plate: 'ACTIVE123',
        brand: 'Active Brand',
        model: 'Active Model',
        color: 'Blue',
        vehicle_type: 'Car',
        status_id: 1,
        user_id: null
      });

      // Create inactive vehicle
      await VehicleModel.create({
        license_plate: 'INACTIVE123',
        brand: 'Inactive Brand',
        model: 'Inactive Model',
        color: 'Red',
        vehicle_type: 'Car',
        status_id: 2,
        user_id: null
      });

      const activeVehicles = await VehicleModel.showActive();

      expect(activeVehicles).to.be.an('array');
      expect(activeVehicles.length).to.equal(1);
      expect(activeVehicles[0]).to.have.property('license_plate', 'ACTIVE123');
      expect(activeVehicles[0]).to.have.property('status_id', 1);
    });
  });

  describe('update', () => {
    it('should update vehicle and return updated data', async () => {
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

      const updateData = {
        license_plate: 'UPDATED123',
        brand: 'Updated Brand',
        model: 'Updated Model',
        color: 'Blue',
        vehicle_type: 'SUV',
        status_id: 1,
        user_id: null
      };

      const updatedVehicle = await VehicleModel.update(vehicleId, updateData);

      expect(updatedVehicle).to.not.be.null;
      expect(updatedVehicle).to.have.property('license_plate', 'UPDATED123');
    });

    it('should return null for non-existent vehicle', async () => {
      const updateData = {
        license_plate: 'UPDATED123',
        brand: 'Updated Brand',
        model: 'Updated Model',
        color: 'Blue',
        vehicle_type: 'SUV',
        status_id: 1,
        user_id: null
      };

      const result = await VehicleModel.update(999, updateData);

      expect(result).to.be.null;
    });
  });

  describe('delete', () => {
    it('should delete vehicle and return true', async () => {
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

      const result = await VehicleModel.delete(vehicleId);

      expect(result).to.be.true;

      // Verify vehicle is deleted
      const deletedVehicle = await VehicleModel.findById(vehicleId);
      expect(deletedVehicle).to.be.undefined;
    });

    it('should return false for non-existent vehicle', async () => {
      const result = await VehicleModel.delete(999);

      expect(result).to.be.false;
    });
  });

  describe('findById', () => {
    it('should find vehicle by id', async () => {
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

      const vehicle = await VehicleModel.findById(vehicleId);

      expect(vehicle).to.not.be.undefined;
      expect(vehicle).to.have.property('license_plate', 'TEST123');
      expect(vehicle).to.have.property('vehicle_id', vehicleId);
    });

    it('should return undefined for non-existent vehicle', async () => {
      const vehicle = await VehicleModel.findById(999);

      expect(vehicle).to.be.undefined;
    });
  });

  describe('findByIdActive', () => {
    it('should find active vehicle by id', async () => {
      // Create active vehicle
      const vehicleId = await VehicleModel.create({
        license_plate: 'TEST123',
        brand: 'Test Brand',
        model: 'Test Model',
        color: 'Red',
        vehicle_type: 'Car',
        status_id: 1,
        user_id: null
      });

      const vehicle = await VehicleModel.findByIdActive(vehicleId);

      expect(vehicle).to.not.be.undefined;
      expect(vehicle).to.have.property('license_plate', 'TEST123');
      expect(vehicle).to.have.property('status_id', 1);
    });

    it('should return undefined for inactive vehicle', async () => {
      // Create inactive vehicle
      const vehicleId = await VehicleModel.create({
        license_plate: 'TEST123',
        brand: 'Test Brand',
        model: 'Test Model',
        color: 'Red',
        vehicle_type: 'Car',
        status_id: 2,
        user_id: null
      });

      const vehicle = await VehicleModel.findByIdActive(vehicleId);

      expect(vehicle).to.be.undefined;
    });
  });
});
