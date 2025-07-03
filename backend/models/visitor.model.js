import { connect } from '../config/db/connectMysql.js';

class VisitorModel {
  
  static async create({ Visitor_full_name, Visitor_id_document, Visitor_visit_reason, Visitor_entry_time, Visitor_exit_time, Visitor_authorized_by, Property_id, Status_id, Vehicle_id, parkingSlot_id }) {
     try {
      let sqlQuery = "INSERT INTO visitor (Visitor_full_name, Visitor_id_document, Visitor_visit_reason, Visitor_entry_time, Visitor_exit_time, Visitor_authorized_by, Property_id, Status_id, Vehicle_id, parkingSlot_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery,[Visitor_full_name, Visitor_id_document, Visitor_visit_reason, Visitor_entry_time, Visitor_exit_time, Visitor_authorized_by, Property_id, Status_id, Vehicle_id, parkingSlot_id]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT v.*, p.property_name, s.status_name, veh.model as vehicle_model, veh.type as vehicle_type, ps.code as parking_slot_code FROM visitor v LEFT JOIN property p ON v.Property_id = p.property_id LEFT JOIN status s ON v.Status_id = s.status_id LEFT JOIN vehicle veh ON v.Vehicle_id = veh.vehicle_id LEFT JOIN parkingslot ps ON v.parkingSlot_id = ps.parkingSlot_id ORDER BY v.Visitor_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { Visitor_full_name, Visitor_id_document, Visitor_visit_reason, Visitor_entry_time, Visitor_exit_time, Visitor_authorized_by, Property_id, Status_id, Vehicle_id, parkingSlot_id }) {
    try {
      let sqlQuery = "UPDATE visitor SET Visitor_full_name = ?, Visitor_id_document = ?, Visitor_visit_reason = ?, Visitor_entry_time = ?, Visitor_exit_time = ?, Visitor_authorized_by = ?, Property_id = ?, Status_id = ?, Vehicle_id = ?, parkingSlot_id = ? WHERE Visitor_id = ?;";
      const [result] = await connect.query(sqlQuery, [Visitor_full_name, Visitor_id_document, Visitor_visit_reason, Visitor_entry_time, Visitor_exit_time, Visitor_authorized_by, Property_id, Status_id, Vehicle_id, parkingSlot_id, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM visitor WHERE Visitor_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async showActive() {
    try {
      let sqlQuery = "SELECT v.*, p.property_name, s.status_name, veh.model as vehicle_model, veh.type as vehicle_type, ps.code as parking_slot_code FROM visitor v LEFT JOIN property p ON v.Property_id = p.property_id LEFT JOIN status s ON v.Status_id = s.status_id LEFT JOIN vehicle veh ON v.Vehicle_id = veh.vehicle_id LEFT JOIN parkingslot ps ON v.parkingSlot_id = ps.parkingSlot_id WHERE v.Status_id = 1 ORDER BY v.Visitor_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT v.*, p.property_name, s.status_name, veh.model as vehicle_model, veh.type as vehicle_type, ps.code as parking_slot_code FROM visitor v LEFT JOIN property p ON v.Property_id = p.property_id LEFT JOIN status s ON v.Status_id = s.status_id LEFT JOIN vehicle veh ON v.Vehicle_id = veh.vehicle_id LEFT JOIN parkingslot ps ON v.parkingSlot_id = ps.parkingSlot_id WHERE v.Visitor_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByIdActive(id) {
    try {
      let sqlQuery = 'SELECT v.*, p.property_name, s.status_name, veh.model as vehicle_model, veh.type as vehicle_type, ps.code as parking_slot_code FROM visitor v LEFT JOIN property p ON v.Property_id = p.property_id LEFT JOIN status s ON v.Status_id = s.status_id LEFT JOIN vehicle veh ON v.Vehicle_id = veh.vehicle_id LEFT JOIN parkingslot ps ON v.parkingSlot_id = ps.parkingSlot_id WHERE v.Visitor_id = ? AND v.Status_id = 1';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByDocument(Visitor_id_document) {
    try {
      let sqlQuery = 'SELECT v.*, p.property_name, s.status_name, veh.model as vehicle_model, veh.type as vehicle_type, ps.code as parking_slot_code FROM visitor v LEFT JOIN property p ON v.Property_id = p.property_id LEFT JOIN status s ON v.Status_id = s.status_id LEFT JOIN vehicle veh ON v.Vehicle_id = veh.vehicle_id LEFT JOIN parkingslot ps ON v.parkingSlot_id = ps.parkingSlot_id WHERE v.Visitor_id_document = ?';
      const [result] = await connect.query(sqlQuery, [Visitor_id_document]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByPropertyId(Property_id) {
    try {
      let sqlQuery = 'SELECT v.*, p.property_name, s.status_name, veh.model as vehicle_model, veh.type as vehicle_type, ps.code as parking_slot_code FROM visitor v LEFT JOIN property p ON v.Property_id = p.property_id LEFT JOIN status s ON v.Status_id = s.status_id LEFT JOIN vehicle veh ON v.Vehicle_id = veh.vehicle_id LEFT JOIN parkingslot ps ON v.parkingSlot_id = ps.parkingSlot_id WHERE v.Property_id = ?';
      const [result] = await connect.query(sqlQuery, [Property_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByStatus(Status_id) {
    try {
      let sqlQuery = 'SELECT v.*, p.property_name, s.status_name, veh.model as vehicle_model, veh.type as vehicle_type, ps.code as parking_slot_code FROM visitor v LEFT JOIN property p ON v.Property_id = p.property_id LEFT JOIN status s ON v.Status_id = s.status_id LEFT JOIN vehicle veh ON v.Vehicle_id = veh.vehicle_id LEFT JOIN parkingslot ps ON v.parkingSlot_id = ps.parkingSlot_id WHERE v.Status_id = ?';
      const [result] = await connect.query(sqlQuery, [Status_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByDateRange(start_date, end_date) {
    try {
      let sqlQuery = 'SELECT v.*, p.property_name, s.status_name, veh.model as vehicle_model, veh.type as vehicle_type, ps.code as parking_slot_code FROM visitor v LEFT JOIN property p ON v.Property_id = p.property_id LEFT JOIN status s ON v.Status_id = s.status_id LEFT JOIN vehicle veh ON v.Vehicle_id = veh.vehicle_id LEFT JOIN parkingslot ps ON v.parkingSlot_id = ps.parkingSlot_id WHERE v.Visitor_entry_time BETWEEN ? AND ?';
      const [result] = await connect.query(sqlQuery, [start_date, end_date]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findActive() {
    try {
      let sqlQuery = 'SELECT v.*, p.property_name, s.status_name, veh.model as vehicle_model, veh.type as vehicle_type, ps.code as parking_slot_code FROM visitor v LEFT JOIN property p ON v.Property_id = p.property_id LEFT JOIN status s ON v.Status_id = s.status_id LEFT JOIN vehicle veh ON v.Vehicle_id = veh.vehicle_id LEFT JOIN parkingslot ps ON v.parkingSlot_id = ps.parkingSlot_id WHERE v.Status_id = 1';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findCurrentVisitors() {
    try {
      let sqlQuery = 'SELECT v.*, p.property_name, s.status_name, veh.model as vehicle_model, veh.type as vehicle_type, ps.code as parking_slot_code FROM visitor v LEFT JOIN property p ON v.Property_id = p.property_id LEFT JOIN status s ON v.Status_id = s.status_id LEFT JOIN vehicle veh ON v.Vehicle_id = veh.vehicle_id LEFT JOIN parkingslot ps ON v.parkingSlot_id = ps.parkingSlot_id WHERE v.Visitor_exit_time IS NULL';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async checkOut(id, exit_time = null) {
    try {
      const exitTime = exit_time || new Date();
      let sqlQuery = `UPDATE visitor 
                      SET Visitor_exit_time = ?, Status_id = 4
                      WHERE Visitor_id = ?`;
      const [result] = await connect.query(sqlQuery, [exitTime, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error checking out visitor:', error);
      return false;
    }
  }

  static async getTodayVisitors() {
    try {
      const today = new Date().toISOString().split('T')[0];
      let sqlQuery = `SELECT v.*, p.property_name, s.status_name, veh.model as vehicle_model, veh.type as vehicle_type, ps.code as parking_slot_code 
                      FROM visitor v 
                      LEFT JOIN property p ON v.Property_id = p.property_id 
                      LEFT JOIN status s ON v.Status_id = s.status_id 
                      LEFT JOIN vehicle veh ON v.Vehicle_id = veh.vehicle_id 
                      LEFT JOIN parkingslot ps ON v.parkingSlot_id = ps.parkingSlot_id 
                      WHERE DATE(v.Visitor_entry_time) = ?
                      ORDER BY v.Visitor_entry_time DESC`;
      const [result] = await connect.query(sqlQuery, [today]);
      return result;
    } catch (error) {
      console.error('Error getting today visitors:', error);
      return [];
    }
  }

  static async getVisitorStatistics() {
    try {
      let sqlQuery = `SELECT 
                        COUNT(*) as total_visitors,
                        COUNT(CASE WHEN Visitor_exit_time IS NULL THEN 1 END) as current_visitors,
                        COUNT(CASE WHEN DATE(Visitor_entry_time) = CURDATE() THEN 1 END) as today_visitors,
                        COUNT(CASE WHEN Vehicle_id IS NOT NULL THEN 1 END) as visitors_with_vehicles,
                        COUNT(CASE WHEN parkingSlot_id IS NOT NULL THEN 1 END) as visitors_with_parking,
                        AVG(TIMESTAMPDIFF(HOUR, Visitor_entry_time, COALESCE(Visitor_exit_time, NOW()))) as avg_visit_duration_hours
                      FROM visitor`;
      const [result] = await connect.query(sqlQuery);
      return result[0];
    } catch (error) {
      console.error('Error getting visitor statistics:', error);
      return null;
    }
  }

  static async getFrequentVisitors(limit = 10) {
    try {
      let sqlQuery = `SELECT 
                        Visitor_id_document,
                        Visitor_full_name,
                        COUNT(*) as visit_count,
                        MAX(Visitor_entry_time) as last_visit,
                        GROUP_CONCAT(DISTINCT p.property_name SEPARATOR ', ') as visited_properties
                      FROM visitor v
                      INNER JOIN property p ON v.Property_id = p.property_id
                      GROUP BY Visitor_id_document, Visitor_full_name
                      HAVING visit_count > 1
                      ORDER BY visit_count DESC, last_visit DESC
                      LIMIT ?`;
      const [result] = await connect.query(sqlQuery, [limit]);
      return result;
    } catch (error) {
      console.error('Error getting frequent visitors:', error);
      return [];
    }
  }

  static async getVisitorHistory(visitorDocument) {
    try {
      let sqlQuery = `SELECT v.*, 
                             p.property_name, 
                             s.status_name,
                             veh.model as vehicle_model,
                             veh.type as vehicle_type,
                             ps.code as parking_slot_code,
                             TIMESTAMPDIFF(HOUR, v.Visitor_entry_time, COALESCE(v.Visitor_exit_time, NOW())) as visit_duration_hours
                      FROM visitor v
                      LEFT JOIN property p ON v.Property_id = p.property_id
                      LEFT JOIN status s ON v.Status_id = s.status_id
                      LEFT JOIN vehicle veh ON v.Vehicle_id = veh.vehicle_id
                      LEFT JOIN parkingslot ps ON v.parkingSlot_id = ps.parkingSlot_id
                      WHERE v.Visitor_id_document = ?
                      ORDER BY v.Visitor_entry_time DESC`;
      const [result] = await connect.query(sqlQuery, [visitorDocument]);
      return result;
    } catch (error) {
      console.error('Error getting visitor history:', error);
      return [];
    }
  }
}

export default VisitorModel;