import ProfileModel from '../models/profile.model.js';
import upload from '../utils/fileUpload.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Controlador para gestionar las operaciones relacionadas con perfiles de usuario.
 * Implementar métodos para crear, consultar, actualizar y eliminar perfiles,
 * así como para realizar búsquedas por ID y manejar la validación de datos.
 */
class ProfileController {

  /**
   * Registrar un nuevo perfil de usuario en el sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con los datos del perfil en el cuerpo
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async register(req, res) {
    try {
      const { user_id, full_name, phone, email, profile_photo, address } = req.body;
      // Validación básica
      if (!user_id || !full_name || !phone || !email) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      const profileId = await ProfileModel.create({
        user_id, full_name, phone, email, profile_photo, address
      });
      res.status(201).json({
        message: 'Profile created successfully',
        id: profileId
      });
    } catch (error) {
      console.error('Registrartion error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Obtener todos los perfiles de usuario registrados en el sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la lista de perfiles
   */
  async show(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await ProfileModel.show(page, limit);
      
      if (!result.data || result.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No profiles found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profiles fetched successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in show:', error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message
      });
    }
  }

  /**
   * Actualiza la información de un perfil de usuario existente.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID en parámetros y datos en el cuerpo
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la actualización
   */
  async update(req, res) {
    try {
      const { full_name, phone, email, profile_photo, address } = req.body;
      const user_id = req.params.id;
      if (!user_id || !full_name || !phone || !email) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      const updateProfileModel = await ProfileModel.update(user_id, { full_name, phone, email, profile_photo, address });
      res.status(200).json({
        message: 'Profile updated successfully',
        data: updateProfileModel
      });
    } catch (error) {
      console.error('Error in update:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Elimina un perfil de usuario del sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID en parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la eliminación
   */
  async delete(req, res) {
    try {
      // Extraer el ID de usuario desde los parámetros de la URL
      const user_id = req.params.id;
      // Verificar que se haya proporcionado un ID
      if (!user_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Solicita al modelo eliminar el perfil con el ID especificado
      const deleteProfileModel = await ProfileModel.delete(user_id);
      // Retornar el resultado de la operación
      res.status(200).json({
        message: 'Profile deleted successfully',
        data: deleteProfileModel
      });
    } catch (error) {
      // Manejar errores en la eliminación
      console.error('Error in delete:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Buscar un perfil de usuario específico por su ID.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID en parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los datos del perfil encontrado
   */
  async findById(req, res) {
    try {
      const user_id = req.params.id;
      if (!user_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      const existingProfileModel = await ProfileModel.findById(user_id);
      if (!existingProfileModel) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.status(200).json({
        message: 'Profile fetched successfully',
        data: existingProfileModel
      });
    } catch (error) {
      console.error('Error in findById:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new ProfileController();
