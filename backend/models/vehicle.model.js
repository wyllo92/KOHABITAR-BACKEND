import { connect } from '../config/db/connectMysql.js';

class VehicleModel {
  
  static async create({ model, type, color, user_id, property_id, parkingZone_id, status_id, vehicle_createAt, vehicle_updateAt }) {
     try {
      let sqlQuery = "INSERT INTO vehicle (model, type, color, user_id, property_id, parkingZone_id, status_id, vehicle_createAt, vehicle_updateAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery,[model, type, color, user_id, property_id, parkingZone_id, status_id, vehicle_createAt, vehicle_updateAt]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT v.*, u.user_name, p.property_name, s.status_name FROM vehicle v LEFT JOIN user u ON v.user_id = u.user_id LEFT JOIN property p ON v.property_id = p.property_id LEFT JOIN status s ON v.status_id = s.status_id ORDER BY v.vehicle_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { model, type, color, user_id, property_id, parkingZone_id, status_id, vehicle_updateAt }) {
    try {
      let sqlQuery = "UPDATE vehicle SET model = ?, type = ?, color = ?, user_id = ?, property_id = ?, parkingZone_id = ?, status_id = ?, vehicle_updateAt = ? WHERE vehicle_id = ?;";
      const [result] = await connect.query(sqlQuery, [model, type, color, user_id, property_id, parkingZone_id, status_id, vehicle_updateAt, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM vehicle WHERE vehicle_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT v.*, u.user_name, p.property_name, s.status_name FROM vehicle v LEFT JOIN user u ON v.user_id = u.user_id LEFT JOIN property p ON v.property_id = p.property_id LEFT JOIN status s ON v.status_id = s.status_id WHERE v.vehicle_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByUserId(user_id) {
    try {
      let sqlQuery = 'SELECT v.*, u.user_name, p.property_name, s.status_name FROM vehicle v LEFT JOIN user u ON v.user_id = u.user_id LEFT JOIN property p ON v.property_id = p.property_id LEFT JOIN status s ON v.status_id = s.status_id WHERE v.user_id = ?';
      const [result] = await connect.query(sqlQuery, [user_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByPropertyId(property_id) {
    try {
      let sqlQuery = 'SELECT v.*, u.user_name, p.property_name, s.status_name FROM vehicle v LEFT JOIN user u ON v.user_id = u.user_id LEFT JOIN property p ON v.property_id = p.property_id LEFT JOIN status s ON v.status_id = s.status_id WHERE v.property_id = ?';
      const [result] = await connect.query(sqlQuery, [property_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByType(type) {
    try {
      let sqlQuery = 'SELECT v.*, u.user_name, p.property_name, s.status_name FROM vehicle v LEFT JOIN user u ON v.user_id = u.user_id LEFT JOIN property p ON v.property_id = p.property_id LEFT JOIN status s ON v.status_id = s.status_id WHERE v.type = ?';
      const [result] = await connect.query(sqlQuery, [type]);
      return result;
    } catch (error) {
      return [];
    }
  }
}

export default VehicleModel; 