import { connect } from '../config/db/connectMysql.js';

class ReservationModel {
  // ✅ CREATE
  static async create({
    amenity_id,
    user_id,
    status_id,
    reservation_start_time,
    reservation_end_time,
    reservation_capacity
  }) {
    try {
      const sqlQuery = `
        INSERT INTO reservation (
          amenity_id,
          user_id,
          status_id,
          reservation_start_time,
          reservation_end_time,
          reservation_capacity
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connect.query(sqlQuery, [
        amenity_id,
        user_id,
        status_id || null,
        reservation_start_time,
        reservation_end_time,
        reservation_capacity || null
      ]);

      return result.insertId;
    } catch (error) {
      console.error("❌ Error en ReservationModel.create:", error);
      throw error;
    }
  }

  // ✅ READ ALL
  static async show() {
    try {
      const sqlQuery = `
        SELECT 
          r.reservation_id,
          r.amenity_id,
          r.user_id,
          r.status_id,
          r.reservation_createAt,
          r.reservation_start_time,
          r.reservation_end_time,
          r.reservation_capacity,
          a.name,
          u.user_name,
          s.status_name
        FROM reservation r
        LEFT JOIN amenity a ON r.amenity_id = a.amenity_id
        LEFT JOIN user u ON r.user_id = u.user_id
        LEFT JOIN status s ON r.status_id = s.status_id
        ORDER BY r.reservation_createAt DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error("❌ Error en ReservationModel.show:", error);
      return [];
    }
  }

  // ✅ READ BY ID
  static async findById(id) {
    try {
      const sqlQuery = `
        SELECT 
          r.reservation_id,
          r.amenity_id,
          r.user_id,
          r.status_id,
          r.reservation_createAt,
          r.reservation_start_time,
          r.reservation_end_time,
          r.reservation_capacity,
          a.name,
          u.user_name,
          s.status_name
        FROM reservation r
        LEFT JOIN amenity a ON r.amenity_id = a.amenity_id
        LEFT JOIN user u ON r.user_id = u.user_id
        LEFT JOIN status s ON r.status_id = s.status_id
        WHERE r.reservation_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      console.error("❌ Error en ReservationModel.findById:", error);
      return null;
    }
  }

  // ✅ UPDATE
  static async update(
    id,
    {
      amenity_id,
      user_id,
      status_id,
      reservation_start_time,
      reservation_end_time,
      reservation_capacity
    }
  ) {
    try {
      const sqlQuery = `
        UPDATE reservation 
        SET 
          amenity_id = ?, 
          user_id = ?, 
          status_id = ?, 
          reservation_start_time = ?, 
          reservation_end_time = ?, 
          reservation_capacity = ?
        WHERE reservation_id = ?
      `;

      const [result] = await connect.query(sqlQuery, [
        amenity_id,
        user_id,
        status_id || null,
        reservation_start_time,
        reservation_end_time,
        reservation_capacity || null,
        id
      ]);

      return result.affectedRows > 0 ? await this.findById(id) : null;
    } catch (error) {
      console.error("❌ Error en ReservationModel.update:", error);
      return null;
    }
  }

  // ✅ DELETE
  static async delete(id) {
    try {
      const sqlQuery = `DELETE FROM reservation WHERE reservation_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("❌ Error en ReservationModel.delete:", error);
      return false;
    }
  }
}

export default ReservationModel;
