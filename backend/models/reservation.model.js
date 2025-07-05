import { connect } from '../config/db/connectMysql.js';


class ReservationModel {
  // CREATE
  static async create({ amenity_id, user_id, status_id, tariff_id, reservation_createAt, reservation_start_time, reservation_end_time, reservation_time_unit, reservation_capacity }) {
    try {
      const sqlQuery = `INSERT INTO reservation (amenity_id, user_id, status_id, tariff_id, reservation_createAt, reservation_start_time, reservation_end_time, reservation_time_unit, reservation_capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const [result] = await connect.query(sqlQuery, [amenity_id, user_id, status_id, tariff_id, reservation_createAt, reservation_start_time, reservation_end_time, reservation_time_unit, reservation_capacity]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  // READ ALL
  static async show() {
    try {
      const sqlQuery = `SELECT * FROM reservation`;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  // READ BY ID
  static async findById(id) {
    try {
      const sqlQuery = `SELECT * FROM reservation WHERE reservation_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      return null;
    }
  }

  // UPDATE
  static async update(id, { amenity_id, user_id, status_id, tariff_id, reservation_start_time, reservation_end_time, reservation_time_unit, reservation_capacity }) {
    try {
      const sqlQuery = `UPDATE reservation SET amenity_id = ?, user_id = ?, status_id = ?, tariff_id = ?, reservation_start_time = ?, reservation_end_time = ?, reservation_time_unit = ?, reservation_capacity = ? WHERE reservation_id = ?`;
      const [result] = await connect.query(sqlQuery, [amenity_id, user_id, status_id, tariff_id, reservation_start_time, reservation_end_time, reservation_time_unit, reservation_capacity, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  // DELETE
  static async delete(id) {
    try {
      const sqlQuery = `DELETE FROM reservation WHERE reservation_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }
}

export default ReservationModel; 