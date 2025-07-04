import { connect } from '../config/db/connectMysql.js';

class TariffModel {

  static async create({ type, description, amount, surcharge_amount, surcharge_status, due_date, status_id, created_at, updated_at }) {
    try {
      let sqlQuery = "INSERT INTO tariff (type, description, amount, surcharge_amount, surcharge_status, due_date, status_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery, [type, description, amount, surcharge_amount, surcharge_status, due_date, status_id, created_at, updated_at]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT t.*, s.status_name FROM tariff t LEFT JOIN status s ON t.status_id = s.status_id ORDER BY t.tariff_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { type, description, amount, surcharge_amount, surcharge_status, due_date, status_id, updated_at }) {
    try {
      let sqlQuery = "UPDATE tariff SET type = ?, description = ?, amount = ?, surcharge_amount = ?, surcharge_status = ?, due_date = ?, status_id = ?, updated_at = ? WHERE tariff_id = ?;";
      const [result] = await connect.query(sqlQuery, [type, description, amount, surcharge_amount, surcharge_status, due_date, status_id, updated_at, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM tariff WHERE tariff_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT t.*, s.status_name FROM tariff t LEFT JOIN status s ON t.status_id = s.status_id WHERE t.tariff_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByType(type) {
    try {
      let sqlQuery = 'SELECT t.*, s.status_name FROM tariff t LEFT JOIN status s ON t.status_id = s.status_id WHERE t.type = ?';
      const [result] = await connect.query(sqlQuery, [type]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByStatus(status_id) {
    try {
      let sqlQuery = 'SELECT t.*, s.status_name FROM tariff t LEFT JOIN status s ON t.status_id = s.status_id WHERE t.status_id = ?';
      const [result] = await connect.query(sqlQuery, [status_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findActive() {
    try {
      let sqlQuery = 'SELECT t.*, s.status_name FROM tariff t LEFT JOIN status s ON t.status_id = s.status_id WHERE t.status_id = 1';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByAmountRange(min_amount, max_amount) {
    try {
      let sqlQuery = 'SELECT t.*, s.status_name FROM tariff t LEFT JOIN status s ON t.status_id = s.status_id WHERE t.amount BETWEEN ? AND ?';
      const [result] = await connect.query(sqlQuery, [min_amount, max_amount]);
      return result;
    } catch (error) {
      return [];
    }
  }
}

export default TariffModel; 