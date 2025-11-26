import ReservationModel from "../models/reservation.model.js";
import StatusModel from '../models/status.model.js';
import { connect } from "../config/db/connectMysql.js";

/**
 * Controlador para gestionar las operaciones relacionadas con reservas.
 * Implementar métodos para crear, consultar, actualizar, eliminar y cancelar reservas,
 * así como para obtener reservas por diferentes criterios como usuario, zona común o reservas próximas.
 */
class ReservationController {
  /**
   * Obtener todas las reservas realizadas por un usuario específico.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID del usuario en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la lista de reservas del usuario
   */
  async getByUser(req, res) {
    try {
      const { user_id } = req.params;
      const reservations = await ReservationModel.findByUserId(user_id);
      res.status(200).json({
        success: true,
        data: reservations,
        message: 'Reservas del usuario obtenidas exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las reservas del usuario',
        error: error.message
      });
    }
  }

  /**
   * Obtener todas las reservas asociadas a una zona común específica.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID de la zona común en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la lista de reservas de la zona común
   */
  async getByAmenity(req, res) {
    try {
      const { amenity_id } = req.params;
      const reservations = await ReservationModel.findByAmenityId(amenity_id);
      res.status(200).json({
        success: true,
        data: reservations,
        message: 'Reservas de la zona común obtenidas exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las reservas de la zona común',
        error: error.message
      });
    }
  }

  /**
   * Obtener todas las reservas futuras con estado activo.
   * Estas son reservas cuya fecha de inicio es posterior a la fecha actual.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la lista de reservas próximas
   */
  async getUpcoming(req, res) {
    try {
      const reservations = await ReservationModel.findUpcoming();
      res.status(200).json({
        success: true,
        data: reservations,
        message: 'Reservas próximas obtenidas exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las reservas próximas',
        error: error.message
      });
    }
  }

  /**
   * Cancela una reserva existente cambiando su estado a cancelado.
   * Requiere el ID de la reserva.
   *
   * @param {Object} req - Objeto de solicitud HTTP con el ID de la reserva en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la reserva cancelada
   */
  async cancel(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'El ID de la reserva es requerido'
        });
      }

      const cancelled = await ReservationModel.cancel(id);

      if (!cancelled) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada o no se pudo cancelar'
        });
      }

      res.status(200).json({
        success: true,
        data: cancelled,
        message: 'Reserva cancelada exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al cancelar la reserva',
        error: error.message
      });
    }
  }
  /**
   * Obtener todas las reservas registradas en el sistema.
   * Incluye información detallada de cada reserva.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la lista completa de reservas
   */
  async getAll(req, res) {
    try {
      const reservations = await ReservationModel.show();
      res.status(200).json({
        success: true,
        data: reservations,
        message: 'Reservas obtenidas exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las reservas',
        error: error.message
      });
    }
  }

  /**
   * Obtener una reserva específica por su ID.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID de la reserva en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la información detallada de la reserva
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const reservation = await ReservationModel.findById(id);
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }
      res.status(200).json({
        success: true,
        data: reservation,
        message: 'Reserva obtenida exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la reserva',
        error: error.message
      });
    }
  }

  /**
   * Crear una nueva reserva en el sistema.
   * Valida que se proporcionen los campos obligatorios.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con los datos de la reserva en el cuerpo
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la reserva creada
   */
  async create(req, res) {
    try {
      // 1. Extraer y validar campos requeridos
      const {
        amenity_id,
        start_time,
        end_time,
        capacity
      } = req.body;

      const user_id = req.user.id; // Obtenido del token JWT

      if (!amenity_id || !start_time || !end_time || !capacity) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos no proporcionados'
        });
      }

      // 2. Validar que el status_id sea válido para reservas (si se proporciona)
      if (req.body.status_id) {
        const isValidStatus = await StatusModel.validateStatusForEntity(req.body.status_id, 'reservation');
        if (!isValidStatus) {
          return res.status(400).json({
            success: false,
            message: 'El estado proporcionado no es válido para reservas. Use solo estados de tipo "reservation".'
          });
        }
      }

      // 3. Verificar que la zona común exista y esté activa
      const amenity = await ReservationModel.verifyAmenityAvailable(amenity_id);
      if (!amenity) {
        return res.status(404).json({
          success: false,
          message: 'La zona común no existe o no está activa'
        });
      }

      // 4. Validar capacidad máxima
      if (capacity > amenity.capacity) {
        return res.status(400).json({
          success: false,
          message: `La capacidad solicitada (${capacity}) excede el límite de la zona común (${amenity.capacity})`
        });
      }

      // 5. Verificar permisos del usuario
      const canReserve = await ReservationModel.verifyUserCanReserve(user_id);
      if (!canReserve) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para realizar reservas'
        });
      }

      // 6. Verificar solapamiento de horarios
      const hasOverlap = await ReservationModel.hasOverlap(
        amenity_id,
        new Date(start_time),
        new Date(end_time)
      );
      if (hasOverlap) {
        return res.status(400).json({
          success: false,
          message: 'El horario solicitado no está disponible'
        });
      }

      // 7. Si todo está OK, crear la reserva
      const [pendingStatusResult] = await connect.query(
        "SELECT status_id FROM statuses WHERE name = 'Pendiente' LIMIT 1"
      );
      const status_id = pendingStatusResult[0]?.status_id;

      const reservationId = await ReservationModel.create({
        amenity_id,
        user_id,
        status_id,
        tariff_id: amenity.tariff_id,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        capacity
      });

      if (!reservationId) {
        return res.status(500).json({
          success: false,
          message: 'No se pudo crear la reserva'
        });
      }

      const newReservation = await ReservationModel.findById(reservationId);
      
      res.status(201).json({
        success: true,
        data: newReservation,
        message: 'Reserva creada exitosamente'
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la reserva',
        error: error.message
      });
    }
  }

  /**
   * Actualiza una reserva existente.
   * Verificar que la reserva exista antes de intentar actualizarla.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID de la reserva en los parámetros y los datos actualizados en el cuerpo
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la reserva actualizada
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        start_time,
        end_time,
        capacity
      } = req.body;
      
      // 1. Validaciones básicas
      if (!id || !start_time || !end_time || !capacity) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos no proporcionados'
        });
      }
      
      // 2. Verificar que la reserva exista
      const existingReservation = await ReservationModel.findById(id);
      if (!existingReservation) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }
      
      // 3. Verificar permisos del usuario
      if (existingReservation.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tiene permiso para modificar esta reserva'
        });
      }

      // 4. Verificar que la zona común siga activa
      const amenity = await ReservationModel.verifyAmenityAvailable(existingReservation.amenity_id);
      if (!amenity) {
        return res.status(400).json({
          success: false,
          message: 'La zona común no está disponible actualmente'
        });
      }

      // 5. Validar capacidad
      if (capacity > amenity.capacity) {
        return res.status(400).json({
          success: false,
          message: `La capacidad solicitada (${capacity}) excede el límite de la zona común (${amenity.capacity})`
        });
      }

      // 6. Verificar solapamiento con otras reservas
      const hasOverlap = await ReservationModel.hasOverlap(
        existingReservation.amenity_id,
        new Date(start_time),
        new Date(end_time),
        id // excluir la reserva actual
      );

      if (hasOverlap) {
        return res.status(400).json({
          success: false,
          message: 'El horario solicitado no está disponible'
        });
      }

      // 7. Validar que el status_id sea válido para reservas (si se está cambiando)
      if (req.body.status_id) {
        const isValidStatus = await StatusModel.validateStatusForEntity(req.body.status_id, 'reservation');
        if (!isValidStatus) {
          return res.status(400).json({
            success: false,
            message: 'El estado proporcionado no es válido para reservas. Use solo estados de tipo "reservation".'
          });
        }
      }

      // 8. Actualizar la reserva
      const updated = await ReservationModel.update(id, {
        amenity_id: existingReservation.amenity_id,
        user_id: existingReservation.user_id,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        capacity,
        status_id: existingReservation.status_id,
        tariff_id: existingReservation.tariff_id
      });
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'No se pudo actualizar la reserva'
        });
      }
      
      res.status(200).json({
        success: true,
        data: updated,
        message: 'Reserva actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error updating reservation:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la reserva',
        error: error.message
      });
    }
  }

  /**
   * Elimina una reserva del sistema.
   * Verificar que la reserva exista antes de intentar eliminarla.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID de la reserva en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'El ID de la reserva es requerido'
        });
      }
      
      const existingReservation = await ReservationModel.findById(id);
      if (!existingReservation) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }
      
      const deleted = await ReservationModel.delete(id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'No se pudo eliminar la reserva'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Reserva eliminada exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la reserva',
        error: error.message
      });
    }
  }
}

export default new ReservationController();
