import UserPropertyModel from '../models/userProperty.model.js';
import UserModel from '../models/user.model.js';
import PropertyModel from '../models/property.model.js';
import StatusModel from '../models/status.model.js';
import { connect } from '../config/db/connectMysql.js';

/**
 * Controlador para gestionar las relaciones entre usuarios y propiedades.
 * Manejar las solicitudes HTTP relacionadas con la creación, consulta,
 * actualización y eliminación de asociaciones usuario-propiedad.
 */
class UserPropertyController {
  
  /**
   * Crear una nueva relación entre un usuario y una propiedad.
   * Valida que tanto el usuario como la propiedad existan, y que no exista ya una relación activa.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con datos de la relación
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async create(req, res) {
    try {
      const { user_id, property_id, is_owner, start_date, end_date, status_id } = req.body;
      
      // Basic validation
      if (!user_id || !property_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID and Property ID are required' 
        });
      }
      
      // Check if user exists
      const user = await UserModel.findById(user_id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }
      
      // Check if property exists
      const property = await PropertyModel.findById(property_id);
      if (!property) {
        return res.status(404).json({ 
          success: false, 
          error: 'Property not found' 
        });
      }
      // Buscar si ya existe una relación entre este usuario y esta propiedad
      const [existingRelations] = await connect.query(
        `SELECT * FROM user_properties
         WHERE user_id = ? AND property_id = ?`,
        [user_id, property_id]
      );

      if (existingRelations.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'User-property relation already exists'
        });
      }
      
      // Si no se proporciona status_id, usar el proporcionado o usar 1 (Activo por defecto)
      let statusToUse = status_id || 1;
      
      // Create user-property relation
      const userPropertyId = await UserPropertyModel.create({
        user_id,
        property_id,
        is_owner: is_owner || false,
        start_date,
        end_date,
        status_id: statusToUse
      });

      if (!userPropertyId) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create user-property relation'
        });
      }

      // Responder con los datos básicos creados sin necesidad de una segunda consulta
      res.status(201).json({
        success: true,
        message: 'User-property relation created successfully',
        data: {
          user_property_id: userPropertyId,
          user_id,
          property_id,
          is_owner: is_owner || false,
          start_date,
          end_date,
          status_id: statusToUse
        }
      });
    } catch (error) {
      console.error('Error creating user-property relation:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
  
  /**
   * Obtener todas las relaciones usuario-propiedad registradas en el sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la lista de relaciones
   */
  async show(req, res) {
    try {
      const relations = await UserPropertyModel.show();
      
      res.status(200).json({
        success: true,
        message: 'User-property relations retrieved successfully',
        data: relations
      });
    } catch (error) {
      console.error('Error retrieving user-property relations:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
  
  /**
   * Buscar todas las propiedades asociadas a un usuario específico.
   * Verificar primero que el usuario exista antes de buscar sus propiedades.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID del usuario en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con las propiedades del usuario o mensaje de error
   */
  async findByUserId(req, res) {
    try {
      const userId = req.params.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }
      
      // Verificar si el usuario existe
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      const relations = await UserPropertyModel.findByUserId(userId);
      
      res.status(200).json({
        success: true,
        message: 'User properties retrieved successfully',
        data: relations
      });
    } catch (error) {
      console.error('Error retrieving user properties:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
  
  /**
   * Buscar todos los usuarios asociados a una propiedad específica.
   * Verificar primero que la propiedad exista antes de buscar sus usuarios.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID de la propiedad en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los usuarios de la propiedad o mensaje de error
   */
  async findByPropertyId(req, res) {
    try {
      const propertyId = req.params.propertyId;
      
      if (!propertyId) {
        return res.status(400).json({
          success: false,
          error: 'Property ID is required'
        });
      }
      
      // Verificar si la propiedad existe
      const property = await PropertyModel.findById(propertyId);
      if (!property) {
        return res.status(404).json({
          success: false,
          error: 'Property not found'
        });
      }
      
      const relations = await UserPropertyModel.findByPropertyId(propertyId);
      
      res.status(200).json({
        success: true,
        message: 'Property users retrieved successfully',
        data: relations
      });
    } catch (error) {
      console.error('Error retrieving property users:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
  
  /**
   * Obtener todos los residentes de una propiedad específica utilizando un procedimiento almacenado.
   * Este método proporciona información más detallada que findByPropertyId.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID de la propiedad en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los residentes de la propiedad o mensaje de error
   */
  async getPropertyResidents(req, res) {
    try {
      const propertyId = req.params.propertyId;
      
      if (!propertyId) {
        return res.status(400).json({
          success: false,
          error: 'Property ID is required'
        });
      }
      
      // Verificar si la propiedad existe
      const property = await PropertyModel.findById(propertyId);
      if (!property) {
        return res.status(404).json({
          success: false,
          error: 'Property not found'
        });
      }
      
      const residents = await UserPropertyModel.getPropertyResidents(propertyId);
      
      res.status(200).json({
        success: true,
        message: 'Property residents retrieved successfully',
        data: residents
      });
    } catch (error) {
      console.error('Error retrieving property residents:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
  
  /**
   * Actualiza una relación usuario-propiedad existente.
   * Permite modificar si es propietario, las fechas y el estado de la relación.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID y los datos a actualizar
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la relación actualizada o mensaje de error
   */
  async update(req, res) {
    try {
      const id = req.params.id;
      const { is_owner, start_date, end_date, status_id } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID is required'
        });
      }
      
      // Verificar si la relación existe
      const existingRelation = await UserPropertyModel.findById(id);
      if (!existingRelation) {
        return res.status(404).json({
          success: false,
          error: 'User-property relation not found'
        });
      }

      // Prepara los datos para actualizar usando valores existentes como fallback
      const dataToUpdate = {
        is_owner: is_owner !== undefined ? is_owner : (existingRelation.is_owner || false),
        start_date: start_date || existingRelation.start_date,
        end_date: end_date || existingRelation.end_date,
        status_id: status_id || existingRelation.status_id || 1
      };

      const updatedRelation = await UserPropertyModel.update(id, dataToUpdate);
      
      if (!updatedRelation) {
        return res.status(500).json({
          success: false,
          error: 'Failed to update user-property relation'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'User-property relation updated successfully',
        data: updatedRelation
      });
    } catch (error) {
      console.error('Error updating user-property relation:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
  
  /**
   * Elimina una relación usuario-propiedad existente.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID de la relación a eliminar
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async delete(req, res) {
    try {
      const id = req.params.id;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID is required'
        });
      }
      
      // Verificar si la relación existe
      const existingRelation = await UserPropertyModel.findById(id);
      if (!existingRelation) {
        return res.status(404).json({
          success: false,
          error: 'User-property relation not found'
        });
      }
      
      const deleted = await UserPropertyModel.delete(id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete user-property relation'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'User-property relation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user-property relation:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
}

export default new UserPropertyController();
