import { connect } from '../config/db/connectMysql.js';

const NotificationModel = {
  // Obtener todas las notificaciones
  async getAll() {
    const [rows] = await connect.query(`
      SELECT n.*, u.username, p.property_name, s.status_name, nt.notification_type_name
      FROM notification n
      JOIN user u ON n.User_id = u.user_id
      JOIN property p ON n.Property_id = p.property_id
      JOIN status s ON n.Status_id = s.status_id
      JOIN notification_type nt ON n.Notification_type_id = nt.Notification_type_id
      ORDER BY n.Notification_createAt DESC
    `);
    return rows;
  },

  // Obtener notificaciones por usuario
  async getByUser(userId) {
    const [rows] = await connect.query(
      `
      SELECT n.*, nt.notification_type_name, s.status_name
      FROM notification n
      JOIN notification_type nt ON n.Notification_type_id = nt.Notification_type_id
      JOIN status s ON n.Status_id = s.status_id
      WHERE n.User_id = ?
      ORDER BY n.Notification_createAt DESC
      `,
      [userId]
    );
    return rows;
  },

  // Crear una nueva notificación
  async create(data) {
    const {
      User_id,
      Property_id,
      Notification_type_id,
      Notification_title,
      Notification_message,
      Status_id,
      Notification_priority,
    } = data;

    const [result] = await connect.query(
      `
      INSERT INTO notification 
      (User_id, Property_id, Notification_type_id, Notification_title, Notification_message, Status_id, Notification_priority)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        User_id,
        Property_id,
        Notification_type_id,
        Notification_title,
        Notification_message,
        Status_id,
        Notification_priority,
      ]
    );

    return { id: result.insertId, ...data }; // 🔹 Retorna el ID y los datos
  },

  // Marcar notificación como leída
  async markAsRead(notificationId) {
    const [result] = await connect.query(
      `UPDATE notification SET Status_id = 2, Notification_updateAt = NOW() WHERE Notification_id = ?`,
      [notificationId]
    );
    return result.affectedRows > 0;
  },

  // Actualizar notificación
  async update(notificationId, data) {
    const [result] = await connect.query(
      `
      UPDATE notification 
      SET 
        Notification_title = ?, 
        Notification_message = ?, 
        Notification_priority = ?, 
        Status_id = ?, 
        Notification_updateAt = NOW()
      WHERE Notification_id = ?
      `,
      [
        data.Notification_title,
        data.Notification_message,
        data.Notification_priority,
        data.Status_id,
        notificationId,
      ]
    );
    return result.affectedRows > 0;
  },

  // Eliminar notificación
  async delete(notificationId) {
    const [result] = await connect.query(
      `DELETE FROM notification WHERE Notification_id = ?`,
      [notificationId]
    );
    return result.affectedRows > 0;
  },
};

export default NotificationModel;
