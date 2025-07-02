import { connect } from '../config/db/connectMysql.js';

class ReservationModel {
  
  static async create({ amenity_id, user_id, status_id, tariff_id, reservation_createAt, reservation_start_time, reservation_end_time, reservation_time_unit, reservation_capacity }) {
     try {
      let sqlQuery = "INSERT INTO reservation (amenity_id, user_id, status_id, tariff_id, reservation_createAt, reservation_start_time, reservation_end_time, reservation_time_unit, reservation_capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery,[amenity_id, user_id, status_id, tariff_id, reservation_createAt, reservation_start_time, reservation_end_time, reservation_time_unit, reservation_capacity]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT r.*, a.name as amenity_name, u.user_name, p.profile_fullName, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM reservation r LEFT JOIN amenity a ON r.amenity_id = a.amenity_id LEFT JOIN user u ON r.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN status s ON r.status_id = s.status_id LEFT JOIN tariff t ON r.tariff_id = t.tariff_id ORDER BY r.reservation_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { amenity_id, user_id, status_id, tariff_id, reservation_start_time, reservation_end_time, reservation_time_unit, reservation_capacity }) {
    try {
      let sqlQuery = "UPDATE reservation SET amenity_id = ?, user_id = ?, status_id = ?, tariff_id = ?, reservation_start_time = ?, reservation_end_time = ?, reservation_time_unit = ?, reservation_capacity = ? WHERE reservation_id = ?;";
      const [result] = await connect.query(sqlQuery, [amenity_id, user_id, status_id, tariff_id, reservation_start_time, reservation_end_time, reservation_time_unit, reservation_capacity, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM reservation WHERE reservation_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT r.*, a.name as amenity_name, u.user_name, p.profile_fullName, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM reservation r LEFT JOIN amenity a ON r.amenity_id = a.amenity_id LEFT JOIN user u ON r.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN status s ON r.status_id = s.status_id LEFT JOIN tariff t ON r.tariff_id = t.tariff_id WHERE r.reservation_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByUserId(user_id) {
    try {
      let sqlQuery = 'SELECT r.*, a.name as amenity_name, u.user_name, p.profile_fullName, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM reservation r LEFT JOIN amenity a ON r.amenity_id = a.amenity_id LEFT JOIN user u ON r.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN status s ON r.status_id = s.status_id LEFT JOIN tariff t ON r.tariff_id = t.tariff_id WHERE r.user_id = ?';
      const [result] = await connect.query(sqlQuery, [user_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByAmenityId(amenity_id) {
    try {
      let sqlQuery = 'SELECT r.*, a.name as amenity_name, u.user_name, p.profile_fullName, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM reservation r LEFT JOIN amenity a ON r.amenity_id = a.amenity_id LEFT JOIN user u ON r.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN status s ON r.status_id = s.status_id LEFT JOIN tariff t ON r.tariff_id = t.tariff_id WHERE r.amenity_id = ?';
      const [result] = await connect.query(sqlQuery, [amenity_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByStatus(status_id) {
    try {
      let sqlQuery = 'SELECT r.*, a.name as amenity_name, u.user_name, p.profile_fullName, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM reservation r LEFT JOIN amenity a ON r.amenity_id = a.amenity_id LEFT JOIN user u ON r.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN status s ON r.status_id = s.status_id LEFT JOIN tariff t ON r.tariff_id = t.tariff_id WHERE r.status_id = ?';
      const [result] = await connect.query(sqlQuery, [status_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByDateRange(start_date, end_date) {
    try {
      let sqlQuery = 'SELECT r.*, a.name as amenity_name, u.user_name, p.profile_fullName, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM reservation r LEFT JOIN amenity a ON r.amenity_id = a.amenity_id LEFT JOIN user u ON r.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN status s ON r.status_id = s.status_id LEFT JOIN tariff t ON r.tariff_id = t.tariff_id WHERE r.reservation_start_time BETWEEN ? AND ?';
      const [result] = await connect.query(sqlQuery, [start_date, end_date]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findActive() {
    try {
      let sqlQuery = 'SELECT r.*, a.name as amenity_name, u.user_name, p.profile_fullName, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM reservation r LEFT JOIN amenity a ON r.amenity_id = a.amenity_id LEFT JOIN user u ON r.user_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN status s ON r.status_id = s.status_id LEFT JOIN tariff t ON r.tariff_id = t.tariff_id WHERE r.status_id = 1';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }
}

export default ReservationModel; 