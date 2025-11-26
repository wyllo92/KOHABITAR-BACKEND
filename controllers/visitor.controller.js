import VisitorModel from '../models/visitor.model.js';
import StatusModel from '../models/status.model.js';

/**
 * @fileoverview Controlador para gestionar las operaciones relacionadas con visitantes
 * Manejar las peticiones HTTP para registrar, consultar, actualizar y eliminar visitantes,
 * así como funcionalidades especializadas como registro de salida, estadísticas y consultas de historial.
 */

/**
 * Clase que maneja todas las solicitudes HTTP relacionadas con visitantes
 * Implementar métodos para procesar peticiones y devolver respuestas apropiadas
 */
class VisitorController {

  /**
   * Manejar la petición para registrar un nuevo visitante
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con el resultado del registro
   */
  async register(req, res) {
    try {
      const {
        full_name,
        id_document,
        visit_reason,
        entry_time,
        exit_time,
        authorized_user_id,
        property_id,
        status_id,
        vehicle_id,
        parking_slot_id
      } = req.body;

      // Enhanced validation
      if (!full_name || !id_document || !visit_reason || !entry_time || !authorized_user_id || !property_id || !status_id) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: ['Required fields are missing']
        });
      }

      // Validar que el status_id sea válido para visitantes
      const isValidStatus = await StatusModel.validateStatusForEntity(status_id, 'visitor');
      if (!isValidStatus) {
        return res.status(400).json({
          success: false,
          message: 'El estado proporcionado no es válido para visitantes. Use solo estados de tipo "visitor".'
        });
      }

      // Check if visitor with same document already exists and is active
      const existingVisitor = await VisitorModel.findByDocument(id_document);
      if (existingVisitor && existingVisitor.status_name === 'active') {
        return res.status(409).json({ 
          success: false, 
          message: 'Validation failed',
          errors: ['Visitor with this document is already registered and active']
        });
      }

      const visitorId = await VisitorModel.create({
        full_name,
        id_document,
        visit_reason,
        entry_time,
        exit_time,
        authorized_user_id,
        property_id,
        status_id,
        vehicle_id: vehicle_id || null,
        parking_slot_id: parking_slot_id || null
      });

      if (!visitorId) {
        return res.status(500).json({ 
          success: false, 
          message: 'Server error',
          errors: ['Failed to create visitor']
        });
      }

      // Get the newly created visitor data
      const newVisitor = await VisitorModel.findById(visitorId);

      res.status(201).json({
        success: true,
        message: 'Visitor created successfully',
        data: newVisitor
      });
    } catch (error) {
      console.error('Error in visitor registration:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error',
        errors: [error.message || 'Internal Server Error']
      });
    }
  }

  /**
   * Manejar la petición para obtener todos los visitantes activos
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con la lista de visitantes activos
   */
  async show(req, res) {
    try {
      const visitorModel = await VisitorModel.showActive();
      
      res.status(200).json({
        success: true,
        message: 'Visitors retrieved successfully',
        data: visitorModel
      });
    } catch (error) {
      console.error('Error retrieving visitors:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error',
        errors: [error.message || 'Internal Server Error']
      });
    }
  }

  /**
   * Manejar la petición para actualizar los datos de un visitante existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con el resultado de la actualización
   */
  async update(req, res) {
    try {
      const {
        full_name,
        id_document,
        visit_reason,
        entry_time,
        exit_time,
        authorized_user_id,
        property_id,
        status_id,
        vehicle_id,
        parking_slot_id
      } = req.body;
      const id = req.params.id;

      // Enhanced validation
      if (!full_name || !id_document || !visit_reason || !entry_time || !authorized_user_id || !property_id || !status_id || !id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed',
          errors: ['Required fields are missing']
        });
      }

      // Verify if the Visitor already exists
      const existingVisitor = await VisitorModel.findById(id);
      if (!existingVisitor) {
        return res.status(404).json({
          success: false,
          message: 'Not found',
          errors: ['The visitor does not exist']
        });
      }

      // Validar que el status_id sea válido para visitantes (si se está cambiando)
      const isValidStatus = await StatusModel.validateStatusForEntity(status_id, 'visitor');
      if (!isValidStatus) {
        return res.status(400).json({
          success: false,
          message: 'El estado proporcionado no es válido para visitantes. Use solo estados de tipo "visitor".'
        });
      }

      const updateVisitorModel = await VisitorModel.update(id, {
        full_name,
        id_document,
        visit_reason,
        entry_time,
        exit_time,
        authorized_user_id,
        property_id,
        status_id,
        vehicle_id: vehicle_id || null,
        parking_slot_id: parking_slot_id || null
      });

      if (!updateVisitorModel) {
        return res.status(500).json({ 
          success: false, 
          message: 'Server error',
          errors: ['Failed to update visitor']
        });
      }

      res.status(200).json({
        success: true,
        message: 'Visitor updated successfully',
        data: updateVisitorModel
      });
    } catch (error) {
      console.error('Error in visitor update:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error',
        errors: [error.message || 'Internal Server Error']
      });
    }
  }

  /**
   * Manejar la petición para eliminar un visitante del sistema
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con el resultado de la eliminación
   */
  async delete(req, res) {
    try {
      const id = req.params.id;
      
      // Enhanced validation
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed',
          errors: ['Visitor ID is required'] 
        });
      }
      
      // First verify the visitor exists
      const existingVisitor = await VisitorModel.findById(id);
      if (!existingVisitor) {
        return res.status(404).json({ 
          success: false, 
          message: 'Not found',
          errors: ['The visitor does not exist'] 
        });
      }
      
      // Delete the visitor
      const deleteVisitorModel = await VisitorModel.delete(id);
      
      if (!deleteVisitorModel) {
        return res.status(500).json({ 
          success: false, 
          message: 'Server error',
          errors: ['Failed to delete visitor'] 
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Visitor deleted successfully'
      });
    } catch (error) {
      console.error('Error in visitor delete:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error',
        errors: [error.message || 'Internal Server Error'] 
      });
    }
  }

  /**
   * Manejar la petición para buscar un visitante por su ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con los datos del visitante encontrado
   */
  async findById(req, res) {
    try {
      const id = req.params.id;
      
      // Enhanced validation
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed',
          errors: ['Visitor ID is required'] 
        });
      }
      
      // Verify if the Visitor exists
      const visitorModel = await VisitorModel.findById(id);
      if (!visitorModel) {
        return res.status(404).json({ 
          success: false, 
          message: 'Not found',
          errors: ['Visitor not found'] 
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Visitor found successfully',
        data: visitorModel
      });
    } catch (error) {
      console.error('Error finding visitor:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error',
        errors: [error.message || 'Internal Server Error'] 
      });
    }
  }

  /**
   * Manejar la petición para obtener todos los visitantes del día actual
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con la lista de visitantes del día
   */
  async getTodayVisitors(req, res) {
    try {
      const visitors = await VisitorModel.getTodayVisitors();
      
      res.status(200).json({
        success: true,
        message: 'Today\'s visitors retrieved successfully',
        data: visitors
      });
    } catch (error) {
      console.error('Error retrieving today\'s visitors:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error',
        errors: [error.message || 'Internal Server Error'] 
      });
    }
  }

  /**
   * Manejar la petición para obtener estadísticas de visitantes
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con datos estadísticos de visitantes
   */
  async getStatistics(req, res) {
    try {
      const statistics = await VisitorModel.getVisitorStatistics();
      
      if (!statistics) {
        return res.status(404).json({ 
          success: false, 
          message: 'Not found',
          errors: ['Could not retrieve visitor statistics'] 
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Visitor statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Error retrieving visitor statistics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error',
        errors: [error.message || 'Internal Server Error'] 
      });
    }
  }

  /**
   * Manejar la petición para registrar la salida de un visitante.
   * Este método recibe el ID del visitante y opcionalmente una hora de salida.
   * Si no se proporciona hora de salida, el sistema usa la hora actual automáticamente.
   * El sistema valida que el visitante exista antes de registrar su salida.
   *
   * @param {Object} req - Objeto de solicitud Express con el ID del visitante en los parámetros
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con el resultado del registro de salida
   */
  async checkOut(req, res) {
    try {
      // El sistema obtiene el ID del visitante desde los parámetros de la URL
      const id = req.params.id;

      // El sistema intenta obtener exit_time del cuerpo de la petición
      // Si req.body no existe o está vacío, exit_time será undefined (esto es normal)
      const exit_time = req.body?.exit_time || null;

      // Validación: El sistema verifica que se haya proporcionado un ID
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: ['Visitor ID is required']
        });
      }

      // El sistema busca al visitante en la base de datos para verificar que existe
      const existingVisitor = await VisitorModel.findById(id);
      if (!existingVisitor) {
        return res.status(404).json({
          success: false,
          message: 'Not found',
          errors: ['Visitor not found']
        });
      }

      // Validación adicional: El sistema verifica que el visitante no haya salido previamente
      if (existingVisitor.exit_time) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: ['Visitor has already checked out']
        });
      }

      // El sistema registra la salida del visitante
      // Si exit_time es null, el modelo usará la hora actual automáticamente
      const success = await VisitorModel.checkOut(id, exit_time);

      // El sistema verifica si la operación fue exitosa
      if (!success) {
        return res.status(500).json({
          success: false,
          message: 'Server error',
          errors: ['Failed to check out visitor']
        });
      }

      // El sistema responde con éxito indicando que el visitante ha salido
      res.status(200).json({
        success: true,
        message: 'Visitor checked out successfully'
      });
    } catch (error) {
      // Si ocurre algún error inesperado, el sistema lo registra en la consola
      console.error('Error checking out visitor:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        errors: [error.message || 'Internal Server Error'] 
      });
    }
  }

  /**
   * Manejar la petición para obtener la lista de visitantes más frecuentes
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con la lista de visitantes frecuentes
   */
  async getFrequentVisitors(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      
      if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed',
          errors: ['Invalid limit parameter, must be a positive number'] 
        });
      }
      
      const visitors = await VisitorModel.getFrequentVisitors(limit);
      
      res.status(200).json({
        success: true,
        message: 'Frequent visitors retrieved successfully',
        data: visitors
      });
    } catch (error) {
      console.error('Error retrieving frequent visitors:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error',
        errors: [error.message || 'Internal Server Error'] 
      });
    }
  }

  /**
   * Manejar la petición para obtener el historial de visitas de una persona por su documento
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con el historial de visitas
   */
  async getVisitorHistory(req, res) {
    try {
      const { document } = req.params;
      
      if (!document) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed',
          errors: ['Visitor document is required'] 
        });
      }
      
      const history = await VisitorModel.getVisitorHistory(document);
      
      if (!history || history.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Not found',
          errors: ['No history found for this visitor']
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Visitor history retrieved successfully',
        data: history
      });
    } catch (error) {
      console.error('Error retrieving visitor history:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error',
        errors: [error.message || 'Internal Server Error'] 
      });
    }
  }
}

export default new VisitorController();
