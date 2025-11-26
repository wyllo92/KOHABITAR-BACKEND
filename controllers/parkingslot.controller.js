import ParkingSlotModel from '../models/parkingslot.model.js';
import StatusModel from '../models/status.model.js';

/**
 * El controlador gestiona las operaciones relacionadas con espacios de parqueo.
 * El sistema implementa métodos para crear, consultar, actualizar y eliminar información
 * de los espacios de parqueo en el sistema, así como para realizar búsquedas
 * especializadas por propiedad, disponibilidad, reserva o zona.
 */
class ParkingSlotController {

  /**
   * El sistema obtiene los espacios de parqueo asociados a una propiedad específica.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el parámetro property_id
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los espacios de parqueo de la propiedad
   */
  async getSlotsByProperty(req, res) {
    try {
      const { property_id } = req.params;
      const parkingSlots = await ParkingSlotModel.findByProperty(property_id);
      res.json({
        success: true,
        data: parkingSlots,
        message: `Espacios de parqueo de la propiedad ${property_id} obtenidos exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los espacios de parqueo por propiedad',
        error: error.message
      });
    }
  }

  /**
   * El sistema obtiene todos los espacios de parqueo registrados en el sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con todos los espacios de parqueo
   */
  async getAllParkingSlots(req, res) {
    try {
      // Solicita al modelo la lista completa de espacios de parqueo
      const parkingSlots = await ParkingSlotModel.show();
      res.json({
        success: true,
        data: parkingSlots,
        message: 'Espacios de parqueo obtenidos exitosamente'
      });
    } catch (error) {
      // Manejar errores en la obtención de datos
      res.status(500).json({
        success: false,
        message: 'Error al obtener los espacios de parqueo',
        error: error.message
      });
    }
  }

  /**
   * Obtener los espacios de parqueo que están disponibles (no reservados y con estado activo).
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los espacios disponibles
   */
  async getAvailableSlots(req, res) {
    try {
      const parkingSlots = await ParkingSlotModel.findAvailable();
      res.json({
        success: true,
        data: parkingSlots,
        message: 'Espacios disponibles obtenidos exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los espacios disponibles',
        error: error.message
      });
    }
  }

  /**
   * Obtener los espacios de parqueo que están marcados como reservados.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los espacios reservados
   */
  async getReservedSlots(req, res) {
    try {
      // Solicita al modelo la lista de espacios reservados
      const parkingSlots = await ParkingSlotModel.findReserved();
      res.json({
        success: true,
        data: parkingSlots,
        message: 'Espacios reservados obtenidos exitosamente'
      });
    } catch (error) {
      // Manejar errores en la obtención de datos
      res.status(500).json({
        success: false,
        message: 'Error al obtener los espacios reservados',
        error: error.message
      });
    }
  }

  /**
   * Obtener los espacios de parqueo que pertenecen a una zona específica.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el parámetro parking_zone_id
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los espacios de la zona especificada
   */
  async getSlotsByZone(req, res) {
    try {
      const { parking_zone_id } = req.params;
      const parkingSlots = await ParkingSlotModel.findByParkingZone(parking_zone_id);
      res.json({
        success: true,
        data: parkingSlots,
        message: `Espacios de la zona ${parking_zone_id} obtenidos exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los espacios por zona',
        error: error.message
      });
    }
  }

  /**
   * Obtener un espacio de parqueo específico por su ID.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el parámetro id
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los detalles del espacio de parqueo
   */
  async getParkingSlotById(req, res) {
    try {
      // Extraer el ID desde los parámetros de la URL
      const { id } = req.params;
      // Buscar el espacio de parqueo en la base de datos
      const parkingSlot = await ParkingSlotModel.findById(id);

      // Verificar si el espacio de parqueo existe
      if (!parkingSlot) {
        return res.status(404).json({
          success: false,
          message: 'Espacio de parqueo no encontrado'
        });
      }

      // Retornar los detalles del espacio de parqueo
      res.json({
        success: true,
        data: parkingSlot,
        message: 'Espacio de parqueo obtenido exitosamente'
      });
    } catch (error) {
      // Manejar errores en la obtención de datos
      res.status(500).json({
        success: false,
        message: 'Error al obtener el espacio de parqueo',
        error: error.message
      });
    }
  }

  /**
   * Crear un nuevo espacio de parqueo con la información proporcionada.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con los datos del espacio de parqueo en el cuerpo
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los detalles del espacio de parqueo creado
   */
  async createParkingSlot(req, res) {
    try {
      const parkingSlotData = req.body;

      // Validar que el status_id sea válido para espacios de parqueo (si se proporciona)
      if (parkingSlotData.status_id) {
        const isValidStatus = await StatusModel.validateStatusForEntity(parkingSlotData.status_id, 'parking_slot');
        if (!isValidStatus) {
          return res.status(400).json({
            success: false,
            message: 'El estado proporcionado no es válido para espacios de parqueo. Use solo estados de tipo "parking_slot".'
          });
        }
      }

      const parkingSlotId = await ParkingSlotModel.create(parkingSlotData);

      if (parkingSlotId) {
        const newParkingSlot = await ParkingSlotModel.findById(parkingSlotId);
        res.status(201).json({
          success: true,
          data: newParkingSlot,
          message: 'Espacio de parqueo creado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al crear el espacio de parqueo'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el espacio de parqueo',
        error: error.message
      });
    }
  }

  /**
   * Actualiza la información de un espacio de parqueo existente.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID en parámetros y datos de actualización en el cuerpo
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los detalles del espacio de parqueo actualizado
   */
  async updateParkingSlot(req, res) {
    try {
      // Extraer el ID desde los parámetros de la URL y los datos de actualización del cuerpo
      const { id } = req.params;
      const updateData = req.body;

      // Verificar si el espacio de parqueo existe antes de actualizarlo
      const existingSlot = await ParkingSlotModel.findById(id);
      if (!existingSlot) {
        return res.status(404).json({
          success: false,
          message: 'Espacio de parqueo no encontrado'
        });
      }

      // Validar que el status_id sea válido para espacios de parqueo (si se está cambiando)
      if (updateData.status_id) {
        const isValidStatus = await StatusModel.validateStatusForEntity(updateData.status_id, 'parking_slot');
        if (!isValidStatus) {
          return res.status(400).json({
            success: false,
            message: 'El estado proporcionado no es válido para espacios de parqueo. Use solo estados de tipo "parking_slot".'
          });
        }
      }

      // Realizar la actualización en la base de datos
      const updatedSlot = await ParkingSlotModel.update(id, updateData);

      // Verificar si la actualización fue exitosa
      if (updatedSlot) {
        res.json({
          success: true,
          data: updatedSlot,
          message: 'Espacio de parqueo actualizado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al actualizar el espacio de parqueo'
        });
      }
    } catch (error) {
      // Manejar errores en la actualización
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el espacio de parqueo',
        error: error.message
      });
    }
  }

  /**
   * Elimina un espacio de parqueo del sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID en parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async deleteParkingSlot(req, res) {
    try {
      const { id } = req.params;

      const existingSlot = await ParkingSlotModel.findById(id);
      if (!existingSlot) {
        return res.status(404).json({
          success: false,
          message: 'Espacio de parqueo no encontrado'
        });
      }

      const deleted = await ParkingSlotModel.delete(id);

      if (deleted) {
        res.json({
          success: true,
          message: 'Espacio de parqueo eliminado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al eliminar el espacio de parqueo'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el espacio de parqueo',
        error: error.message
      });
    }
  }
}

export default new ParkingSlotController(); 