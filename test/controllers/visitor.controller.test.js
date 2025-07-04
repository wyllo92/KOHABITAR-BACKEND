import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { TestHelper, createMockReq, createMockRes } from '../helpers/testHelper.js';
import VisitorController from '../../controllers/visitor.controller.js';

describe('Visitor Controller', () => {
  beforeEach(async () => {
    await TestHelper.resetDatabase();
  });

  afterEach(async () => {
    await TestHelper.clearDatabase();
  });

  describe('register', () => {
    it('should create a new visitor successfully', async () => {
      const req = createMockReq({
        Visitor_full_name: 'John Doe',
        Visitor_id_document: '12345678',
        Visitor_visit_reason: 'Family visit',
        Visitor_entry_time: '2024-01-01 10:00:00',
        Visitor_authorized_by: 'Admin User',
        Property_id: 1,
        Status_id: 1
      });
      const res = createMockRes();

      await VisitorController.register(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data.message).to.equal('Visitor created successfully');
      expect(res.data.id).to.be.a('number');
    });

    it('should return error for missing required fields', async () => {
      const req = createMockReq({
        Visitor_full_name: 'John Doe'
        // Missing required fields
      });
      const res = createMockRes();

      await VisitorController.register(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data.error).to.equal('Required fields are missing');
    });
  });

  describe('show', () => {
    it('should return all active visitors', async () => {
      const req = createMockReq();
      const res = createMockRes();

      await VisitorController.show(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data.message).to.equal('Visitors retrieved successfully');
      expect(res.data.data).to.be.an('array');
    });
  });

  describe('update', () => {
    let visitorId;

    beforeEach(async () => {
      const req = createMockReq({
        Visitor_full_name: 'John Doe',
        Visitor_id_document: '12345678',
        Visitor_visit_reason: 'Family visit',
        Visitor_entry_time: '2024-01-01 10:00:00',
        Visitor_authorized_by: 'Admin User',
        Property_id: 1,
        Status_id: 1
      });
      const res = createMockRes();
      await VisitorController.register(req, res);
      visitorId = res.data.id;
    });

    it('should update visitor successfully', async () => {
      const req = createMockReq({
        Visitor_full_name: 'John Smith',
        Visitor_id_document: '12345678',
        Visitor_visit_reason: 'Business visit',
        Visitor_entry_time: '2024-01-01 10:00:00',
        Visitor_authorized_by: 'Admin User',
        Property_id: 1,
        Status_id: 1
      }, { id: visitorId });
      const res = createMockRes();

      await VisitorController.update(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data.message).to.equal('Visitor updated successfully');
    });

    it('should return error for non-existent visitor', async () => {
      const req = createMockReq({
        Visitor_full_name: 'John Smith',
        Visitor_id_document: '12345678',
        Visitor_visit_reason: 'Business visit',
        Visitor_entry_time: '2024-01-01 10:00:00',
        Visitor_authorized_by: 'Admin User',
        Property_id: 1,
        Status_id: 1
      }, { id: 99999 });
      const res = createMockRes();

      await VisitorController.update(req, res);

      expect(res.statusCode).to.equal(409);
      expect(res.data.error).to.equal('The Visitor does not exist');
    });
  });

  describe('delete', () => {
    let visitorId;

    beforeEach(async () => {
      const req = createMockReq({
        Visitor_full_name: 'John Doe',
        Visitor_id_document: '12345678',
        Visitor_visit_reason: 'Family visit',
        Visitor_entry_time: '2024-01-01 10:00:00',
        Visitor_authorized_by: 'Admin User',
        Property_id: 1,
        Status_id: 1
      });
      const res = createMockRes();
      await VisitorController.register(req, res);
      visitorId = res.data.id;
    });

    it('should delete visitor successfully', async () => {
      const req = createMockReq({}, { id: visitorId });
      const res = createMockRes();

      await VisitorController.delete(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data.message).to.equal('Visitor deleted successfully');
    });
  });

  describe('findById', () => {
    let visitorId;

    beforeEach(async () => {
      const req = createMockReq({
        Visitor_full_name: 'John Doe',
        Visitor_id_document: '12345678',
        Visitor_visit_reason: 'Family visit',
        Visitor_entry_time: '2024-01-01 10:00:00',
        Visitor_authorized_by: 'Admin User',
        Property_id: 1,
        Status_id: 1
      });
      const res = createMockRes();
      await VisitorController.register(req, res);
      visitorId = res.data.id;
    });

    it('should find visitor by id successfully', async () => {
      const req = createMockReq({}, { id: visitorId });
      const res = createMockRes();

      await VisitorController.findById(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data.message).to.equal('Visitor found successfully');
      expect(res.data.data).to.be.an('object');
    });

    it('should return error for non-existent visitor', async () => {
      const req = createMockReq({}, { id: 99999 });
      const res = createMockRes();

      await VisitorController.findById(req, res);

      expect(res.statusCode).to.equal(404);
      expect(res.data.error).to.equal('Visitor not found');
    });
  });
});
