import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import UserController from '../../controllers/user.controller.js';
import UserModel from '../../models/user.model.js';
import { TestHelper, createMockReq, createMockRes } from '../helpers/testHelper.js';

describe('User Controller', () => {
  beforeEach(async () => {
    await TestHelper.resetDatabase();
  });

  afterEach(async () => {
    await TestHelper.clearDatabase();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const req = createMockReq({
        user_name: 'testuser',
        user_password: 'password123',
        role_id: 1,
        status_id: 1
      });
      const res = createMockRes();

      await UserController.register(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'User created successfully');
      expect(res.data).to.have.property('id');
    });

    it('should return error for missing required fields', async () => {
      const req = createMockReq({
        user_name: 'testuser'
        // Missing required fields
      });
      const res = createMockRes();

      await UserController.register(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data).to.have.property('error', 'Required fields are missing');
    });

    it('should return error for short password', async () => {
      const req = createMockReq({
        user_name: 'testuser',
        user_password: '123',
        role_id: 1,
        status_id: 1
      });
      const res = createMockRes();

      await UserController.register(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data).to.have.property('error', 'The password must be at least 8 characters long.');
    });

    it('should return error for duplicate username', async () => {
      // Create first user
      await UserModel.create({
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      });

      const req = createMockReq({
        user_name: 'testuser',
        user_password: 'password123',
        role_id: 1,
        status_id: 1
      });
      const res = createMockRes();

      await UserController.register(req, res);

      expect(res.statusCode).to.equal(409);
      expect(res.data).to.have.property('error', 'The username is already in use');
    });
  });

  describe('show', () => {
    it('should return all active users', async () => {
      // Create test user
      await UserModel.create({
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      });

      const req = createMockReq();
      const res = createMockRes();

      await UserController.show(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'User successfully');
      expect(res.data).to.have.property('data');
      expect(res.data.data).to.be.an('array');
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      // Create test user
      const userId = await UserModel.create({
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      });

      const req = createMockReq(
        {
          email: 'test@example.com',
          status_id: 1
        },
        { id: userId }
      );
      const res = createMockRes();

      await UserController.update(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'User update successfully');
    });

    it('should return error for non-existent user', async () => {
      const req = createMockReq(
        {
          email: 'test@example.com',
          status_id: 1
        },
        { id: 999 }
      );
      const res = createMockRes();

      await UserController.update(req, res);

      expect(res.statusCode).to.equal(409);
      expect(res.data).to.have.property('error', 'The User no already exists');
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      // Create test user
      const userId = await UserModel.create({
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      });

      const req = createMockReq({}, { id: userId });
      const res = createMockRes();

      await UserController.delete(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'User delete successfully');
    });
  });

  describe('findById', () => {
    it('should find user by id successfully', async () => {
      // Create test user
      const userId = await UserModel.create({
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      });

      const req = createMockReq({}, { id: userId });
      const res = createMockRes();

      await UserController.findById(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('message', 'User successfully');
      expect(res.data).to.have.property('data');
    });

    it('should return error for non-existent user', async () => {
      const req = createMockReq({}, { id: 999 });
      const res = createMockRes();

      await UserController.findById(req, res);

      expect(res.statusCode).to.equal(409);
      expect(res.data).to.have.property('error', 'The User No already exists');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      // Create test user with known password
      const userId = await UserModel.create({
        user_name: 'testuser',
        user_password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role_id: 1,
        status_id: 1
      });

      const req = createMockReq({
        user: 'testuser',
        password: 'password'
      });
      const res = createMockRes();

      await UserController.login(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data).to.have.property('message', 'Login successful');
      expect(res.data).to.have.property('user');
      expect(res.data.user).to.have.property('token');
    });

    it('should return error for non-existent user', async () => {
      const req = createMockReq({
        user: 'nonexistent',
        password: 'password'
      });
      const res = createMockRes();

      await UserController.login(req, res);

      expect(res.statusCode).to.equal(404);
      expect(res.data).to.have.property('error', 'User not found');
    });
  });
});
