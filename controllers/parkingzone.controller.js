import ParkingZoneModel from '../models/parkingzone.model.js';
import StatusModel from '../models/status.model.js';

/**
 * El controlador gestiona las operaciones relacionadas con zonas de parqueo.
 * El sistema implementa métodos para crear, consultar, actualizar y eliminar información
 * de las zonas de parqueo en el sistema, así como para consultar su disponibilidad.
 */
class ParkingZoneController {

  /**
   * El sistema obtiene la información de disponibilidad de una zona de parqueo específica.
   * El sistema consulta la cantidad de espacios disponibles y ocupados dentro de la zona.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el parámetro id
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los datos de disponibilidad de la zona
   */
  async getZoneAvailability(req, res) {
    try {
      const { id } = req.params;
      const availability = await ParkingZoneModel.getAvailability(id);
      
      if (!availability || availability.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No se encontraron espacios disponibles en esta zona'
        });
      }
      
      res.json({
        success: true,
        data: availability,
        message: 'Disponibilidad de parqueo obtenida exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la disponibilidad de parqueo',
        error: error.message
      });
    }
  }

  /**
   * El sistema obtiene todas las zonas de parqueo registradas en el sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con todas las zonas de parqueo
   */
  async getAllParkingZones(req, res) {
    try {
      // Solicitar al modelo la lista completa de zonas de parqueo
      const parkingZones = await ParkingZoneModel.show();
      res.json({
        success: true,
        data: parkingZones,
        message: 'Zonas de parqueo obtenidas exitosamente'
      });
    } catch (error) {
      // Manejar errores en la obtención de datos
      res.status(500).json({
        success: false,
        message: 'Error al obtener las zonas de parqueo',
        error: error.message
      });
    }
  }

  /**
   * Obtener una zona de parqueo específica por su ID.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el parámetro id
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los detalles de la zona de parqueo
   */
  async getParkingZoneById(req, res) {
    try {
      const { id } = req.params;
      const parkingZone = await ParkingZoneModel.findById(id);

      if (!parkingZone) {
        return res.status(404).json({
          success: false,
          message: 'Zona de parqueo no encontrada'
        });
      }

      res.json({
        success: true,
        data: parkingZone,
        message: 'Zona de parqueo obtenida exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la zona de parqueo',
        error: error.message
      });
    }
  }

  /**
   * Crear una nueva zona de parqueo con la información proporcionada.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con los datos de la zona en el cuerpo
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los detalles de la zona de parqueo creada
   */
  async createParkingZone(req, res) {
    try {
      // Extraer los datos de la zona de parqueo desde el cuerpo de la solicitud
      const parkingZoneData = req.body;

      // Validar que el status_id sea válido para zonas de parqueo (si se proporciona)
      if (parkingZoneData.status_id) {
        const isValidStatus = await StatusModel.validateStatusForEntity(parkingZoneData.status_id, 'parking_zone');
        if (!isValidStatus) {
          return res.status(400).json({
            success: false,
            message: 'El estado proporcionado no es válido para zonas de parqueo. Use solo estados de tipo "parking_zone".'
          });
        }
      }

      // Crear la zona de parqueo en la base de datos
      const parkingZoneId = await ParkingZoneModel.create(parkingZoneData);

      // Verificar si la creación fue exitosa
      if (parkingZoneId) {
        // Obtener los datos completos de la zona recién creada
        const newParkingZone = await ParkingZoneModel.findById(parkingZoneId);
        res.status(201).json({
          success: true,
          data: newParkingZone,
          message: 'Zona de parqueo creada exitosamente'
        });
      } else {
        // Retornar error si no se pudo crear la zona
        res.status(400).json({
          success: false,
          message: 'Error al crear la zona de parqueo'
        });
      }
    } catch (error) {
      // Manejar errores en el proceso de creación
      res.status(500).json({
        success: false,
        message: 'Error al crear la zona de parqueo',
        error: error.message
      });
    }
  }

  /**
   * Actualiza la información de una zona de parqueo existente.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID en parámetros y datos de actualización en el cuerpo
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los detalles de la zona de parqueo actualizada
   */
  async updateParkingZone(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validar los datos de entrada
      if (updateData.capacity && updateData.capacity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La capacidad debe ser un número positivo'
        });
      }

      const existingZone = await ParkingZoneModel.findById(id);
      if (!existingZone) {
        return res.status(404).json({
          success: false,
          message: 'Zona de parqueo no encontrada'
        });
      }

      // Validar que el status_id sea válido para zonas de parqueo (si se está cambiando)
      if (updateData.status_id) {
        const isValidStatus = await StatusModel.validateStatusForEntity(updateData.status_id, 'parking_zone');
        if (!isValidStatus) {
          return res.status(400).json({
            success: false,
            message: 'El estado proporcionado no es válido para zonas de parqueo. Use solo estados de tipo "parking_zone".'
          });
        }
      }

      // Mantener los valores existentes para los campos no proporcionados
      const dataToUpdate = {
        ...existingZone,
        ...updateData
      };

      const updatedZone = await ParkingZoneModel.update(id, dataToUpdate);

      if (updatedZone) {
        res.json({
          success: true,
          data: updatedZone,
          message: 'Zona de parqueo actualizada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al actualizar la zona de parqueo'
        });
      }
    } catch (error) {
      console.error('Error en updateParkingZone:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la zona de parqueo',
        error: error.message
      });
    }
  }

  /**
   * Elimina una zona de parqueo del sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID en parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async deleteParkingZone(req, res) {
    try {
      // Extraer el ID desde los parámetros de la URL
      const { id } = req.params;

      // Verificar si la zona de parqueo existe antes de intentar eliminarla
      const existingZone = await ParkingZoneModel.findById(id);
      if (!existingZone) {
        return res.status(404).json({
          success: false,
          message: 'Zona de parqueo no encontrada'
        });
      }

      // Intenta realizar la eliminación en la base de datos
      const deleted = await ParkingZoneModel.delete(id);

      // Si la eliminación fue exitosa
      res.json({
        success: true,
        message: 'Zona de parqueo eliminada exitosamente'
      });

    } catch (error) {
      // Manejar diferentes tipos de errores
      if (error.message.includes('hay vehículos asignados')) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar la zona porque hay vehículos asignados a ella',
          error: error.message
        });
      }
      
      if (error.message.includes('hay asignaciones de parqueo activas')) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar la zona porque hay espacios de parqueo con reservaciones activas',
          error: error.message
        });
      }

      // Para cualquier otro error
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la zona de parqueo',
        error: error.message,
        details: 'Para eliminar esta zona, asegúrese de que no haya vehículos asignados ni reservaciones activas'
      });
    }
  }
}

export default new ParkingZoneController(); 