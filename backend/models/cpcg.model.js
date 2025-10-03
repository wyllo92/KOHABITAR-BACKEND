import { connect } from '../config/db/connectMysql.js';

class PqrsModel {

  static async create({ User_id, Property_id, CPCG_type_id, CPCG_description, Status_id }) {
    const [result] = await connect.query(
      'INSERT INTO cpcg (User_id, Property_id, CPCG_type_id, CPCG_description, Status_id) VALUES (?, ?, ?, ?, ?)',
      [User_id, Property_id, CPCG_type_id, CPCG_description, Status_id]
    );
    return result.insertId;
  }

  static async show() {
    const [rows] = await connect.query(
      `SELECT 
        c.*, 
        u.user_name, 
        p.property_name,
        ct.CPCG_type_name,
        s.status_name 
      FROM cpcg c 
      LEFT JOIN user u ON c.User_id = u.user_id 
      LEFT JOIN property p ON c.Property_id = p.property_id 
      LEFT JOIN cpcg_type ct ON c.CPCG_type_id = ct.CPCG_type_id 
      LEFT JOIN status s ON c.Status_id = s.status_id 
      ORDER BY c.CPCG_createAt DESC`
    );
    return rows;
  }

  static async showActive() {
    const [rows] = await connect.query(
      `SELECT 
        c.*, 
        u.user_name, 
        p.property_name,
        ct.CPCG_type_name,
        s.status_name 
      FROM cpcg c 
      LEFT JOIN user u ON c.User_id = u.user_id 
      LEFT JOIN property p ON c.Property_id = p.property_id 
      LEFT JOIN cpcg_type ct ON c.CPCG_type_id = ct.CPCG_type_id 
      LEFT JOIN status s ON c.Status_id = s.status_id 
      WHERE c.Status_id != 3
      ORDER BY c.CPCG_createAt DESC`
    );
    return rows;
  }

  static async update(id, { User_id, Property_id, CPCG_type_id, CPCG_description, Status_id }) {
    const [result] = await connect.query(
      'UPDATE cpcg SET User_id = ?, Property_id = ?, CPCG_type_id = ?, CPCG_description = ?, Status_id = ? WHERE CPCG_id = ?',
      [User_id, Property_id, CPCG_type_id, CPCG_description, Status_id, id]
    );
    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async delete(id) {
    // Soft delete - cambiar status a eliminado (asumiendo que status_id = 3 es eliminado)
    const [result] = await connect.query(
      'UPDATE cpcg SET Status_id = 3 WHERE CPCG_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async hardDelete(id) {
    // Hard delete - eliminar completamente del registro
    const [result] = await connect.query(
      'DELETE FROM cpcg WHERE CPCG_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async findById(id) {
    const [rows] = await connect.query(
      `SELECT 
        c.*, 
        u.user_name, 
        p.property_name,
        ct.CPCG_type_name,
        s.status_name 
      FROM cpcg c 
      LEFT JOIN user u ON c.User_id = u.user_id 
      LEFT JOIN property p ON c.Property_id = p.property_id 
      LEFT JOIN cpcg_type ct ON c.CPCG_type_id = ct.CPCG_type_id 
      LEFT JOIN status s ON c.Status_id = s.status_id 
      WHERE c.CPCG_id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByIdActive(id) {
    const [rows] = await connect.query(
      `SELECT 
        c.*, 
        u.user_name, 
        p.property_name,
        ct.CPCG_type_name,
        s.status_name 
      FROM cpcg c 
      LEFT JOIN user u ON c.User_id = u.user_id 
      LEFT JOIN property p ON c.Property_id = p.property_id 
      LEFT JOIN cpcg_type ct ON c.CPCG_type_id = ct.CPCG_type_id 
      LEFT JOIN status s ON c.Status_id = s.status_id 
      WHERE c.CPCG_id = ? AND c.Status_id != 3`,
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await connect.query(
      `SELECT 
        c.*, 
        u.user_name, 
        p.property_name,
        ct.CPCG_type_name,
        s.status_name 
      FROM cpcg c 
      LEFT JOIN user u ON c.User_id = u.user_id 
      LEFT JOIN property p ON c.Property_id = p.property_id 
      LEFT JOIN cpcg_type ct ON c.CPCG_type_id = ct.CPCG_type_id 
      LEFT JOIN status s ON c.Status_id = s.status_id 
      WHERE c.User_id = ? AND c.Status_id != 3
      ORDER BY c.CPCG_createAt DESC`,
      [userId]
    );
    return rows;
  }

  static async findByPropertyId(propertyId) {
    const [rows] = await connect.query(
      `SELECT 
        c.*, 
        u.user_name, 
        p.property_name,
        ct.CPCG_type_name,
        s.status_name 
      FROM cpcg c 
      LEFT JOIN user u ON c.User_id = u.user_id 
      LEFT JOIN property p ON c.Property_id = p.property_id 
      LEFT JOIN cpcg_type ct ON c.CPCG_type_id = ct.CPCG_type_id 
      LEFT JOIN status s ON c.Status_id = s.status_id 
      WHERE c.Property_id = ? AND c.Status_id != 3
      ORDER BY c.CPCG_createAt DESC`,
      [propertyId]
    );
    return rows;
  }

  static async findByType(typeId) {
    const [rows] = await connect.query(
      `SELECT 
        c.*, 
        u.user_name, 
        p.property_name,
        ct.CPCG_type_name,
        s.status_name 
      FROM cpcg c 
      LEFT JOIN user u ON c.User_id = u.user_id 
      LEFT JOIN property p ON c.Property_id = p.property_id 
      LEFT JOIN cpcg_type ct ON c.CPCG_type_id = ct.CPCG_type_id 
      LEFT JOIN status s ON c.Status_id = s.status_id 
      WHERE c.CPCG_type_id = ? AND c.Status_id != 3
      ORDER BY c.CPCG_createAt DESC`,
      [typeId]
    );
    return rows;
  }

  static async findByStatus(statusId) {
    const [rows] = await connect.query(
      `SELECT 
        c.*, 
        u.user_name, 
        p.property_name,
        ct.CPCG_type_name,
        s.status_name 
      FROM cpcg c 
      LEFT JOIN user u ON c.User_id = u.user_id 
      LEFT JOIN property p ON c.Property_id = p.property_id 
      LEFT JOIN cpcg_type ct ON c.CPCG_type_id = ct.CPCG_type_id 
      LEFT JOIN status s ON c.Status_id = s.status_id 
      WHERE c.Status_id = ?
      ORDER BY c.CPCG_createAt DESC`,
      [statusId]
    );
    return rows;
  }

  static async updateStatus(id, statusId) {
    const [result] = await connect.query(
      'UPDATE cpcg SET Status_id = ? WHERE CPCG_id = ?',
      [statusId, id]
    );
    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async getStatistics() {
    const [rows] = await connect.query(
      `SELECT 
        COUNT(*) as total_pqrs,
        SUM(CASE WHEN Status_id = 1 THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN Status_id = 2 THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN Status_id = 4 THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN Status_id = 3 THEN 1 ELSE 0 END) as deleted
      FROM cpcg`
    );
    return rows[0];
  }

  static async getRecentPqrs(limit = 10) {
    const [rows] = await connect.query(
      `SELECT 
        c.*, 
        u.user_name, 
        p.property_name,
        ct.CPCG_type_name,
        s.status_name 
      FROM cpcg c 
      LEFT JOIN user u ON c.User_id = u.user_id 
      LEFT JOIN property p ON c.Property_id = p.property_id 
      LEFT JOIN cpcg_type ct ON c.CPCG_type_id = ct.CPCG_type_id 
      LEFT JOIN status s ON c.Status_id = s.status_id 
      WHERE c.Status_id != 3
      ORDER BY c.CPCG_createAt DESC 
      LIMIT ?`,
      [limit]
    );
    return rows;
  }

  static async searchByDescription(searchTerm) {
    const [rows] = await connect.query(
      `SELECT 
        c.*, 
        u.user_name, 
        p.property_name,
        ct.CPCG_type_name,
        s.status_name 
      FROM cpcg c 
      LEFT JOIN user u ON c.User_id = u.user_id 
      LEFT JOIN property p ON c.Property_id = p.property_id 
      LEFT JOIN cpcg_type ct ON c.CPCG_type_id = ct.CPCG_type_id 
      LEFT JOIN status s ON c.Status_id = s.status_id 
      WHERE c.CPCG_description LIKE ? AND c.Status_id != 3
      ORDER BY c.CPCG_createAt DESC`,
      [`%${searchTerm}%`]
    );
    return rows;
  }

}

export default PqrsModel;