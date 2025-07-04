import { connect } from '../config/db/connectMysql.js';

class ParkingZoneModel {

  static async create({ type, capacity, property_id, status_id }) {
    try {
      let sqlQuery = "INSERT INTO parkingzone (type, capacity, property_id, status_id) VALUES (?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery, [type, capacity, property_id, status_id]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT pz.*, p.property_name, s.status_name FROM parkingzone pz LEFT JOIN property p ON pz.property_id = p.property_id LEFT JOIN status s ON pz.status_id = s.status_id ORDER BY pz.parkingZone_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { type, capacity, property_id, status_id }) {
    try {
      let sqlQuery = "UPDATE parkingzone SET type = ?, capacity = ?, property_id = ?, status_id = ? WHERE parkingZone_id = ?;";
      const [result] = await connect.query(sqlQuery, [type, capacity, property_id, status_id, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM parkingzone WHERE parkingZone_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT pz.*, p.property_name, s.status_name FROM parkingzone pz LEFT JOIN property p ON pz.property_id = p.property_id LEFT JOIN status s ON pz.status_id = s.status_id WHERE pz.parkingZone_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByPropertyId(property_id) {
    try {
      let sqlQuery = 'SELECT pz.*, p.property_name, s.status_name FROM parkingzone pz LEFT JOIN property p ON pz.property_id = p.property_id LEFT JOIN status s ON pz.status_id = s.status_id WHERE pz.property_id = ?';
      const [result] = await connect.query(sqlQuery, [property_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByType(type) {
    try {
      let sqlQuery = 'SELECT pz.*, p.property_name, s.status_name FROM parkingzone pz LEFT JOIN property p ON pz.property_id = p.property_id LEFT JOIN status s ON pz.status_id = s.status_id WHERE pz.type = ?';
      const [result] = await connect.query(sqlQuery, [type]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findActive() {
    try {
      let sqlQuery = 'SELECT pz.*, p.property_name, s.status_name FROM parkingzone pz LEFT JOIN property p ON pz.property_id = p.property_id LEFT JOIN status s ON pz.status_id = s.status_id WHERE pz.status_id = 1';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }
}

export default ParkingZoneModel; 