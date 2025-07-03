import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import AmenityModel from '../../models/amenity.model.js';
import { TestHelper } from '../helpers/testHelper.js';

describe('Amenity Model', () => {
  beforeEach(async () => {
    await TestHelper.resetDatabase();
  });

  afterEach(async () => {
    await TestHelper.clearDatabase();
  });

  describe('create', () => {
    it('should create a new amenity and return the id', async () => {
      const amenityData = {
        name: 'Test Amenity',
        capacity: 25,
        description: 'Test description',
        time_unit: 30,
        total: 50.0,
        status_id: 1,
        tariff_id: null,
        property_id: null,
        amenity_type_id: null
      };

      const amenityId = await AmenityModel.create(amenityData);

      expect(amenityId).to.be.a('number');
      expect(amenityId).to.be.greaterThan(0);
    });
  });

  describe('show', () => {
    it('should return all amenities', async () => {
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

      const amenities = await AmenityModel.show();

      expect(amenities).to.be.an('array');
      expect(amenities.length).to.be.greaterThan(0);
      expect(amenities[0]).to.have.property('name', 'Test Amenity');
    });
  });

  describe('showActive', () => {
    it('should return only active amenities', async () => {
      // Create active amenity
      await AmenityModel.create({
        name: 'Active Amenity',
        capacity: 25,
        description: 'Active description',
        time_unit: 30,
        total: 50.0,
        status_id: 1,
        tariff_id: null,
        property_id: null,
        amenity_type_id: null
      });

      // Create inactive amenity
      await AmenityModel.create({
        name: 'Inactive Amenity',
        capacity: 15,
        description: 'Inactive description',
        time_unit: 30,
        total: 25.0,
        status_id: 2,
        tariff_id: null,
        property_id: null,
        amenity_type_id: null
      });

      const activeAmenities = await AmenityModel.showActive();

      expect(activeAmenities).to.be.an('array');
      expect(activeAmenities.length).to.equal(1);
      expect(activeAmenities[0]).to.have.property('name', 'Active Amenity');
      expect(activeAmenities[0]).to.have.property('status_id', 1);
    });
  });

  describe('update', () => {
    it('should update amenity and return updated data', async () => {
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

      const updateData = {
        name: 'Updated Amenity',
        capacity: 30,
        description: 'Updated description',
        time_unit: 45,
        total: 75.0,
        status_id: 1,
        tariff_id: null,
        property_id: null,
        amenity_type_id: null
      };

      const updatedAmenity = await AmenityModel.update(amenityId, updateData);

      expect(updatedAmenity).to.not.be.null;
      expect(updatedAmenity).to.have.property('name', 'Updated Amenity');
    });

    it('should return null for non-existent amenity', async () => {
      const updateData = {
        name: 'Updated Amenity',
        capacity: 30,
        description: 'Updated description',
        time_unit: 45,
        total: 75.0,
        status_id: 1,
        tariff_id: null,
        property_id: null,
        amenity_type_id: null
      };

      const result = await AmenityModel.update(999, updateData);

      expect(result).to.be.null;
    });
  });

  describe('delete', () => {
    it('should delete amenity and return true', async () => {
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

      const result = await AmenityModel.delete(amenityId);

      expect(result).to.be.true;

      // Verify amenity is deleted
      const deletedAmenity = await AmenityModel.findById(amenityId);
      expect(deletedAmenity).to.be.undefined;
    });

    it('should return false for non-existent amenity', async () => {
      const result = await AmenityModel.delete(999);

      expect(result).to.be.false;
    });
  });

  describe('findById', () => {
    it('should find amenity by id', async () => {
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

      const amenity = await AmenityModel.findById(amenityId);

      expect(amenity).to.not.be.undefined;
      expect(amenity).to.have.property('name', 'Test Amenity');
      expect(amenity).to.have.property('amenity_id', amenityId);
    });

    it('should return undefined for non-existent amenity', async () => {
      const amenity = await AmenityModel.findById(999);

      expect(amenity).to.be.undefined;
    });
  });

  describe('findByIdActive', () => {
    it('should find active amenity by id', async () => {
      // Create active amenity
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

      const amenity = await AmenityModel.findByIdActive(amenityId);

      expect(amenity).to.not.be.undefined;
      expect(amenity).to.have.property('name', 'Test Amenity');
      expect(amenity).to.have.property('status_id', 1);
    });

    it('should return undefined for inactive amenity', async () => {
      // Create inactive amenity
      const amenityId = await AmenityModel.create({
        name: 'Test Amenity',
        capacity: 25,
        description: 'Test description',
        time_unit: 30,
        total: 50.0,
        status_id: 2,
        tariff_id: null,
        property_id: null,
        amenity_type_id: null
      });

      const amenity = await AmenityModel.findByIdActive(amenityId);

      expect(amenity).to.be.undefined;
    });
  });
});
