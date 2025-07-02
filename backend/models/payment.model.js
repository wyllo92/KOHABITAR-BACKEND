import { connect } from '../config/db/connectMysql.js';

class PaymentModel {
  
  static async create({ user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id, payment_type_id, created_at }) {
     try {
      let sqlQuery = "INSERT INTO payment (user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id, payment_type_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery,[user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id, payment_type_id, created_at]);
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
}

export default PaymentModel; 