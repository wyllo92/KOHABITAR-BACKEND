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
    try {
      const [rows] = await connect.query(
        'SELECT * FROM profile ORDER BY user_id'
      );
      return rows;
    } catch (error) {
      console.error('Error en show profile:', error);
      return [];
    }
  }

  static async update(user_id, { profile_fullName, profile_phone, profile_email, profile_photo, profile_address }) {
    const [result] = await connect.query(
      'UPDATE profile SET profile_fullName = ?, profile_phone = ?, profile_email = ?, profile_photo = ?, profile_address = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
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
        'SELECT * FROM profile WHERE user_id = ?',
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
        'SELECT * FROM profile WHERE profile_email = ?',
        [profile_email]
      );
      return rows[0];
    } catch (error) {
      return null;
    }
  }
}
export default ProfileModel;