import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import AmenityController from '../../controllers/amenity.controller.js';
import AmenityModel from '../../models/amenity.model.js';
import { TestHelper, createMockReq, createMockRes } from '../helpers/testHelper.js';

describe('Amenity Controller', () => {
  beforeEach(async () => {
    await TestHelper.resetDatabase();
  });

  afterEach(async () => {
    await TestHelper.clearDatabase();
  });

  describe('register', () => {
    it('should create a new amenity successfully', async () => {
      const req = createMockReq({
        name: 'Swimming Pool',
        capacity: 50,
        description: 'Main swimming pool',
        time_unit: 60,
        total: 100.0,
        status_id: 1,
        tariff_id: 1,
        property_id: 1,
        amenity_type_id: 1
      });
      const res = createMockRes();

      await AmenityController.register(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'Amenity created successfully');
      expect(res.data).to.have.property('id');
    });

    it('should return error for missing required fields', async () => {
      const req = createMockReq({
        name: 'Swimming Pool'
        // Missing required fields
      });
      const res = createMockRes();

      await AmenityController.register(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data).to.have.property('error', 'Required fields are missing');
    });
  });

  describe('show', () => {
    it('should return all active amenities', async () => {
      // Create test amenity
      await AmenityModel.create({
        name: 'Test Amenity',
        capacity: 25,
        description: 'Test description',
        time_unit: 30,
        total: 50.0,
        status_id: 1,
        tariff_id: null,
        property_id: null,
        amenity_type_id: null
      });

      const req = createMockReq();
      const res = createMockRes();

      await AmenityController.show(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'Amenity successfully');
      expect(res.data).to.have.property('data');
      expect(res.data.data).to.be.an('array');
    });
  });

  describe('update', () => {
    it('should update amenity successfully', async () => {
      // Create test amenity
      const amenityId = await AmenityModel.create({
        name: 'Test Amenity',
        capacity: 25,
        description: 'Test description',
        time_unit: 30,
        total: 50.0,
        status_id: 1,
        tariff_id: null,
        property_id: null,
        amenity_type_id: null
      });

      const req = createMockReq(
        {
          name: 'Updated Amenity',
          capacity: 30,
          description: 'Updated description',
          time_unit: 45,
          total: 75.0,
          status_id: 1,
          tariff_id: null,
          property_id: null,
          amenity_type_id: null
        },
        { id: amenityId }
      );
      const res = createMockRes();

      await AmenityController.update(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'Amenity update successfully');
    });

    it('should return error for non-existent amenity', async () => {
      const req = createMockReq(
        {
          name: 'Updated Amenity',
          status_id: 1
        },
        { id: 999 }
      );
      const res = createMockRes();

      await AmenityController.update(req, res);

      expect(res.statusCode).to.equal(409);
      expect(res.data).to.have.property('error', 'The Amenity no already exists');
    });
  });

  describe('delete', () => {
    it('should delete amenity successfully', async () => {
      // Create test amenity
      const amenityId = await AmenityModel.create({
        name: 'Test Amenity',
        capacity: 25,
        description: 'Test description',
        time_unit: 30,
        total: 50.0,
        status_id: 1,
        tariff_id: null,
        property_id: null,
        amenity_type_id: null
      });

      const req = createMockReq({}, { id: amenityId });
      const res = createMockRes();

      await AmenityController.delete(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'Amenity delete successfully');
    });
  });

  describe('findById', () => {
    it('should find amenity by id successfully', async () => {
      // Create test amenity
      const amenityId = await AmenityModel.create({
        name: 'Test Amenity',
        capacity: 25,
        description: 'Test description',
        time_unit: 30,
        total: 50.0,
        status_id: 1,
        tariff_id: null,
        property_id: null,
        amenity_type_id: null
      });

      const req = createMockReq({}, { id: amenityId });
      const res = createMockRes();

      await AmenityController.findById(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'Amenity successfully');
      expect(res.data).to.have.property('data');
    });

    it('should return error for non-existent amenity', async () => {
      const req = createMockReq({}, { id: 999 });
      const res = createMockRes();

      await AmenityController.findById(req, res);

      expect(res.statusCode).to.equal(409);
      expect(res.data).to.have.property('error', 'The Amenity No already exists');
    });
  });
});
