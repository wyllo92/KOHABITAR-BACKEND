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

  static async showActive() {
    try {
      let sqlQuery = "SELECT v.*, u.user_name, p.property_name, s.status_name FROM vehicle v LEFT JOIN user u ON v.user_id = u.user_id LEFT JOIN property p ON v.property_id = p.property_id LEFT JOIN status s ON v.status_id = s.status_id WHERE v.status_id = 1 ORDER BY v.vehicle_id";
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

  static async findByIdActive(id) {
    try {
      let sqlQuery = 'SELECT v.*, u.user_name, p.property_name, s.status_name FROM vehicle v LEFT JOIN user u ON v.user_id = u.user_id LEFT JOIN property p ON v.property_id = p.property_id LEFT JOIN status s ON v.status_id = s.status_id WHERE v.vehicle_id = ? AND v.status_id = 1';
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

  static async createWithLicensePlate({ model, type, color, license_plate, user_id, property_id, parkingZone_id, status_id }) {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      let sqlQuery = "INSERT INTO vehicle (model, type, color, license_plate, user_id, property_id, parkingZone_id, status_id, vehicle_createAt, vehicle_updateAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery, [model, type, color, license_plate, user_id, property_id, parkingZone_id, status_id, currentDate, currentDate]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating vehicle with license plate:', error);
      return null;
    }
  }

  static async findByLicensePlate(license_plate) {
    try {
      let sqlQuery = 'SELECT v.*, u.user_name, pr.profile_fullName, p.property_name, s.status_name FROM vehicle v LEFT JOIN user u ON v.user_id = u.user_id LEFT JOIN profile pr ON u.user_id = pr.user_id LEFT JOIN property p ON v.property_id = p.property_id LEFT JOIN status s ON v.status_id = s.status_id WHERE v.license_plate = ?';
      const [result] = await connect.query(sqlQuery, [license_plate]);
      return result[0];
    } catch (error) {
      console.error('Error finding vehicle by license plate:', error);
      return null;
    }
  }

  static async getByUser(user_id) {
    try {
      let sqlQuery = 'SELECT v.*, p.property_name, s.status_name FROM vehicle v LEFT JOIN property p ON v.property_id = p.property_id LEFT JOIN status s ON v.status_id = s.status_id WHERE v.user_id = ? ORDER BY v.vehicle_createAt DESC';
      const [result] = await connect.query(sqlQuery, [user_id]);
      return result;
    } catch (error) {
      console.error('Error getting vehicles by user:', error);
      return [];
    }
  }

  static async getByProperty(property_id) {
    try {
      let sqlQuery = 'SELECT v.*, u.user_name, pr.profile_fullName, s.status_name FROM vehicle v LEFT JOIN user u ON v.user_id = u.user_id LEFT JOIN profile pr ON u.user_id = pr.user_id LEFT JOIN status s ON v.status_id = s.status_id WHERE v.property_id = ? ORDER BY v.vehicle_createAt DESC';
      const [result] = await connect.query(sqlQuery, [property_id]);
      return result;
    } catch (error) {
      console.error('Error getting vehicles by property:', error);
      return [];
    }
  }

  static async getByType(type) {
    try {
      let sqlQuery = 'SELECT v.*, u.user_name, pr.profile_fullName, p.property_name, s.status_name FROM vehicle v LEFT JOIN user u ON v.user_id = u.user_id LEFT JOIN profile pr ON u.user_id = pr.user_id LEFT JOIN property p ON v.property_id = p.property_id LEFT JOIN status s ON v.status_id = s.status_id WHERE v.type = ? ORDER BY v.vehicle_createAt DESC';
      const [result] = await connect.query(sqlQuery, [type]);
      return result;
    } catch (error) {
      console.error('Error getting vehicles by type:', error);
      return [];
    }
  }

  static async getActiveVehicles() {
    try {
      let sqlQuery = 'SELECT v.*, u.user_name, pr.profile_fullName, p.property_name, s.status_name FROM vehicle v LEFT JOIN user u ON v.user_id = u.user_id LEFT JOIN profile pr ON u.user_id = pr.user_id LEFT JOIN property p ON v.property_id = p.property_id LEFT JOIN status s ON v.status_id = s.status_id WHERE v.status_id = 1 ORDER BY v.vehicle_createAt DESC';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error getting active vehicles:', error);
      return [];
    }
  }

  static async getVehicleStatistics() {
    try {
      let sqlQuery = `SELECT 
                        COUNT(*) as total_vehicles,
                        COUNT(CASE WHEN type = 'Carro' THEN 1 END) as cars,
                        COUNT(CASE WHEN type = 'Moto' THEN 1 END) as motorcycles,
                        COUNT(CASE WHEN status_id = 1 THEN 1 END) as active_vehicles,
                        COUNT(CASE WHEN status_id = 2 THEN 1 END) as inactive_vehicles,
                        COUNT(DISTINCT user_id) as unique_owners
                      FROM vehicle`;
      const [result] = await connect.query(sqlQuery);
      return result[0];
    } catch (error) {
      console.error('Error getting vehicle statistics:', error);
      return null;
    }
  }

  static async getVehiclesWithParkingAssignments() {
    try {
      let sqlQuery = `SELECT v.*, u.user_name, pr.profile_fullName, p.property_name, 
                             pa.parking_Assignment_id, ps.code as parking_slot_code,
                             pa.parking_Assignment_start_time, pa.parking_Assignment_end_time
                      FROM vehicle v
                      LEFT JOIN user u ON v.user_id = u.user_id
                      LEFT JOIN profile pr ON u.user_id = pr.user_id
                      LEFT JOIN property p ON v.property_id = p.property_id
                      LEFT JOIN parking_assignment pa ON v.vehicle_id = pa.Vehicle_id AND pa.Status_id = 1
                      LEFT JOIN parkingslot ps ON pa.parkingSlot_id = ps.parkingSlot_id
                      WHERE v.status_id = 1
                      ORDER BY v.vehicle_createAt DESC`;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error getting vehicles with parking assignments:', error);
      return [];
    }
  }
}

export default VehicleModel;