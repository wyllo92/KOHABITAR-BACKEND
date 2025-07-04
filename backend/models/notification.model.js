import { connect } from '../config/db/connectMysql.js';

class NotificationModel {

  static async create({ User_id, Property_id, Notification_type_id, Notification_title, Notification_message, Status_id, Notification_priority, Notification_createAt, Notification_updateAt }) {
    try {
      let sqlQuery = "INSERT INTO notification (User_id, Property_id, Notification_type_id, Notification_title, Notification_message, Status_id, Notification_priority, Notification_createAt, Notification_updateAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery, [User_id, Property_id, Notification_type_id, Notification_title, Notification_message, Status_id, Notification_priority, Notification_createAt, Notification_updateAt]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT n.*, u.user_name, p.profile_fullName, prop.property_name, nt.Notification_type_name, s.status_name FROM notification n LEFT JOIN user u ON n.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON n.Property_id = prop.property_id LEFT JOIN notification_type nt ON n.Notification_type_id = nt.Notification_type_id LEFT JOIN status s ON n.Status_id = s.status_id ORDER BY n.Notification_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { User_id, Property_id, Notification_type_id, Notification_title, Notification_message, Status_id, Notification_priority, Notification_updateAt }) {
    try {
      let sqlQuery = "UPDATE notification SET User_id = ?, Property_id = ?, Notification_type_id = ?, Notification_title = ?, Notification_message = ?, Status_id = ?, Notification_priority = ?, Notification_updateAt = ? WHERE Notification_id = ?;";
      const [result] = await connect.query(sqlQuery, [User_id, Property_id, Notification_type_id, Notification_title, Notification_message, Status_id, Notification_priority, Notification_updateAt, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM notification WHERE Notification_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT n.*, u.user_name, p.profile_fullName, prop.property_name, nt.Notification_type_name, s.status_name FROM notification n LEFT JOIN user u ON n.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON n.Property_id = prop.property_id LEFT JOIN notification_type nt ON n.Notification_type_id = nt.Notification_type_id LEFT JOIN status s ON n.Status_id = s.status_id WHERE n.Notification_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByUserId(User_id) {
    try {
      let sqlQuery = 'SELECT n.*, u.user_name, p.profile_fullName, prop.property_name, nt.Notification_type_name, s.status_name FROM notification n LEFT JOIN user u ON n.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON n.Property_id = prop.property_id LEFT JOIN notification_type nt ON n.Notification_type_id = nt.Notification_type_id LEFT JOIN status s ON n.Status_id = s.status_id WHERE n.User_id = ?';
      const [result] = await connect.query(sqlQuery, [User_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByPropertyId(Property_id) {
    try {
      let sqlQuery = 'SELECT n.*, u.user_name, p.profile_fullName, prop.property_name, nt.Notification_type_name, s.status_name FROM notification n LEFT JOIN user u ON n.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON n.Property_id = prop.property_id LEFT JOIN notification_type nt ON n.Notification_type_id = nt.Notification_type_id LEFT JOIN status s ON n.Status_id = s.status_id WHERE n.Property_id = ?';
      const [result] = await connect.query(sqlQuery, [Property_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByType(Notification_type_id) {
    try {
      let sqlQuery = 'SELECT n.*, u.user_name, p.profile_fullName, prop.property_name, nt.Notification_type_name, s.status_name FROM notification n LEFT JOIN user u ON n.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON n.Property_id = prop.property_id LEFT JOIN notification_type nt ON n.Notification_type_id = nt.Notification_type_id LEFT JOIN status s ON n.Status_id = s.status_id WHERE n.Notification_type_id = ?';
      const [result] = await connect.query(sqlQuery, [Notification_type_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByStatus(Status_id) {
    try {
      let sqlQuery = 'SELECT n.*, u.user_name, p.profile_fullName, prop.property_name, nt.Notification_type_name, s.status_name FROM notification n LEFT JOIN user u ON n.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON n.Property_id = prop.property_id LEFT JOIN notification_type nt ON n.Notification_type_id = nt.Notification_type_id LEFT JOIN status s ON n.Status_id = s.status_id WHERE n.Status_id = ?';
      const [result] = await connect.query(sqlQuery, [Status_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByPriority(Notification_priority) {
    try {
      let sqlQuery = 'SELECT n.*, u.user_name, p.profile_fullName, prop.property_name, nt.Notification_type_name, s.status_name FROM notification n LEFT JOIN user u ON n.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON n.Property_id = prop.property_id LEFT JOIN notification_type nt ON n.Notification_type_id = nt.Notification_type_id LEFT JOIN status s ON n.Status_id = s.status_id WHERE n.Notification_priority = ?';
      const [result] = await connect.query(sqlQuery, [Notification_priority]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findUnread() {
    try {
      let sqlQuery = 'SELECT n.*, u.user_name, p.profile_fullName, prop.property_name, nt.Notification_type_name, s.status_name FROM notification n LEFT JOIN user u ON n.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON n.Property_id = prop.property_id LEFT JOIN notification_type nt ON n.Notification_type_id = nt.Notification_type_id LEFT JOIN status s ON n.Status_id = s.status_id WHERE n.Status_id = 3';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findHighPriority() {
    try {
      let sqlQuery = 'SELECT n.*, u.user_name, p.profile_fullName, prop.property_name, nt.Notification_type_name, s.status_name FROM notification n LEFT JOIN user u ON n.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN property prop ON n.Property_id = prop.property_id LEFT JOIN notification_type nt ON n.Notification_type_id = nt.Notification_type_id LEFT JOIN status s ON n.Status_id = s.status_id WHERE n.Notification_priority >= 3';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }
}

export default NotificationModel; 