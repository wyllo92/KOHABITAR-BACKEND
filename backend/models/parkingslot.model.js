import { connect } from '../config/db/connectMysql.js';

class ParkingSlotModel {
  
  static async create({ code, parkingZone_id, status_id, is_reserved, time_unit, total, tariff_id, created_at, updated_at }) {
     try {
      let sqlQuery = "INSERT INTO parkingslot (code, parkingZone_id, status_id, is_reserved, time_unit, total, tariff_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery,[code, parkingZone_id, status_id, is_reserved, time_unit, total, tariff_id, created_at, updated_at]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT ps.*, pz.type as zone_type, pz.capacity as zone_capacity, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM parkingslot ps LEFT JOIN parkingzone pz ON ps.parkingZone_id = pz.parkingZone_id LEFT JOIN property p ON pz.property_id = p.property_id LEFT JOIN status s ON ps.status_id = s.status_id LEFT JOIN tariff t ON ps.tariff_id = t.tariff_id ORDER BY ps.parkingSlot_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { code, parkingZone_id, status_id, is_reserved, time_unit, total, tariff_id, updated_at }) {
    try {
      let sqlQuery = "UPDATE parkingslot SET code = ?, parkingZone_id = ?, status_id = ?, is_reserved = ?, time_unit = ?, total = ?, tariff_id = ?, updated_at = ? WHERE parkingSlot_id = ?;";
      const [result] = await connect.query(sqlQuery, [code, parkingZone_id, status_id, is_reserved, time_unit, total, tariff_id, updated_at, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM parkingslot WHERE parkingSlot_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT ps.*, pz.type as zone_type, pz.capacity as zone_capacity, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM parkingslot ps LEFT JOIN parkingzone pz ON ps.parkingZone_id = pz.parkingZone_id LEFT JOIN property p ON pz.property_id = p.property_id LEFT JOIN status s ON ps.status_id = s.status_id LEFT JOIN tariff t ON ps.tariff_id = t.tariff_id WHERE ps.parkingSlot_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByCode(code) {
    try {
      let sqlQuery = 'SELECT ps.*, pz.type as zone_type, pz.capacity as zone_capacity, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM parkingslot ps LEFT JOIN parkingzone pz ON ps.parkingZone_id = pz.parkingZone_id LEFT JOIN property p ON pz.property_id = p.property_id LEFT JOIN status s ON ps.status_id = s.status_id LEFT JOIN tariff t ON ps.tariff_id = t.tariff_id WHERE ps.code = ?';
      const [result] = await connect.query(sqlQuery, [code]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByParkingZone(parkingZone_id) {
    try {
      let sqlQuery = 'SELECT ps.*, pz.type as zone_type, pz.capacity as zone_capacity, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM parkingslot ps LEFT JOIN parkingzone pz ON ps.parkingZone_id = pz.parkingZone_id LEFT JOIN property p ON pz.property_id = p.property_id LEFT JOIN status s ON ps.status_id = s.status_id LEFT JOIN tariff t ON ps.tariff_id = t.tariff_id WHERE ps.parkingZone_id = ?';
      const [result] = await connect.query(sqlQuery, [parkingZone_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findAvailable() {
    try {
      let sqlQuery = 'SELECT ps.*, pz.type as zone_type, pz.capacity as zone_capacity, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM parkingslot ps LEFT JOIN parkingzone pz ON ps.parkingZone_id = pz.parkingZone_id LEFT JOIN property p ON pz.property_id = p.property_id LEFT JOIN status s ON ps.status_id = s.status_id LEFT JOIN tariff t ON ps.tariff_id = t.tariff_id WHERE ps.is_reserved = 0 AND ps.status_id = 1';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findReserved() {
    try {
      let sqlQuery = 'SELECT ps.*, pz.type as zone_type, pz.capacity as zone_capacity, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM parkingslot ps LEFT JOIN parkingzone pz ON ps.parkingZone_id = pz.parkingZone_id LEFT JOIN property p ON pz.property_id = p.property_id LEFT JOIN status s ON ps.status_id = s.status_id LEFT JOIN tariff t ON ps.tariff_id = t.tariff_id WHERE ps.is_reserved = 1';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }
}

export default ParkingSlotModel; 