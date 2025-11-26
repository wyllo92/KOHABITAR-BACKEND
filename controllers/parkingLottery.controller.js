import ParkingLotteryModel from '../models/parkingLottery.model.js';
import StatusModel from '../models/status.model.js';

/**
 * Controlador para gestionar los sorteos de espacios de parqueo.
 * Implementar la lógica de negocio para crear y ejecutar sorteos,
 * así como gestionar los participantes y resultados.
 */
class ParkingLotteryController {
  /**
   * Crear un nuevo sorteo de espacios de parqueo.
   * Valida las fechas y la disponibilidad de la zona de parqueo.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async createLottery(req, res) {
    try {
      const lotteryData = req.body;

      // Validar que el status_id sea válido para sorteos de parqueo (si se proporciona)
      if (lotteryData.status_id) {
        const isValidStatus = await StatusModel.validateStatusForEntity(lotteryData.status_id, 'parking_lottery');
        if (!isValidStatus) {
          return res.status(400).json({
            success: false,
            message: 'El estado proporcionado no es válido para sorteos de parqueo. Use solo estados de tipo "parking_lottery".'
          });
        }
      }

      const lotteryId = await ParkingLotteryModel.create(lotteryData);
      
      res.status(201).json({
        success: true,
        data: { lottery_id: lotteryId },
        message: 'Sorteo creado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el sorteo',
        error: error.message
      });
    }
  }

  /**
   * Registrar un usuario como participante en un sorteo.
   *
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async registerParticipant(req, res) {
    try {
      const { lottery_id } = req.params;
      const { user_id, property_id } = req.body;

      // Validar que se enviaron los datos requeridos
      if (!user_id || !property_id) {
        return res.status(400).json({
          success: false,
          message: 'Proporcionar user_id y property_id'
        });
      }

      await ParkingLotteryModel.registerParticipant(
        lottery_id,
        user_id,
        property_id
      );

      res.status(201).json({
        success: true,
        message: 'Usuario inscrito exitosamente en el sorteo'
      });
    } catch (error) {
      // Determinar el código de estado apropiado según el error
      let statusCode = 500;
      let message = 'Error al registrar participante en el sorteo';

      // Si el error es de validación (usuario ya inscrito, sorteo cerrado, etc.)
      if (error.message.includes('Ya estás inscrito') ||
          error.message.includes('no existe') ||
          error.message.includes('ya fue ejecutado') ||
          error.message.includes('cancelado')) {
        statusCode = 400; // Bad Request
        message = error.message;
      }

      res.status(statusCode).json({
        success: false,
        message: message,
        error: error.message
      });
    }
  }

  /**
   * Ejecuta el sorteo y asigna los espacios de parqueo.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async executeLottery(req, res) {
    try {
      const { lottery_id } = req.params;
      const assignments = await ParkingLotteryModel.executeLottery(lottery_id);

      res.json({
        success: true,
        data: assignments,
        message: 'Sorteo ejecutado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al ejecutar el sorteo',
        error: error.message
      });
    }
  }

  /**
   * Obtener la lista de todos los sorteos.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async getAllLotteries(req, res) {
    try {
      const lotteries = await ParkingLotteryModel.getAll();
      res.json({
        success: true,
        data: lotteries,
        message: 'Sorteos obtenidos exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los sorteos',
        error: error.message
      });
    }
  }

  /**
   * Obtener los participantes de un sorteo específico.
   *
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async getLotteryParticipants(req, res) {
    try {
      const { lottery_id } = req.params;
      const participants = await ParkingLotteryModel.getParticipants(lottery_id);

      res.json({
        success: true,
        data: participants,
        message: 'Participantes del sorteo obtenidos exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los participantes del sorteo',
        error: error.message
      });
    }
  }

  /**
   * Obtener los resultados de un sorteo (ganadores y no ganadores).
   *
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async getLotteryResults(req, res) {
    try {
      const { lottery_id } = req.params;
      const results = await ParkingLotteryModel.getLotteryResults(lottery_id);

      res.json({
        success: true,
        data: results,
        message: 'Resultados del sorteo obtenidos exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los resultados del sorteo',
        error: error.message
      });
    }
  }

  /**
   * Verificar la disponibilidad de espacios antes de ejecutar el sorteo.
   * Útil para saber con anticipación si el sorteo se puede ejecutar.
   *
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async checkAvailability(req, res) {
    try {
      const { lottery_id } = req.params;
      const availability = await ParkingLotteryModel.checkAvailability(lottery_id);

      res.json({
        success: true,
        data: availability,
        message: availability.can_execute
          ? 'El sorteo está listo para ejecutarse'
          : 'El sorteo NO se puede ejecutar. Revise los errores'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar disponibilidad del sorteo',
        error: error.message
      });
    }
  }

  /**
   * Cancela un sorteo existente.
   * Solo se pueden cancelar sorteos en estado pendiente.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async cancelLottery(req, res) {
    try {
      const { lottery_id } = req.params;
      await ParkingLotteryModel.cancelLottery(lottery_id);

      res.json({
        success: true,
        message: 'Sorteo cancelado exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al cancelar el sorteo',
        error: error.message
      });
    }
  }

  /**
   * Obtener el historial de sorteos con paginación.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async getLotteryHistory(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await ParkingLotteryModel.getLotteryHistory({ page, limit });

      res.json({
        success: true,
        ...result,
        message: 'Historial de sorteos obtenido exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el historial de sorteos',
        error: error.message
      });
    }
  }

  /**
   * Ejecuta el sorteo, asigna espacios y notifica a los ganadores.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async executeLottery(req, res) {
    try {
      const { lottery_id } = req.params;

      // Ejecutar el sorteo
      const assignments = await ParkingLotteryModel.executeLottery(lottery_id);

      // Notificar a los ganadores
      await ParkingLotteryModel.notifyWinners(lottery_id);

      // Crear mensaje informativo
      const totalWinners = assignments.length;
      const winnerMessage = totalWinners === 1
        ? '1 ganador fue seleccionado'
        : `${totalWinners} ganadores fueron seleccionados`;

      res.json({
        success: true,
        data: {
          assignments: assignments,
          summary: {
            total_winners: totalWinners,
            lottery_id: lottery_id
          }
        },
        message: `¡Sorteo ejecutado exitosamente! ${winnerMessage} y notificados. Usa GET /parking-lotteries/${lottery_id}/results para ver todos los detalles`
      });
    } catch (error) {
      // Determinar código de estado apropiado
      let statusCode = 500;

      // Errores de validación deben ser 400 (Bad Request)
      if (error.message.includes('ya fue ejecutado') ||
          error.message.includes('cancelado') ||
          error.message.includes('No hay participantes') ||
          error.message.includes('No hay espacios')) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        message: 'Error al ejecutar el sorteo',
        error: error.message
      });
    }
  }
}

export default new ParkingLotteryController();