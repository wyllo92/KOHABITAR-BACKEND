/**
 * Importa el modelo de tipos de notificación para interactuar con la base de datos.
 * El modelo contiene todos los métodos necesarios para las operaciones CRUD.
 */
import NotificationTypeModel from '../models/notificationType.model.js';

/**
 * Controlador para gestionar las operaciones relacionadas con tipos de notificación.
 * Implementa métodos para crear, consultar, actualizar y eliminar tipos de notificación,
 * así como para buscar tipos por ID.
 */
class NotificationTypeController {

  /**
   * Registra un nuevo tipo de notificación en el sistema.
   *
   * @param {Object} req - Objeto de solicitud HTTP con los datos del tipo en el cuerpo.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @returns {Object} - Respuesta JSON con el resultado de la operación.
   */
  async register(req, res) {
    try {
      const { name, description } = req.body;

      // Realiza la validación básica de los campos requeridos
      if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
      }

      // Crea el nuevo tipo de notificación en la base de datos
      const typeId = await NotificationTypeModel.create({
        name,
        description
      });

      // Verifica si la creación del tipo fue exitosa
      if (!typeId) {
        return res.status(500).json({ error: 'Failed to create notification type' });
      }

      // Retorna una respuesta exitosa con el ID del tipo creado
      return res.status(201).json({
        message: 'Notification type created successfully',
        id: typeId
      });
    } catch (error) {
      // Maneja y registra cualquier error durante el proceso
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Obtiene todos los tipos de notificación del sistema.
   *
   * @param {Object} req - Objeto de solicitud HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @returns {Object} - Respuesta JSON con la lista de tipos de notificación.
   */
  async show(req, res) {
    try {
      // Obtiene todos los tipos de notificación
      const types = await NotificationTypeModel.show();
      return res.status(200).json({
        success: true,
        message: 'Notification types retrieved successfully',
        data: types || []
      });
    } catch (error) {
      // Maneja y registra cualquier error durante la consulta
      console.error('Error retrieving notification types:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }

  /**
   * Actualiza la información de un tipo de notificación existente.
   *
   * @param {Object} req - Objeto de solicitud HTTP con los datos actualizados en el cuerpo y el ID en los parámetros.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @returns {Object} - Respuesta JSON con el resultado de la operación y los datos actualizados.
   */
  async update(req, res) {
    try {
      const { name, description } = req.body;
      const id = req.params.id;

      // Realiza la validación básica de los campos requeridos
      if (!name || !description || !id) {
        return res.status(400).json({ error: 'Name, description and ID are required' });
      }

      // Verifica si el tipo existe antes de actualizarlo
      const existingType = await NotificationTypeModel.findById(id);
      if (!existingType) {
        return res.status(404).json({ error: 'Notification type not found' });
      }

      // Actualiza el tipo con los nuevos datos
      const updatedType = await NotificationTypeModel.update(id, {
        name,
        description
      });

      // Verifica si la actualización fue exitosa
      if (!updatedType) {
        return res.status(500).json({ error: 'Failed to update notification type' });
      }

      // Retorna una respuesta exitosa con los datos actualizados
      return res.status(200).json({
        message: 'Notification type updated successfully',
        data: updatedType
      });
    } catch (error) {
      // Maneja y registra cualquier error durante la actualización
      console.error('Error in notification type update:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Elimina un tipo de notificación del sistema.
   *
   * @param {Object} req - Objeto de solicitud HTTP con el ID del tipo en los parámetros.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @returns {Object} - Respuesta JSON con el resultado de la operación.
   */
  async delete(req, res) {
    try {
      const id = req.params.id;

      // Valida que se proporcione el ID
      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }

      // Verifica que el tipo exista antes de eliminarlo
      const existingType = await NotificationTypeModel.findById(id);
      if (!existingType) {
        return res.status(404).json({ error: 'Notification type not found' });
      }

      // Elimina el tipo
      const deleteResult = await NotificationTypeModel.delete(id);

      // Verifica si la eliminación fue exitosa
      if (!deleteResult) {
        return res.status(500).json({ error: 'Failed to delete notification type' });
      }

      // Retorna una respuesta exitosa
      return res.status(200).json({
        message: 'Notification type deleted successfully'
      });
    } catch (error) {
      // Maneja y registra cualquier error durante la eliminación
      console.error('Error deleting notification type:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Busca un tipo de notificación por su ID.
   *
   * @param {Object} req - Objeto de solicitud HTTP con el ID del tipo en los parámetros.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @returns {Object} - Respuesta JSON con los datos del tipo encontrado.
   */
  async findById(req, res) {
    try {
      const id = req.params.id;

      // Valida que se proporcione el ID
      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }

      // Obtiene el tipo por su ID
      const type = await NotificationTypeModel.findById(id);
      if (!type) {
        return res.status(404).json({ error: 'Notification type not found' });
      }

      // Retorna una respuesta exitosa con los datos del tipo
      return res.status(200).json({
        success: true,
        message: 'Notification type found successfully',
        data: type
      });
    } catch (error) {
      // Maneja y registra cualquier error durante la búsqueda
      console.error('Error finding notification type:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }
}

export default new NotificationTypeController();
