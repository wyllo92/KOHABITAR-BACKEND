import UserModel from '../models/user.model.js';
import { encryptPassword, comparePassword } from '../library/appBcrypt.js';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

class UserController {

  async register(req, res) {
    console.log('\n[DEBUG] UserController.register called with body:', req.body);
    try {
      const { user_name, user_password, role_id, status_id } = req.body;

      // Validación básica
      if (!user_name || !user_password || !role_id || !status_id) {
        console.warn('[WARN] Missing required fields in register request:', req.body);
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Validación adicional
      if (user_password.length < 8) {
        console.warn('[WARN] Password too short for user:', user_name);
        return res.status(400).json({
          error: 'The password must be at least 8 characters long.'
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await UserModel.findByName(user_name);
      console.log('[DEBUG] Existing user check result:', existingUser);

      if (existingUser) {
        return res.status(409).json({
          error: 'The username is already in use'
        });
      }

      // Encriptar contraseña y crear usuario
      const passwordHash = await encryptPassword(user_password);
      console.log('[DEBUG] Password encrypted successfully');

      const userId = await UserModel.create({
        user_name,
        user_password: passwordHash,
        role_id,
        status_id
      });

      console.log('[INFO] User created successfully with ID:', userId);
      res.status(201).json({
        message: 'User created successfully',
        id: userId
      });

    } catch (error) {
      console.error('[ERROR] Registration error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    console.log('\n[DEBUG] UserController.show called');
    try {
      const users = await UserModel.show();
      console.log('[INFO] Users retrieved:', users.length);

      res.status(200).json({
        message: 'Users retrieved successfully',
        data: users || []
      });
    } catch (error) {
      console.error('[ERROR] Retrieving users failed:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    console.log('\n[DEBUG] UserController.update called with params:', req.params, 'and body:', req.body);
    try {
      const { user_name, user_password, role_id, status_id } = req.body;
      const id = req.params.id;

      if (!user_name || !user_password || !role_id || !status_id || !id) {
        console.warn('[WARN] Missing fields in update request');
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const existingUser = await UserModel.findById(id);
      console.log('[DEBUG] Existing user found for update:', existingUser);

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const encryptedPassword = await encryptPassword(user_password);
      console.log('[DEBUG] Password encrypted for update');

      const updateResult = await UserModel.update(id, {
        user_name,
        user_password: encryptedPassword,
        role_id,
        status_id
      });

      console.log('[INFO] User updated successfully:', updateResult);
      res.status(200).json({
        message: 'User updated successfully',
        data: updateResult
      });

    } catch (error) {
      console.error('[ERROR] User update failed:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req, res) {
    console.log('\n[DEBUG] UserController.delete called with params:', req.params);
    try {
      const id = req.params.id;
      if (!id) {
        console.warn('[WARN] Missing ID in delete request');
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const deleteResult = await UserModel.delete(id);
      console.log('[INFO] User deleted successfully:', deleteResult);

      res.status(200).json({
        message: 'User deleted successfully',
        data: deleteResult
      });
    } catch (error) {
      console.error('[ERROR] Deleting user failed:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findById(req, res) {
    console.log('\n[DEBUG] UserController.findById called with params:', req.params);
    try {
      const id = req.params.id;
      if (!id) {
        console.warn('[WARN] Missing ID in findById request');
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const user = await UserModel.findById(id);
      console.log('[DEBUG] User found by ID:', user);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({
        message: 'User found successfully',
        data: user
      });
    } catch (error) {
      console.error('[ERROR] Finding user by ID failed:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async login(req, res) {
    console.log('\n[DEBUG] UserController.login called with body:', req.body);
    try {
      const { user, password } = req.body;

      if (!user || !password) {
        console.warn('[WARN] Missing fields in login request');
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const existingUser = await UserModel.findByName(user);
      console.log('[DEBUG] User lookup result:', existingUser);

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Validar que el usuario esté activo (status_id = 1)
      if (existingUser.status_id !== 1) {
        console.warn('[WARN] User is not active:', user, 'status_id:', existingUser.status_id);
        return res.status(403).json({ error: 'User account is not active' });
      }

      const passwordMatch = await comparePassword(password, existingUser.user_password);
      console.log('[DEBUG] Password match result:', passwordMatch);

      if (!passwordMatch) {
        console.warn('[WARN] Invalid password for user:', user);
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Intentar actualizar el timestamp de login, pero no fallar si no se puede
      try {
        const updateLogin = await UserModel.updateLogin(existingUser.user_id);
        console.log('[DEBUG] Update login timestamp result:', updateLogin);
      } catch (updateError) {
        console.warn('[WARN] Failed to update login timestamp, but continuing with login:', updateError.message);
        // No retornamos error aquí, solo logueamos la advertencia
      }

      const token = jwt.sign(
        {
          id: existingUser.user_id,
          username: existingUser.user_name,
          status: existingUser.status_id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
          algorithm: "HS256"
        }
      );

      console.log('[INFO] User logged in successfully:', existingUser.user_name);
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: existingUser.user_id,
          username: existingUser.user_name,
          statusId: existingUser.status_id,
          token
        }
      });

    } catch (error) {
      console.error('[ERROR] Login failed:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new UserController();
