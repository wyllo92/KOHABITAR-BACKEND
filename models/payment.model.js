import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar las operaciones de base de datos relacionadas con pagos.
 * Proporciona métodos para realizar operaciones CRUD y consultas especializadas
 * sobre la tabla payments y sus relaciones con otras tablas del sistema.
 */
class PaymentModel {

  /**
   * Crear un nuevo registro de pago en la base de datos.
   * 
   * @param {Object} paymentData - Datos del pago a crear
   * @param {number} paymentData.user_id - ID del usuario que realiza el pago
   * @param {number} paymentData.amount_paid - Monto pagado
   * @param {string} paymentData.payment_date - Fecha del pago
   * @param {string} paymentData.method - Método de pago (Efectivo, Transferencia, Tarjeta, etc.)
   * @param {string} paymentData.reference - Referencia o número de transacción
   * @param {number|null} paymentData.invoice_id - ID de la factura asociada (opcional)
   * @param {number|null} paymentData.reservation_id - ID de la reserva asociada (opcional)
   * @param {number|null} paymentData.parking_assignment_id - ID de la asignación de parqueo (opcional)
   * @param {number} paymentData.status_id - ID del estado del pago
   * @returns {number|null} ID del pago creado o null si hubo un error
   */
  static async create({ user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id }) {
    try {
      // Convert ISO date string to MySQL datetime format
      const formattedDate = new Date(payment_date).toISOString().slice(0, 19).replace('T', ' ');
      
      let sqlQuery = "INSERT INTO payments (user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery, [user_id, amount_paid, formattedDate, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating payment:', error);
      return null;
    }
  }

  /**
   * Obtener todos los pagos con información detallada de sus relaciones.
   * Realiza joins con las tablas de usuarios, perfiles y estados para obtener
   * información completa de cada pago.
   * 
   * @returns {Array} Lista de pagos con información completa
   */
  static async show() {
    try {
      // Consulta SQL que obtiene todos los pagos con datos relacionados
      let sqlQuery = `
        SELECT p.*, 
               u.username, 
               prof.full_name, 
               s.name as status_name 
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.user_id 
        LEFT JOIN profiles prof ON u.user_id = prof.user_id 
        LEFT JOIN statuses s ON p.status_id = s.status_id 
        ORDER BY p.payment_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing payments:', error);
      return [];
    }
  }

  /**
   * Actualiza la información de un pago existente.
   * 
   * @param {number} id - ID del pago a actualizar
   * @param {Object} paymentData - Datos actualizados del pago
   * @param {number} paymentData.user_id - ID actualizado del usuario
   * @param {number} paymentData.amount_paid - Monto actualizado
   * @param {string} paymentData.payment_date - Fecha actualizada
   * @param {string} paymentData.method - Método de pago actualizado
   * @param {string} paymentData.reference - Referencia actualizada
   * @param {number|null} paymentData.invoice_id - ID actualizado de la factura
   * @param {number|null} paymentData.reservation_id - ID actualizado de la reserva
   * @param {number|null} paymentData.parking_assignment_id - ID actualizado de la asignación de parqueo
   * @param {number} paymentData.status_id - ID actualizado del estado
   * @returns {Object|null} Datos del pago actualizado o null si hubo un error
   */
  static async update(id, { user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id }) {
    try {
      // Convert ISO date string to MySQL datetime format
      const formattedDate = new Date(payment_date).toISOString().slice(0, 19).replace('T', ' ');
      
      let sqlQuery = "UPDATE payments SET user_id = ?, amount_paid = ?, payment_date = ?, method = ?, reference = ?, invoice_id = ?, reservation_id = ?, parking_assignment_id = ?, status_id = ? WHERE payment_id = ?;";
      const [result] = await connect.query(sqlQuery, [user_id, amount_paid, formattedDate, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error updating payment:', error);
      return null;
    }
  }

  /**
   * Elimina un pago de la base de datos.
   * 
   * @param {number} id - ID del pago a eliminar
   * @returns {boolean} true si la eliminación fue exitosa, false si no
   */
  static async delete(id) {
    try {
      // Ejecuta la consulta SQL para eliminar el registro
      let sqlQuery = "DELETE FROM payments WHERE payment_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      // Verificar si se eliminó algún registro
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting payment:', error);
      return false;
    }
  }

  /**
   * Buscar un pago por su ID y obtiene información completa
   * incluyendo datos relacionados de otras tablas.
   * 
   * @param {number} id - ID del pago a buscar
   * @returns {Object|null} Datos del pago o null si no se encuentra
   */
  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT p.*, 
               u.username, 
               prof.full_name, 
               s.name as status_name 
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.user_id 
        LEFT JOIN profiles prof ON u.user_id = prof.user_id 
        LEFT JOIN statuses s ON p.status_id = s.status_id 
        WHERE p.payment_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding payment by ID:', error);
      return null;
    }
  }

  /**
   * Obtener todos los pagos realizados por un usuario específico.
   * 
   * @param {number} user_id - ID del usuario
   * @returns {Array} Lista de pagos realizados por el usuario
   */
  static async findByUserId(user_id) {
    try {
      // Consulta SQL que filtra pagos por ID de usuario
      let sqlQuery = `
        SELECT p.*, 
               u.username, 
               prof.full_name, 
               s.name as status_name 
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.user_id 
        LEFT JOIN profiles prof ON u.user_id = prof.user_id 
        LEFT JOIN statuses s ON p.status_id = s.status_id 
        WHERE p.user_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [user_id]);
      return result;
    } catch (error) {
      console.error('Error finding payments by user ID:', error);
      return [];
    }
  }

  /**
   * Obtener todos los pagos asociados a una factura específica.
   * 
   * @param {number} invoice_id - ID de la factura
   * @returns {Array} Lista de pagos asociados a la factura
   */
  static async findByInvoiceId(invoice_id) {
    try {
      let sqlQuery = `
        SELECT p.*, 
               u.username, 
               prof.full_name, 
               s.name as status_name 
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.user_id 
        LEFT JOIN profiles prof ON u.user_id = prof.user_id 
        LEFT JOIN statuses s ON p.status_id = s.status_id 
        WHERE p.invoice_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [invoice_id]);
      return result;
    } catch (error) {
      console.error('Error finding payments by invoice ID:', error);
      return [];
    }
  }

  /**
   * Obtener todos los pagos asociados a una reserva específica.
   * 
   * @param {number} reservation_id - ID de la reserva
   * @returns {Array} Lista de pagos asociados a la reserva
   */
  static async findByReservationId(reservation_id) {
    try {
      // Consulta SQL que filtra pagos por ID de reserva
      let sqlQuery = `
        SELECT p.*, 
               u.username, 
               prof.full_name, 
               s.name as status_name 
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.user_id 
        LEFT JOIN profiles prof ON u.user_id = prof.user_id 
        LEFT JOIN statuses s ON p.status_id = s.status_id 
        WHERE p.reservation_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [reservation_id]);
      return result;
    } catch (error) {
      console.error('Error finding payments by reservation ID:', error);
      return [];
    }
  }

  /**
   * Obtener todos los pagos con un estado específico.
   * 
   * @param {number} status_id - ID del estado
   * @returns {Array} Lista de pagos con el estado especificado
   */
  static async findByStatus(status_id) {
    try {
      let sqlQuery = `
        SELECT p.*, 
               u.username, 
               prof.full_name, 
               s.name as status_name 
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.user_id 
        LEFT JOIN profiles prof ON u.user_id = prof.user_id 
        LEFT JOIN statuses s ON p.status_id = s.status_id 
        WHERE p.status_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [status_id]);
      return result;
    } catch (error) {
      console.error('Error finding payments by status:', error);
      return [];
    }
  }

  /**
   * Obtener todos los pagos realizados con un método específico.
   * 
   * @param {string} method - Método de pago (Efectivo, Transferencia, Tarjeta, etc.)
   * @returns {Array} Lista de pagos realizados con el método especificado
   */
  static async findByMethod(method) {
    try {
      // Consulta SQL que filtra pagos por método de pago
      let sqlQuery = `
        SELECT p.*, 
               u.username, 
               prof.full_name, 
               s.name as status_name 
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.user_id 
        LEFT JOIN profiles prof ON u.user_id = prof.user_id 
        LEFT JOIN statuses s ON p.status_id = s.status_id 
        WHERE p.method = ?
      `;
      const [result] = await connect.query(sqlQuery, [method]);
      return result;
    } catch (error) {
      console.error('Error finding payments by method:', error);
      return [];
    }
  }

  /**
   * Obtener todos los pagos realizados dentro de un rango de fechas.
   * 
   * @param {string} start_date - Fecha de inicio del rango (formato YYYY-MM-DD)
   * @param {string} end_date - Fecha final del rango (formato YYYY-MM-DD)
   * @returns {Array} Lista de pagos realizados en el rango de fechas
   */
  static async findByDateRange(start_date, end_date) {
    try {
      let sqlQuery = `
        SELECT p.*, 
               u.username, 
               prof.full_name, 
               s.name as status_name 
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.user_id 
        LEFT JOIN profiles prof ON u.user_id = prof.user_id 
        LEFT JOIN statuses s ON p.status_id = s.status_id 
        WHERE p.payment_date BETWEEN ? AND ?
      `;
      const [result] = await connect.query(sqlQuery, [start_date, end_date]);
      return result;
    } catch (error) {
      console.error('Error finding payments by date range:', error);
      return [];
    }
  }

  /**
   * Obtener todos los pagos con montos dentro de un rango específico.
   * 
   * @param {number} min_amount - Monto mínimo del rango
   * @param {number} max_amount - Monto máximo del rango
   * @returns {Array} Lista de pagos con montos dentro del rango especificado
   */
  static async findByAmountRange(min_amount, max_amount) {
    try {
      // Consulta SQL que filtra pagos por rango de montos
      let sqlQuery = `
        SELECT p.*, 
               u.username, 
               prof.full_name, 
               s.name as status_name 
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.user_id 
        LEFT JOIN profiles prof ON u.user_id = prof.user_id 
        LEFT JOIN statuses s ON p.status_id = s.status_id 
        WHERE p.amount_paid BETWEEN ? AND ?
      `;
      const [result] = await connect.query(sqlQuery, [min_amount, max_amount]);
      return result;
    } catch (error) {
      console.error('Error finding payments by amount range:', error);
      return [];
    }
  }

  /**
   * Obtener todos los pagos exitosos (con estado 'exitoso' o similar).
   * 
   * @returns {Array} Lista de pagos exitosos
   */
  static async findSuccessful() {
    try {
      let sqlQuery = `
        SELECT p.*, 
               u.username, 
               prof.full_name, 
               s.name as status_name 
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.user_id 
        LEFT JOIN profiles prof ON u.user_id = prof.user_id 
        LEFT JOIN statuses s ON p.status_id = s.status_id 
        WHERE p.status_id = 1
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error finding successful payments:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas generales sobre los pagos en el sistema.
   * Calcula totales, promedios y conteos por estado y método de pago.
   * 
   * @returns {Object|null} Objeto con estadísticas de pagos o null si hubo un error
   */
  static async getPaymentStatistics() {
    try {
      // Consulta SQL que calcula varias estadísticas de pagos
      let sqlQuery = `
        SELECT 
          COUNT(*) as total_payments,
          SUM(amount_paid) as total_amount,
          AVG(amount_paid) as average_payment,
          COUNT(CASE WHEN status_id = 1 THEN 1 END) as successful_payments,
          COUNT(CASE WHEN status_id = 3 THEN 1 END) as pending_payments,
          COUNT(CASE WHEN status_id = 5 THEN 1 END) as cancelled_payments,
          COUNT(CASE WHEN method = 'Efectivo' THEN 1 END) as cash_payments,
          COUNT(CASE WHEN method = 'Transferencia' THEN 1 END) as transfer_payments,
          COUNT(CASE WHEN method = 'Tarjeta' THEN 1 END) as card_payments
        FROM payments
      `;
      const [result] = await connect.query(sqlQuery);
      return result[0];
    } catch (error) {
      console.error('Error getting payment statistics:', error);
      return null;
    }
  }

  /**
   * Obtener los ingresos mensuales para un año específico.
   * 
   * @param {number} year - Año para el cual se desea obtener los ingresos
   * @returns {Array} Lista de ingresos por mes para el año especificado
   */
  static async getMonthlyRevenue(year) {
    try {
      let sqlQuery = `
        SELECT 
          MONTH(payment_date) as month,
          MONTHNAME(payment_date) as month_name,
          COUNT(*) as payment_count,
          SUM(amount_paid) as total_revenue
        FROM payments
        WHERE YEAR(payment_date) = ? AND status_id = 1
        GROUP BY MONTH(payment_date), MONTHNAME(payment_date)
        ORDER BY MONTH(payment_date)
      `;
      const [result] = await connect.query(sqlQuery, [year]);
      return result;
    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de pagos agrupados por tipo (factura, reserva, parqueadero, etc).
   * 
   * @returns {Array} Lista de estadísticas por tipo de pago
   */
  static async getPaymentsByType() {
    try {
      // Consulta SQL que clasifica los pagos por tipo y calcula totales
      let sqlQuery = `
        SELECT 
          CASE 
            WHEN invoice_id IS NOT NULL THEN 'Facturas'
            WHEN reservation_id IS NOT NULL THEN 'Reservas'
            WHEN parking_assignment_id IS NOT NULL THEN 'Parqueadero'
            ELSE 'Otros'
          END as payment_category,
          COUNT(*) as payment_count,
          SUM(amount_paid) as total_amount
        FROM payments
        WHERE status_id = 1
        GROUP BY payment_category
        ORDER BY total_amount DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error getting payments by type:', error);
      return [];
    }
  }

  /**
   * Obtener los pagos pendientes, opcionalmente filtrados por usuario.
   * 
   * @param {number|null} userId - ID de usuario opcional para filtrar
   * @returns {Array} Lista de pagos pendientes
   */
  static async getPendingPayments(userId = null) {
    try {
      if (userId) {
        let sqlQuery = `CALL sp_get_pending_payments(?)`;
        const [result] = await connect.query(sqlQuery, [userId]);
        return result[0];
      } else {
        let sqlQuery = `
          SELECT p.*, 
                 u.username, 
                 prof.full_name, 
                 i.description as invoice_description
          FROM payments p 
          LEFT JOIN users u ON p.user_id = u.user_id 
          LEFT JOIN profiles prof ON u.user_id = prof.user_id 
          LEFT JOIN invoices i ON p.invoice_id = i.invoice_id
          WHERE p.status_id = 3
          ORDER BY p.payment_date DESC
        `;
        const [result] = await connect.query(sqlQuery);
        return result;
      }
    } catch (error) {
      console.error('Error getting pending payments:', error);
      return [];
    }
  }

  /**
   * Marca un pago como completado, cambiando su estado a completado (status_id = 4).
   * 
   * @param {number} paymentId - ID del pago a marcar como completado
   * @returns {boolean} true si la actualización fue exitosa, false si no
   */
  static async markAsCompleted(paymentId) {
    try {
      // Consulta SQL que actualiza el estado del pago a completado
      let sqlQuery = `
        UPDATE payments 
        SET status_id = 4
        WHERE payment_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [paymentId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking payment as completed:', error);
      return false;
    }
  }

  /**
   * Obtener los pagos más recientes, limitados a una cantidad específica.
   * 
   * @param {number} limit - Cantidad máxima de pagos a retornar
   * @returns {Array} Lista de pagos recientes
   */
  static async getRecentPayments(limit = 10) {
    try {
      let sqlQuery = `
        SELECT p.*, 
               u.username, 
               prof.full_name, 
               s.name as status_name
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.user_id 
        LEFT JOIN profiles prof ON u.user_id = prof.user_id 
        LEFT JOIN statuses s ON p.status_id = s.status_id
        WHERE p.status_id = 1
        ORDER BY p.payment_date DESC
        LIMIT ?
      `;
      const [result] = await connect.query(sqlQuery, [limit]);
      return result;
    } catch (error) {
      console.error('Error getting recent payments:', error);
      return [];
    }
  }

  /**
   * Obtener los pagos realizados hoy.
   * 
   * @returns {Array} Lista de pagos realizados en la fecha actual
   */
  static async getTodayPayments() {
    try {
      // Obtener la fecha actual en formato YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      
      // Consulta SQL que filtra pagos por la fecha actual
      let sqlQuery = `
        SELECT p.*, 
               u.username, 
               prof.full_name, 
               s.name as status_name
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.user_id 
        LEFT JOIN profiles prof ON u.user_id = prof.user_id 
        LEFT JOIN statuses s ON p.status_id = s.status_id
        WHERE DATE(p.payment_date) = ?
        ORDER BY p.payment_date DESC
      `;
      const [result] = await connect.query(sqlQuery, [today]);
      return result;
    } catch (error) {
      console.error('Error getting today payments:', error);
      return [];
    }
  }

  /**
   * Genera un estado de cuenta para un usuario específico en un rango de fechas.
   * 
   * @param {Object} params - Parámetros para generar el estado de cuenta
   * @param {number} params.userId - ID del usuario
   * @param {string} params.startDate - Fecha inicial (YYYY-MM-DD)
   * @param {string} params.endDate - Fecha final (YYYY-MM-DD)
   * @param {boolean} params.includeDetails - Si se deben incluir detalles adicionales
   * @param {number|null} params.propertyId - ID de la propiedad (opcional)
   * @returns {Object} Estado de cuenta con resumen y detalles
   */
  static async generateStatement({ userId, startDate, endDate, includeDetails = true, propertyId = null }) {
    try {
      // Convertir las fechas al formato MySQL
      const formattedStartDate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');
      const formattedEndDate = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ');

      // Consultar base para obtener los pagos
      let baseQuery = `
        SELECT 
          p.payment_id,
          p.user_id,
          p.amount_paid,
          p.payment_date,
          p.method,
          p.reference,
          p.invoice_id,
          p.reservation_id,
          p.parking_assignment_id,
          p.status_id,
          u.username,
          prof.full_name,
          s.name as status_name,
          CASE
            WHEN p.invoice_id IS NOT NULL THEN 'Factura'
            WHEN p.reservation_id IS NOT NULL THEN 'Reserva'
            WHEN p.parking_assignment_id IS NOT NULL THEN 'Parqueadero'
            ELSE 'Pago directo'
          END as payment_type
        FROM payments p
        LEFT JOIN users u ON p.user_id = u.user_id
        LEFT JOIN profiles prof ON u.user_id = prof.user_id
        LEFT JOIN statuses s ON p.status_id = s.status_id
        WHERE p.user_id = ?
        AND p.payment_date BETWEEN ? AND ?
      `;

      baseQuery += ' ORDER BY p.payment_date DESC';

      // Ejecutar la consulta con los parámetros correspondientes
      const queryParams = [userId, formattedStartDate, formattedEndDate];

      const [payments] = await connect.query(baseQuery, queryParams);

      // Calcular resumen
      const summary = {
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + p.amount_paid, 0),
        periodStart: startDate,
        periodEnd: endDate,
        paymentsByType: {},
        paymentsByStatus: {}
      };

      // Agrupar pagos por tipo y estado
      payments.forEach(payment => {
        // Agrupar por tipo
        if (!summary.paymentsByType[payment.payment_type]) {
          summary.paymentsByType[payment.payment_type] = {
            count: 0,
            total: 0
          };
        }
        summary.paymentsByType[payment.payment_type].count++;
        summary.paymentsByType[payment.payment_type].total += payment.amount_paid;

        // Agrupar por estado
        if (!summary.paymentsByStatus[payment.status_name]) {
          summary.paymentsByStatus[payment.status_name] = {
            count: 0,
            total: 0
          };
        }
        summary.paymentsByStatus[payment.status_name].count++;
        summary.paymentsByStatus[payment.status_name].total += payment.amount_paid;
      });

      // Preparar respuesta
      const statement = {
        summary,
        details: includeDetails ? payments : undefined
      };

      return statement;
    } catch (error) {
      console.error('Error generating statement:', error);
      throw error;
    }
  }
}

export default PaymentModel;