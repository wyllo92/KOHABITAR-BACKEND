import { connect } from '../config/db/connectMysql.js';

class PaymentModel {

  static async create({ user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id, payment_type_id, created_at }) {
    try {
      let sqlQuery = "INSERT INTO payment (user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id, payment_type_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery, [user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id, payment_type_id, created_at]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT p.*, u.user_name, prof.profile_fullName, s.status_name FROM payment p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN profile prof ON u.user_id = prof.user_id LEFT JOIN status s ON p.status_id = s.status_id ORDER BY p.payment_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id, payment_type_id }) {
    try {
      let sqlQuery = "UPDATE payment SET user_id = ?, amount_paid = ?, payment_date = ?, method = ?, reference = ?, invoice_id = ?, reservation_id = ?, parking_assignment_id = ?, status_id = ?, payment_type_id = ? WHERE payment_id = ?;";
      const [result] = await connect.query(sqlQuery, [user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id, payment_type_id, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM payment WHERE payment_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT p.*, u.user_name, prof.profile_fullName, s.status_name FROM payment p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN profile prof ON u.user_id = prof.user_id LEFT JOIN status s ON p.status_id = s.status_id WHERE p.payment_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByUserId(user_id) {
    try {
      let sqlQuery = 'SELECT p.*, u.user_name, prof.profile_fullName, s.status_name FROM payment p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN profile prof ON u.user_id = prof.user_id LEFT JOIN status s ON p.status_id = s.status_id WHERE p.user_id = ?';
      const [result] = await connect.query(sqlQuery, [user_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByInvoiceId(invoice_id) {
    try {
      let sqlQuery = 'SELECT p.*, u.user_name, prof.profile_fullName, s.status_name FROM payment p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN profile prof ON u.user_id = prof.user_id LEFT JOIN status s ON p.status_id = s.status_id WHERE p.invoice_id = ?';
      const [result] = await connect.query(sqlQuery, [invoice_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByReservationId(reservation_id) {
    try {
      let sqlQuery = 'SELECT p.*, u.user_name, prof.profile_fullName, s.status_name FROM payment p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN profile prof ON u.user_id = prof.user_id LEFT JOIN status s ON p.status_id = s.status_id WHERE p.reservation_id = ?';
      const [result] = await connect.query(sqlQuery, [reservation_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByStatus(status_id) {
    try {
      let sqlQuery = 'SELECT p.*, u.user_name, prof.profile_fullName, s.status_name FROM payment p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN profile prof ON u.user_id = prof.user_id LEFT JOIN status s ON p.status_id = s.status_id WHERE p.status_id = ?';
      const [result] = await connect.query(sqlQuery, [status_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByMethod(method) {
    try {
      let sqlQuery = 'SELECT p.*, u.user_name, prof.profile_fullName, s.status_name FROM payment p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN profile prof ON u.user_id = prof.user_id LEFT JOIN status s ON p.status_id = s.status_id WHERE p.method = ?';
      const [result] = await connect.query(sqlQuery, [method]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByDateRange(start_date, end_date) {
    try {
      let sqlQuery = 'SELECT p.*, u.user_name, prof.profile_fullName, s.status_name FROM payment p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN profile prof ON u.user_id = prof.user_id LEFT JOIN status s ON p.status_id = s.status_id WHERE p.payment_date BETWEEN ? AND ?';
      const [result] = await connect.query(sqlQuery, [start_date, end_date]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByAmountRange(min_amount, max_amount) {
    try {
      let sqlQuery = 'SELECT p.*, u.user_name, prof.profile_fullName, s.status_name FROM payment p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN profile prof ON u.user_id = prof.user_id LEFT JOIN status s ON p.status_id = s.status_id WHERE p.amount_paid BETWEEN ? AND ?';
      const [result] = await connect.query(sqlQuery, [min_amount, max_amount]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findSuccessful() {
    try {
      let sqlQuery = 'SELECT p.*, u.user_name, prof.profile_fullName, s.status_name FROM payment p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN profile prof ON u.user_id = prof.user_id LEFT JOIN status s ON p.status_id = s.status_id WHERE p.status_id = 1';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async getPaymentStatistics() {
    try {
      let sqlQuery = `SELECT 
                        COUNT(*) as total_payments,
                        SUM(amount_paid) as total_amount,
                        AVG(amount_paid) as average_payment,
                        COUNT(CASE WHEN status_id = 1 THEN 1 END) as successful_payments,
                        COUNT(CASE WHEN status_id = 3 THEN 1 END) as pending_payments,
                        COUNT(CASE WHEN status_id = 5 THEN 1 END) as cancelled_payments,
                        COUNT(CASE WHEN method = 'Efectivo' THEN 1 END) as cash_payments,
                        COUNT(CASE WHEN method = 'Transferencia' THEN 1 END) as transfer_payments,
                        COUNT(CASE WHEN method = 'Tarjeta' THEN 1 END) as card_payments
                      FROM payment`;
      const [result] = await connect.query(sqlQuery);
      return result[0];
    } catch (error) {
      console.error('Error getting payment statistics:', error);
      return null;
    }
  }

  static async getMonthlyRevenue(year) {
    try {
      let sqlQuery = `SELECT 
                        MONTH(payment_date) as month,
                        MONTHNAME(payment_date) as month_name,
                        COUNT(*) as payment_count,
                        SUM(amount_paid) as total_revenue
                      FROM payment
                      WHERE YEAR(payment_date) = ? AND status_id = 1
                      GROUP BY MONTH(payment_date), MONTHNAME(payment_date)
                      ORDER BY MONTH(payment_date)`;
      const [result] = await connect.query(sqlQuery, [year]);
      return result;
    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      return [];
    }
  }

  static async getPaymentsByType() {
    try {
      let sqlQuery = `SELECT 
                        CASE 
                          WHEN invoice_id IS NOT NULL THEN 'Facturas'
                          WHEN reservation_id IS NOT NULL THEN 'Reservas'
                          WHEN parking_assignment_id IS NOT NULL THEN 'Parqueadero'
                          ELSE 'Otros'
                        END as payment_category,
                        COUNT(*) as payment_count,
                        SUM(amount_paid) as total_amount
                      FROM payment
                      WHERE status_id = 1
                      GROUP BY payment_category
                      ORDER BY total_amount DESC`;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error getting payments by type:', error);
      return [];
    }
  }

  static async getPendingPayments(userId = null) {
    try {
      if (userId) {
        let sqlQuery = `CALL sp_get_pending_payments(?)`;
        const [result] = await connect.query(sqlQuery, [userId]);
        return result[0];
      } else {
        let sqlQuery = `SELECT p.*, u.user_name, prof.profile_fullName, i.description as invoice_description
                        FROM payment p 
                        LEFT JOIN user u ON p.user_id = u.user_id 
                        LEFT JOIN profile prof ON u.user_id = prof.user_id 
                        LEFT JOIN invoice i ON p.invoice_id = i.invoice_id
                        WHERE p.status_id = 3
                        ORDER BY p.payment_date DESC`;
        const [result] = await connect.query(sqlQuery);
        return result;
      }
    } catch (error) {
      console.error('Error getting pending payments:', error);
      return [];
    }
  }

  static async markAsCompleted(paymentId) {
    try {
      let sqlQuery = `UPDATE payment 
                      SET status_id = 4
                      WHERE payment_id = ?`;
      const [result] = await connect.query(sqlQuery, [paymentId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking payment as completed:', error);
      return false;
    }
  }

  static async getRecentPayments(limit = 10) {
    try {
      let sqlQuery = `SELECT p.*, u.user_name, prof.profile_fullName, s.status_name
                      FROM payment p 
                      LEFT JOIN user u ON p.user_id = u.user_id 
                      LEFT JOIN profile prof ON u.user_id = prof.user_id 
                      LEFT JOIN status s ON p.status_id = s.status_id
                      WHERE p.status_id = 1
                      ORDER BY p.payment_date DESC
                      LIMIT ?`;
      const [result] = await connect.query(sqlQuery, [limit]);
      return result;
    } catch (error) {
      console.error('Error getting recent payments:', error);
      return [];
    }
  }

  static async getTodayPayments() {
    try {
      const today = new Date().toISOString().split('T')[0];
      let sqlQuery = `SELECT p.*, u.user_name, prof.profile_fullName, s.status_name
                      FROM payment p 
                      LEFT JOIN user u ON p.user_id = u.user_id 
                      LEFT JOIN profile prof ON u.user_id = prof.user_id 
                      LEFT JOIN status s ON p.status_id = s.status_id
                      WHERE DATE(p.payment_date) = ?
                      ORDER BY p.payment_date DESC`;
      const [result] = await connect.query(sqlQuery, [today]);
      return result;
    } catch (error) {
      console.error('Error getting today payments:', error);
      return [];
    }
  }
}

export default PaymentModel;