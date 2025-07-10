import { connect } from '../config/db/connectMysql.js';

class UserModel {

  static async create({ user_name, user_password, role_id, status_id }) {
    const [result] = await connect.query(
      'INSERT INTO user (user_name, user_password, role_id, status_id) VALUES (?, ?, ?, ?)',
      [user_name, user_password, role_id, status_id]
    );
    return result.insertId;
  }

  static async show() {
    const [rows] = await connect.query(
      `SELECT 
        u.user_id,
        u.user_name,
        p.profile_phone,
        p.profile_email,
        r.role_name, 
        s.status_name 
      FROM user u 
      LEFT JOIN profile p ON u.user_id = p.user_id 
      LEFT JOIN role r ON u.role_id = r.role_id 
      LEFT JOIN status s ON u.status_id = s.status_id 
      ORDER BY u.user_id`
    );
    return rows;
  }

  static async showActive() {
    const [rows] = await connect.query(
      `SELECT 
        u.user_id,
        u.user_name,
        p.profile_phone,
        p.profile_email,
        r.role_name, 
        s.status_name 
      FROM user u 
      LEFT JOIN profile p ON u.user_id = p.user_id 
      LEFT JOIN role r ON u.role_id = r.role_id 
      LEFT JOIN status s ON u.status_id = s.status_id 
      WHERE u.status_id = 1 
      ORDER BY u.user_id`
    );
    return rows;
  }

  static async update(id, { user_name, user_password, role_id, status_id }) {
    const [result] = await connect.query(
      'UPDATE user SET user_name = ?, user_password = ?, role_id = ?, status_id = ? WHERE user_id = ?',
      [user_name, user_password, role_id, status_id, id]
    );
    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async delete(id) {
    const [result] = await connect.query(
      'DELETE FROM user WHERE user_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async findById(id) {
    const [rows] = await connect.query(
      `SELECT 
        u.user_id,
        u.user_name,
        u.role_id,
        u.status_id,
        u.user_password,
        p.profile_phone,
        p.profile_email,
        r.role_name, 
        s.status_name 
      FROM user u 
      LEFT JOIN profile p ON u.user_id = p.user_id 
      LEFT JOIN role r ON u.role_id = r.role_id 
      LEFT JOIN status s ON u.status_id = s.status_id 
      WHERE u.user_id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByIdActive(id) {
    const [rows] = await connect.query(
      `SELECT 
        u.user_id,
        u.user_name,
        u.user_password,
        p.profile_phone,
        p.profile_email,
        r.role_name, 
        s.status_name 
      FROM user u 
      LEFT JOIN profile p ON u.user_id = p.user_id 
      LEFT JOIN role r ON u.role_id = r.role_id 
      LEFT JOIN status s ON u.status_id = s.status_id 
      WHERE u.user_id = ? AND u.status_id = 1`,
      [id]
    );
    return rows[0];
  }

  static async findByName(user_name) {
    const [rows] = await connect.query(
      `SELECT 
        u.user_id,
        u.user_name,
        u.user_password,
        p.profile_phone,
        p.profile_email,
        r.role_name, 
        s.status_name 
      FROM user u 
      LEFT JOIN profile p ON u.user_id = p.user_id 
      LEFT JOIN role r ON u.role_id = r.role_id 
      LEFT JOIN status s ON u.status_id = s.status_id 
      WHERE u.user_name = ?`,
      [user_name]
    );
    return rows[0];
  }

  static async updateLogin(id) {
    const [result] = await connect.query(
      'UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
      [id]
    );
    return result.affectedRows > 0 ? this.findById(id) : null;
  }

}
export default UserModel;