import { connect } from '../config/db/connectMysql.js';

class StatusModel {

  static async create({ status_name, status_description, status_entity, status_is_active }) {
    try {
      let sqlQuery = "INSERT INTO status (status_name, status_description, status_entity, status_is_active, status_created_at) VALUES (?, ?, ?, ?, NOW());";
      const [result] = await connect.query(sqlQuery, [status_name, status_description, status_entity, status_is_active]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM status ORDER BY status_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { status_name, status_description, status_entity, status_is_active }) {
    try {
      let sqlQuery = "UPDATE status SET status_name = ?, status_description = ?, status_entity = ?, status_is_active = ? WHERE status_id = ?;";
      const [result] = await connect.query(sqlQuery, [status_name, status_description, status_entity, status_is_active, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM status WHERE status_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT * FROM status WHERE status_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async showActive() {
    try {
      let sqlQuery = "SELECT * FROM status WHERE status_is_active = 1 ORDER BY status_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByIdActive(id) {
    try {
      let sqlQuery = 'SELECT * FROM status WHERE status_id = ? AND status_is_active = 1';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByName(status_name) {
    try {
      let sqlQuery = 'SELECT * FROM status WHERE status_name = ?';
      const [result] = await connect.query(sqlQuery, [status_name]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByEntity(status_entity) {
    try {
      let sqlQuery = 'SELECT * FROM status WHERE status_entity = ? AND status_is_active = 1';
      const [result] = await connect.query(sqlQuery, [status_entity]);
      return result;
    } catch (error) {
      return [];
    }
  }
}

export default StatusModel;