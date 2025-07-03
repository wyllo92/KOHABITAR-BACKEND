import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import UserModel from '../../models/user.model.js';
import { TestHelper } from '../helpers/testHelper.js';

describe('User Model', () => {
  beforeEach(async () => {
    await TestHelper.resetDatabase();
  });

  afterEach(async () => {
    await TestHelper.clearDatabase();
  });

  describe('create', () => {
    it('should create a new user and return the id', async () => {
      const userData = {
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      };

      const userId = await UserModel.create(userData);

      expect(userId).to.be.a('number');
      expect(userId).to.be.greaterThan(0);
    });
  });

  describe('show', () => {
    it('should return all users', async () => {
      // Create test user
      await UserModel.create({
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      });

      const users = await UserModel.show();

      expect(users).to.be.an('array');
      expect(users.length).to.be.greaterThan(0);
      expect(users[0]).to.have.property('user_name', 'testuser');
    });
  });

  describe('showActive', () => {
    it('should return only active users', async () => {
      // Create active user
      await UserModel.create({
        user_name: 'activeuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      });

      // Create inactive user
      await UserModel.create({
        user_name: 'inactiveuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 2
      });

      const activeUsers = await UserModel.showActive();

      expect(activeUsers).to.be.an('array');
      expect(activeUsers.length).to.equal(1);
      expect(activeUsers[0]).to.have.property('user_name', 'activeuser');
      expect(activeUsers[0]).to.have.property('status_id', 1);
    });
  });

  describe('update', () => {
    it('should update user and return updated data', async () => {
      // Create test user
      const userId = await UserModel.create({
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      });

      const updateData = {
        user_name: 'updateduser',
        user_password: 'newhashedpassword',
        role_id: 1,
        status_id: 1
      };

      const updatedUser = await UserModel.update(userId, updateData);

      expect(updatedUser).to.not.be.null;
      expect(updatedUser).to.have.property('user_name', 'updateduser');
    });

    it('should return null for non-existent user', async () => {
      const updateData = {
        user_name: 'updateduser',
        user_password: 'newhashedpassword',
        role_id: 1,
        status_id: 1
      };

      const result = await UserModel.update(999, updateData);

      expect(result).to.be.null;
    });
  });

  describe('delete', () => {
    it('should delete user and return true', async () => {
      // Create test user
      const userId = await UserModel.create({
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      });

      const result = await UserModel.delete(userId);

      expect(result).to.be.true;

      // Verify user is deleted
      const deletedUser = await UserModel.findById(userId);
      expect(deletedUser).to.be.undefined;
    });

    it('should return false for non-existent user', async () => {
      const result = await UserModel.delete(999);

      expect(result).to.be.false;
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      // Create test user
      const userId = await UserModel.create({
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      });

      const user = await UserModel.findById(userId);

      expect(user).to.not.be.undefined;
      expect(user).to.have.property('user_name', 'testuser');
      expect(user).to.have.property('user_id', userId);
    });

    it('should return undefined for non-existent user', async () => {
      const user = await UserModel.findById(999);

      expect(user).to.be.undefined;
    });
  });

  describe('findByIdActive', () => {
    it('should find active user by id', async () => {
      // Create active user
      const userId = await UserModel.create({
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      });

      const user = await UserModel.findByIdActive(userId);

      expect(user).to.not.be.undefined;
      expect(user).to.have.property('user_name', 'testuser');
      expect(user).to.have.property('status_id', 1);
    });

    it('should return undefined for inactive user', async () => {
      // Create inactive user
      const userId = await UserModel.create({
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 2
      });

      const user = await UserModel.findByIdActive(userId);

      expect(user).to.be.undefined;
    });
  });

  describe('findByName', () => {
    it('should find user by username', async () => {
      // Create test user
      await UserModel.create({
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      });

      const user = await UserModel.findByName('testuser');

      expect(user).to.not.be.undefined;
      expect(user).to.have.property('user_name', 'testuser');
    });

    it('should return undefined for non-existent username', async () => {
      const user = await UserModel.findByName('nonexistent');

      expect(user).to.be.undefined;
    });
  });

  describe('updateLogin', () => {
    it('should update last login time', async () => {
      // Create test user
      const userId = await UserModel.create({
        user_name: 'testuser',
        user_password: 'hashedpassword',
        role_id: 1,
        status_id: 1
      });

      const result = await UserModel.updateLogin(userId);

      expect(result).to.not.be.null;
      expect(result).to.have.property('user_id', userId);
    });

    it('should return null for non-existent user', async () => {
      const result = await UserModel.updateLogin(999);

      expect(result).to.be.null;
    });
  });
});
