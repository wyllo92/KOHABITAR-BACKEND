import { connect } from '../config/db/connectMysql.js';

class RoleModel {
  
  static async create({ role_name, role_description, status_id }) {
     try {
      let sqlQuery = "INSERT INTO role (role_name, role_description, status_id, role_createAt) VALUES (?, ?, ?, NOW());";
      const [result] = await connect.query(sqlQuery,[role_name, role_description, status_id]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT r.*, s.status_name FROM role r LEFT JOIN status s ON r.status_id = s.status_id ORDER BY r.role_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async showActive() {
    try {
      let sqlQuery = "SELECT r.*, s.status_name FROM role r LEFT JOIN status s ON r.status_id = s.status_id WHERE r.status_id = 1 ORDER BY r.role_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { role_name, role_description, status_id }) {
    try {
      let sqlQuery = "UPDATE role SET role_name = ?, role_description = ?, status_id = ? WHERE role_id = ?;";
      const [result] = await connect.query(sqlQuery, [role_name, role_description, status_id, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM role WHERE role_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT r.*, s.status_name FROM role r LEFT JOIN status s ON r.status_id = s.status_id WHERE r.role_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByIdActive(id) {
    try {
      let sqlQuery = 'SELECT r.*, s.status_name FROM role r LEFT JOIN status s ON r.status_id = s.status_id WHERE r.role_id = ? AND r.status_id = 1';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByName(role_name) {
    try {
      let sqlQuery = 'SELECT r.*, s.status_name FROM role r LEFT JOIN status s ON r.status_id = s.status_id WHERE r.role_name = ?';
      const [result] = await connect.query(sqlQuery, [role_name]);
      return result[0];
    } catch (error) {
      return null;
    }
  }
}

export default RoleModel;