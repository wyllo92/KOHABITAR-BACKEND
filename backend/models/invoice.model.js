import { connect } from '../config/db/connectMysql.js';

class InvoiceModel {

  static async create({ user_id, property_id, tariff_id, date, due_date, amount, status_id, description, created_at, updated_at }) {
    try {
      let sqlQuery = "INSERT INTO invoice (user_id, property_id, tariff_id, date, due_date, amount, status_id, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery, [user_id, property_id, tariff_id, date, due_date, amount, status_id, description, created_at, updated_at]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT i.*, u.user_name, p.profile_fullName, prop.property_name, t.type as tariff_type, t.amount as tariff_amount, s.status_name FROM invoice i LEFT JOIN user u ON i.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON i.property_id = prop.property_id LEFT JOIN tariff t ON i.tariff_id = t.tariff_id LEFT JOIN status s ON i.status_id = s.status_id ORDER BY i.invoice_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { user_id, property_id, tariff_id, date, due_date, amount, status_id, description, updated_at }) {
    try {
      let sqlQuery = "UPDATE invoice SET user_id = ?, property_id = ?, tariff_id = ?, date = ?, due_date = ?, amount = ?, status_id = ?, description = ?, updated_at = ? WHERE invoice_id = ?;";
      const [result] = await connect.query(sqlQuery, [user_id, property_id, tariff_id, date, due_date, amount, status_id, description, updated_at, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM invoice WHERE invoice_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT i.*, u.user_name, p.profile_fullName, prop.property_name, t.type as tariff_type, t.amount as tariff_amount, s.status_name FROM invoice i LEFT JOIN user u ON i.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON i.property_id = prop.property_id LEFT JOIN tariff t ON i.tariff_id = t.tariff_id LEFT JOIN status s ON i.status_id = s.status_id WHERE i.invoice_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByUserId(user_id) {
    try {
      let sqlQuery = 'SELECT i.*, u.user_name, p.profile_fullName, prop.property_name, t.type as tariff_type, t.amount as tariff_amount, s.status_name FROM invoice i LEFT JOIN user u ON i.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON i.property_id = prop.property_id LEFT JOIN tariff t ON i.tariff_id = t.tariff_id LEFT JOIN status s ON i.status_id = s.status_id WHERE i.user_id = ?';
      const [result] = await connect.query(sqlQuery, [user_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByPropertyId(property_id) {
    try {
      let sqlQuery = 'SELECT i.*, u.user_name, p.profile_fullName, prop.property_name, t.type as tariff_type, t.amount as tariff_amount, s.status_name FROM invoice i LEFT JOIN user u ON i.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON i.property_id = prop.property_id LEFT JOIN tariff t ON i.tariff_id = t.tariff_id LEFT JOIN status s ON i.status_id = s.status_id WHERE i.property_id = ?';
      const [result] = await connect.query(sqlQuery, [property_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByStatus(status_id) {
    try {
      let sqlQuery = 'SELECT i.*, u.user_name, p.profile_fullName, prop.property_name, t.type as tariff_type, t.amount as tariff_amount, s.status_name FROM invoice i LEFT JOIN user u ON i.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON i.property_id = prop.property_id LEFT JOIN tariff t ON i.tariff_id = t.tariff_id LEFT JOIN status s ON i.status_id = s.status_id WHERE i.status_id = ?';
      const [result] = await connect.query(sqlQuery, [status_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByDateRange(start_date, end_date) {
    try {
      let sqlQuery = 'SELECT i.*, u.user_name, p.profile_fullName, prop.property_name, t.type as tariff_type, t.amount as tariff_amount, s.status_name FROM invoice i LEFT JOIN user u ON i.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON i.property_id = prop.property_id LEFT JOIN tariff t ON i.tariff_id = t.tariff_id LEFT JOIN status s ON i.status_id = s.status_id WHERE i.date BETWEEN ? AND ?';
      const [result] = await connect.query(sqlQuery, [start_date, end_date]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findOverdue() {
    try {
      let sqlQuery = 'SELECT i.*, u.user_name, p.profile_fullName, prop.property_name, t.type as tariff_type, t.amount as tariff_amount, s.status_name FROM invoice i LEFT JOIN user u ON i.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON i.property_id = prop.property_id LEFT JOIN tariff t ON i.tariff_id = t.tariff_id LEFT JOIN status s ON i.status_id = s.status_id WHERE i.due_date < NOW() AND i.status_id != 3';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findPending() {
    try {
      let sqlQuery = 'SELECT i.*, u.user_name, p.profile_fullName, prop.property_name, t.type as tariff_type, t.amount as tariff_amount, s.status_name FROM invoice i LEFT JOIN user u ON i.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON i.property_id = prop.property_id LEFT JOIN tariff t ON i.tariff_id = t.tariff_id LEFT JOIN status s ON i.status_id = s.status_id WHERE i.status_id = 3';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }
}

export default InvoiceModel; 