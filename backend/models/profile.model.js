import { connect } from '../config/db/connectMysql.js';

class ProfileModel {

  static async create({ user_id, profile_fullName, profile_phone, profile_email, profile_photo, profile_address }) {
    const [result] = await connect.query(
      'INSERT INTO profile (user_id, profile_fullName, profile_phone, profile_email, profile_photo, profile_address) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, profile_fullName, profile_phone, profile_email, profile_photo, profile_address]
    );
    return result.insertId;
  }

  static async show() {
    const [rows] = await connect.query(
      'SELECT p.*, u.user_name, r.role_name, s.status_name FROM profile p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN role r ON u.role_id = r.role_id LEFT JOIN status s ON u.status_id = s.status_id ORDER BY p.user_id'
    );
    return rows;
  }

  static async update(user_id, { profile_fullName, profile_phone, profile_email, profile_photo, profile_address }) {
    const [result] = await connect.query(
      'UPDATE profile SET profile_fullName = ?, profile_phone = ?, profile_email = ?, profile_photo = ?, profile_address = ? WHERE user_id = ?',
      [profile_fullName, profile_phone, profile_email, profile_photo, profile_address, user_id]
    );
    return result.affectedRows > 0 ? this.findById(user_id) : null;
  }

  static async delete(user_id) {
    const [result] = await connect.query(
      'DELETE FROM profile WHERE user_id = ?',
      [user_id]
    );
    return result.affectedRows > 0;
  }

  static async findById(user_id) {
    try {
      const [rows] = await connect.query(
        'SELECT p.*, u.user_name, r.role_name, s.status_name FROM profile p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN role r ON u.role_id = r.role_id LEFT JOIN status s ON u.status_id = s.status_id WHERE p.user_id = ?',
        [user_id]
      );
      return rows[0];
    } catch (error) {
      return null;
    }
  }

  static async findByEmail(profile_email) {
    try {
      const [rows] = await connect.query(
        'SELECT p.*, u.user_name, r.role_name, s.status_name FROM profile p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN role r ON u.role_id = r.role_id LEFT JOIN status s ON u.status_id = s.status_id WHERE p.profile_email = ?',
        [profile_email]
      );
      return rows[0];
    } catch (error) {
      return null;
    }
  }

  static async showActive() {
    try {
      const [rows] = await connect.query(
        'SELECT p.*, u.user_name, r.role_name, s.status_name FROM profile p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN role r ON u.role_id = r.role_id LEFT JOIN status s ON u.status_id = s.status_id WHERE u.status_id = 1 ORDER BY p.user_id'
      );
      return rows;
    } catch (error) {
      return [];
    }
  }

  static async findByIdActive(user_id) {
    try {
      const [rows] = await connect.query(
        'SELECT p.*, u.user_name, r.role_name, s.status_name FROM profile p LEFT JOIN user u ON p.user_id = u.user_id LEFT JOIN role r ON u.role_id = r.role_id LEFT JOIN status s ON u.status_id = s.status_id WHERE p.user_id = ? AND u.status_id = 1',
        [user_id]
      );
      return rows[0];
    } catch (error) {
      return null;
    }
  }

}
export default ProfileModel;