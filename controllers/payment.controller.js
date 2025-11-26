import PaymentModel from '../models/payment.model.js';
import StatusModel from '../models/status.model.js';

/**
 * Controlador para gestionar las operaciones relacionadas con pagos.
 * Implementar métodos para crear, consultar, actualizar y eliminar pagos,
 * así como para realizar búsquedas por usuario, factura y otras consultas especializadas.
 */
class PaymentController {

  /**
   * Obtener todos los pagos registrados en el sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la lista de pagos
   */
  async getAllPayments(req, res) {
    try {
      const payments = await PaymentModel.show();
      res.json({
        success: true,
        data: payments,
        message: 'Pagos obtenidos exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pagos',
        error: error.message
      });
    }
  }

  /**
   * Obtener todos los pagos asociados a una factura específica.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el parámetro invoice_id
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los pagos de la factura
   */
  async getPaymentsByInvoice(req, res) {
    try {
      // Extraer el ID de factura desde los parámetros de la URL
      const { invoice_id } = req.params;
      // Solicita al modelo los pagos asociados a esta factura
      const payments = await PaymentModel.findByInvoiceId(invoice_id);
      res.json({
        success: true,
        data: payments,
        message: `Pagos de la factura ${invoice_id} obtenidos exitosamente`
      });
    } catch (error) {
      // Manejar errores en la obtención de datos
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pagos de la factura',
        error: error.message
      });
    }
  }

  /**
   * Obtener todos los pagos realizados por un usuario específico.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el parámetro user_id
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los pagos del usuario
   */
  async getPaymentsByUser(req, res) {
    try {
      const { user_id } = req.params;
      const payments = await PaymentModel.findByUserId(user_id);
      res.json({
        success: true,
        data: payments,
        message: `Pagos del usuario ${user_id} obtenidos exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pagos del usuario',
        error: error.message
      });
    }
  }

  /**
   * Obtener un pago específico por su ID.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el parámetro id
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los detalles del pago
   */
  async getPaymentById(req, res) {
    try {
      // Extraer el ID desde los parámetros de la URL
      const { id } = req.params;
      // Buscar el pago en la base de datos
      const payment = await PaymentModel.findById(id);

      // Verificar si el pago existe
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      // Retornar los detalles del pago
      res.json({
        success: true,
        data: payment,
        message: 'Pago obtenido exitosamente'
      });
    } catch (error) {
      // Manejar errores en la obtención de datos
      res.status(500).json({
        success: false,
        message: 'Error al obtener el pago',
        error: error.message
      });
    }
  }

  /**
   * Crear un nuevo registro de pago en el sistema.
   *
   * @param {Object} req - Objeto de solicitud HTTP con los datos del pago en el cuerpo
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los detalles del pago creado
   */
  async createPayment(req, res) {
    try {
      const paymentData = req.body;

      // Validar que el status_id sea válido para pagos (si se proporciona)
      if (paymentData.status_id) {
        const isValidStatus = await StatusModel.validateStatusForEntity(paymentData.status_id, 'payment');
        if (!isValidStatus) {
          return res.status(400).json({
            success: false,
            message: 'El estado proporcionado no es válido para pagos. Use solo estados de tipo "payment".'
          });
        }
      }

      const paymentId = await PaymentModel.create(paymentData);

      if (paymentId) {
        const newPayment = await PaymentModel.findById(paymentId);
        res.status(201).json({
          success: true,
          data: newPayment,
          message: 'Pago creado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al crear el pago'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el pago',
        error: error.message
      });
    }
  }

  /**
   * Actualiza la información de un pago existente.
   *
   * @param {Object} req - Objeto de solicitud HTTP con el ID en parámetros y datos de actualización en el cuerpo
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los detalles del pago actualizado
   */
  async updatePayment(req, res) {
    try {
      // Extraer el ID desde los parámetros de la URL y los datos de actualización del cuerpo
      const { id } = req.params;
      const updateData = req.body;

      // Verificar si el pago existe antes de actualizarlo
      const existingPayment = await PaymentModel.findById(id);
      if (!existingPayment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      // Validar que el status_id sea válido para pagos (si se está cambiando)
      if (updateData.status_id) {
        const isValidStatus = await StatusModel.validateStatusForEntity(updateData.status_id, 'payment');
        if (!isValidStatus) {
          return res.status(400).json({
            success: false,
            message: 'El estado proporcionado no es válido para pagos. Use solo estados de tipo "payment".'
          });
        }
      }

      // Realizar la actualización en la base de datos
      const updatedPayment = await PaymentModel.update(id, updateData);

      // Verificar si la actualización fue exitosa
      if (updatedPayment) {
        res.json({
          success: true,
          data: updatedPayment,
          message: 'Pago actualizado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al actualizar el pago'
        });
      }
    } catch (error) {
      // Manejar errores en la actualización
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el pago',
        error: error.message
      });
    }
  }

  /**
   * Elimina un pago del sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID en parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async deletePayment(req, res) {
    try {
      const { id } = req.params;

      const existingPayment = await PaymentModel.findById(id);
      if (!existingPayment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      const deleted = await PaymentModel.delete(id);

      if (deleted) {
        res.json({
          success: true,
          message: 'Pago eliminado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al eliminar el pago'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el pago',
        error: error.message
      });
    }
  }

  /**
   * Genera un estado de cuenta para un usuario específico.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} req.body - Datos para generar el estado de cuenta
   * @param {number} req.body.userId - ID del usuario
   * @param {string} req.body.startDate - Fecha inicial (YYYY-MM-DD)
   * @param {string} req.body.endDate - Fecha final (YYYY-MM-DD)
   * @param {boolean} [req.body.includeDetails=true] - Si se deben incluir detalles
   * @param {number} [req.body.propertyId] - ID de la propiedad (opcional)
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Estado de cuenta con resumen y detalles
   */
  async generateStatement(req, res) {
    try {
      // Validar datos requeridos
      const { userId, startDate, endDate, includeDetails = true, propertyId = null } = req.body;

      if (!userId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos',
          errors: ['Se requieren userId, startDate y endDate']
        });
      }

      // Validar fechas
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Fechas inválidas',
          errors: ['Las fechas deben estar en formato YYYY-MM-DD']
        });
      }

      if (start > end) {
        return res.status(400).json({
          success: false,
          message: 'Rango de fechas inválido',
          errors: ['La fecha inicial debe ser anterior a la fecha final']
        });
      }

      // Generar estado de cuenta
      const statement = await PaymentModel.generateStatement({
        userId,
        startDate,
        endDate,
        includeDetails: includeDetails || false,
        propertyId: propertyId || null  
      });

      // Enviar respuesta
      res.json({
        success: true,
        message: 'Estado de cuenta generado exitosamente',
        data: statement
      });

    } catch (error) {
      console.error('Error generating statement:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar estado de cuenta',
        error: error.message
      });
    }
  }
}

export default new PaymentController(); 