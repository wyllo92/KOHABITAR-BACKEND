import UserModel from '../models/user.model.js';
import { encryptPassword, comparePassword } from '../library/appBcrypt.js';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

class UserController {

  async register(req, res) {
    try {
      const { user_name, user_password, role_id, status_id } = req.body;
      // Validación básica
      if (!user_name || !user_password || !role_id || !status_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Validación adicional
      if (user_password.length < 8) {
        return res.status(400).json({
          error: 'The password must be at least 8 characters long.'
        });
      }
      // Verificar si el usuario ya existe
      const existingUser = await UserModel.findByName(user_name);
      if (existingUser) {
        return res.status(409).json({
          error: 'The username is already in use'
        });
      }
      const passwordHash = await encryptPassword(user_password);
      const userId = await UserModel.create({
        user_name,
        user_password: passwordHash,
        role_id,
        status_id
      });
      res.status(201).json({
        message: 'User created successfully',
        id: userId
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    try {
      // Get all users (active and inactive)
      const userModel = await UserModel.show();
      res.status(200).json({
        message: 'Users retrieved successfully',
        data: userModel || []
      });
    } catch (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    try {
      const { user_name, user_password, role_id, status_id } = req.body;
      const id = req.params.id;
      // Basic validation
      if (!user_name || !user_password || !role_id || !status_id || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Verify if the User exists  
      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Encrypt password before updating
      const encryptedPassword = await encryptPassword(user_password);
      const updateUserModel = await UserModel.update(id, {
        user_name,
        user_password: encryptedPassword,
        role_id,
        status_id
      });
      res.status(200).json({
        message: 'User updated successfully',
        data: updateUserModel
      });
    } catch (error) {
      console.error('Error in user update:', error);
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
      // Delete user
      const deleteUserModel = await UserModel.delete(id);
      res.status(200).json({
        message: 'User deleted successfully',
        data: deleteUserModel
      });
    } catch (error) {
      console.error('Error deleting user:', error);
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
      // Get user by ID
      const existingUserModel = await UserModel.findById(id);
      if (!existingUserModel) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({
        message: 'User found successfully',
        data: existingUserModel
      });
    } catch (error) {
      console.error('Error finding user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async login(req, res) {
    try {
      const { user, password } = req.body;
      // Basic validate
      if (!user || !password) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Check if the user already exists
      const existingUser = await UserModel.findByName(user);
      if (existingUser) {
        const passwordHash = await comparePassword(password, existingUser.user_password);
        if (!passwordHash) {
          return res.status(401).json({ error: 'Invalid password' });
        } else {
          const updateLogin = await UserModel.updateLogin(existingUser.user_id);
          if (!updateLogin) {
            return res.status(500).json({ error: 'Failed to update login time' });
          }
          const token = jwt.sign({
            id: existingUser.user_id,
            username: existingUser.user_name,
            status: existingUser.status_id
          }, process.env.JWT_SECRET, {
            expiresIn: "1h",
            algorithm: "HS256"
          });
          res.status(200).json({
            message: 'Login successful',
            user: {
              id: existingUser.user_id,
              username: existingUser.user_name,
              statusId: existingUser.status_id,
              token: token
            }
          });
        }
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new UserController();