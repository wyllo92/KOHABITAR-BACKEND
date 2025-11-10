import { connect } from '../config/db/connectMysql.js';

const NotificationModel = {
  // Obtener todas las notificaciones
  async getAll() {
    const [rows] = await connect.query(`
      SELECT 
        n.*,
        u.user_name, 
        p.property_name, 
        s.status_name
      FROM notification n
      JOIN user u ON n.user_id = u.user_id
      JOIN property p ON n.property_id = p.property_id
      JOIN status s ON n.status_id = s.status_id
      ORDER BY n.notification_created_at DESC
    `);
    return rows;
  },

  // Obtener notificaciones por usuario
  async getByUser(userId) {
    const [rows] = await connect.query(
      `
      SELECT 
        n.*, 
        s.status_name,
        p.property_name
      FROM notification n
      JOIN status s ON n.status_id = s.status_id
      JOIN property p ON n.property_id = p.property_id
      WHERE n.user_id = ?
      ORDER BY n.notification_created_at DESC
      `,
      [userId]
    );
    return rows;
  },

  // Crear una nueva notificación
  async create(data) {
    const {
      user_id,
      property_id,
      notification_title,
      notification_message,
      status_id
    } = data;

    const [result] = await connect.query(
      `
      INSERT INTO notification 
      (user_id, property_id, notification_title, notification_message, status_id)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        user_id,
        property_id,
        notification_title,
        notification_message,
        status_id
      ]
    );

    return { notification_id: result.insertId, ...data };
  },

  // Marcar notificación como leída
  async markAsRead(notificationId) {
    const [result] = await connect.query(
      `
      UPDATE notification 
      SET status_id = 2
      WHERE notification_id = ?
      `,
      [notificationId]
    );
    return result.affectedRows > 0;
  },

  // Actualizar notificación
  async update(notificationId, data) {
    const fields = [];
    const values = [];

    if (data.notification_title !== undefined) {
      fields.push('notification_title = ?');
      values.push(data.notification_title);
    }
    if (data.notification_message !== undefined) {
      fields.push('notification_message = ?');
      values.push(data.notification_message);
    }
    if (data.status_id !== undefined) {
      fields.push('status_id = ?');
      values.push(data.status_id);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(notificationId);

    const [result] = await connect.query(
      `
      UPDATE notification 
      SET ${fields.join(', ')}
      WHERE notification_id = ?
      `,
      values
    );
    return result.affectedRows > 0;
  },

  // Eliminar notificación
  async delete(notificationId) {
    const [result] = await connect.query(
      `DELETE FROM notification WHERE notification_id = ?`,
      [notificationId]
    );
    return result.affectedRows > 0;
  }
};

export default NotificationModel;