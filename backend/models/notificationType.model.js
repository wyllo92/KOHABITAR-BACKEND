import { connect } from '../config/db/connectMysql.js';

class NotificationTypeModel {
  static async findActive() {
    const [rows] = await connect.query(
      'SELECT Notification_type_id, Notification_type_name FROM notification_type WHERE Notification_type_is_active = 1 ORDER BY Notification_type_name'
    );
    return rows;
  }
}

export default NotificationTypeModel;
