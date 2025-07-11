import UserModel from '../models/user.model.js';
import ProfileModel from '../models/profile.model.js';
import { encryptPassword, comparePassword } from '../library/appBcrypt.js';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
class UserController {

  async register(req, res) {
    try {
      const { 
        user_name, 
        user_password, 
        role_id, 
        status_id,
        profile_phone,
        profile_email 
      } = req.body;
      
      // Validación básica
      if (!user_name || !user_password || !role_id || !status_id || !profile_phone || !profile_email) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, incluyendo Teléfono y Email.' });
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
      
      // Verificar si el email ya está en uso (si se proporciona)
      if (profile_email) {
        const existingEmail = await ProfileModel.findByEmail(profile_email);
        if (existingEmail) {
          return res.status(409).json({
            error: 'Email already in use'
          });
        }
      }
      
      // Crear el usuario
      const passwordHash = await encryptPassword(user_password);
      const userId = await UserModel.create({
        user_name,
        user_password: passwordHash,
        role_id,
        status_id
      });

      // Log para depuración
      console.log('BACKEND - Teléfono:', profile_phone, 'Email:', profile_email);

      // Crear el profile SIEMPRE, usando los datos obligatorios
      await ProfileModel.create({
        user_id: userId,
        profile_fullName: user_name, 
        profile_phone: profile_phone,
        profile_email: profile_email,
        profile_photo: null,
        profile_address: null
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
      // Get all active users
      const userModel = await UserModel.showActive();
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
      const { 
        user_name, 
        user_password, 
        role_id, 
        status_id,
        profile_phone,
        profile_email 
      } = req.body;
      const id = req.params.id;
      
      // Basic validation
      if (!user_name || !user_password || !role_id || !status_id || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      
      // Verify if the User exists  
      const existingUser = await UserModel.findByIdActive(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verificar si el email ya está en uso por otro usuario (si se proporciona)
      if (profile_email) {
        const existingEmail = await ProfileModel.findByEmail(profile_email);
        if (existingEmail && existingEmail.user_id != id) {
          return res.status(409).json({
            error: 'Email already in use by another user'
          });
        }
      }

      // Encrypt password before updating
      const encryptedPassword = await encryptPassword(user_password);
      const updateUserModel = await UserModel.update(id, {
        user_name,
        user_password: encryptedPassword,
        role_id,
        status_id
      });
      
      // Actualizar o crear el profile
      const existingProfile = await ProfileModel.findById(id);
      if (existingProfile) {
        // Actualizar profile existente
        await ProfileModel.update(id, {
          profile_fullName: user_name,
          profile_phone: profile_phone || existingProfile.profile_phone,
          profile_email: profile_email || existingProfile.profile_email,
          profile_photo: existingProfile.profile_photo,
          profile_address: existingProfile.profile_address
        });
      } else if (profile_phone || profile_email) {
        // Crear nuevo profile
        await ProfileModel.create({
          user_id: id,
          profile_fullName: user_name,
          profile_phone: profile_phone || null,
          profile_email: profile_email || null,
          profile_photo: null,
          profile_address: null
        });
      }
      
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
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Validar que el usuario tenga contraseña
      if (!existingUser.user_password) {
        return res.status(401).json({ error: 'User has no password set' });
      }
      
      const passwordHash = await comparePassword(password, existingUser.user_password);
      if (!passwordHash) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      
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
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new UserController();