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

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT v.*, p.property_name, s.status_name, veh.model as vehicle_model, veh.type as vehicle_type, ps.code as parking_slot_code FROM visitor v LEFT JOIN property p ON v.Property_id = p.property_id LEFT JOIN status s ON v.Status_id = s.status_id LEFT JOIN vehicle veh ON v.Vehicle_id = veh.vehicle_id LEFT JOIN parkingslot ps ON v.parkingSlot_id = ps.parkingSlot_id WHERE v.Visitor_id = ?';
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
}

export default VisitorModel; 