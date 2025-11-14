import { connect } from '../config/db/connectMysql.js';

const NotificationModel = {
  // Obtener todas las notificaciones
  async getAll() {
    const [rows] = await connect.query(`
      SELECT 
        n.notification_id,
        n.user_id,
        n.property_id,
        n.notification_title,
        n.notification_message,
        n.status_id,
        n.notification_created_at,
        n.notification_updated_at,
        u.user_name, 
        p.property_name, 
        s.status_name
      FROM notification n
      INNER JOIN user u ON n.user_id = u.user_id
      INNER JOIN property p ON n.property_id = p.property_id
      INNER JOIN status s ON n.status_id = s.status_id
      ORDER BY n.notification_created_at DESC
    `);
    return rows;
  },

  // Obtener una notificación por ID
  async getById(notificationId) {
    const [rows] = await connect.query(
      `
      SELECT 
        n.notification_id,
        n.user_id,
        n.property_id,
        n.notification_title,
        n.notification_message,
        n.status_id,
        n.notification_created_at,
        n.notification_updated_at,
        u.user_name,
        p.property_name,
        s.status_name
      FROM notification n
      INNER JOIN user u ON n.user_id = u.user_id
      INNER JOIN property p ON n.property_id = p.property_id
      INNER JOIN status s ON n.status_id = s.status_id
      WHERE n.notification_id = ?
      `,
      [notificationId]
    );
    return rows[0] || null;
  },

  // Obtener notificaciones por usuario
  async getByUser(userId) {
    const [rows] = await connect.query(
      `
      SELECT 
        n.notification_id,
        n.user_id,
        n.property_id,
        n.notification_title,
        n.notification_message,
        n.status_id,
        n.notification_created_at,
        n.notification_updated_at,
        p.property_name,
        s.status_name
      FROM notification n
      INNER JOIN property p ON n.property_id = p.property_id
      INNER JOIN status s ON n.status_id = s.status_id
      WHERE n.user_id = ?
      ORDER BY n.notification_created_at DESC
      `,
      [userId]
    );
    return rows;
  },

  // Obtener notificaciones por propiedad
  async getByProperty(propertyId) {
    const [rows] = await connect.query(
      `
      SELECT 
        n.notification_id,
        n.user_id,
        n.property_id,
        n.notification_title,
        n.notification_message,
        n.status_id,
        n.notification_created_at,
        n.notification_updated_at,
        u.user_name,
        s.status_name
      FROM notification n
      INNER JOIN user u ON n.user_id = u.user_id
      INNER JOIN status s ON n.status_id = s.status_id
      WHERE n.property_id = ?
      ORDER BY n.notification_created_at DESC
      `,
      [propertyId]
    );
    return rows;
  },

  // Obtener notificaciones por estado
  async getByStatus(statusId) {
    const [rows] = await connect.query(
      `
      SELECT 
        n.notification_id,
        n.user_id,
        n.property_id,
        n.notification_title,
        n.notification_message,
        n.status_id,
        n.notification_created_at,
        n.notification_updated_at,
        u.user_name,
        p.property_name,
        s.status_name
      FROM notification n
      INNER JOIN user u ON n.user_id = u.user_id
      INNER JOIN property p ON n.property_id = p.property_id
      INNER JOIN status s ON n.status_id = s.status_id
      WHERE n.status_id = ?
      ORDER BY n.notification_created_at DESC
      `,
      [statusId]
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

    return { 
      notification_id: result.insertId, 
      ...data,
      notification_created_at: new Date(),
      notification_updated_at: new Date()
    };
  },

  // Marcar notificación como leída (asumiendo que status_id = 2 es "leída")
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
    if (data.property_id !== undefined) {
      fields.push('property_id = ?');
      values.push(data.property_id);
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
  },

  // Eliminar todas las notificaciones de un usuario
  async deleteByUser(userId) {
    const [result] = await connect.query(
      `DELETE FROM notification WHERE user_id = ?`,
      [userId]
    );
    return result.affectedRows;
  },

  // Contar notificaciones no leídas por usuario
  async countUnreadByUser(userId, unreadStatusId = 1) {
    const [rows] = await connect.query(
      `
      SELECT COUNT(*) as unread_count
      FROM notification
      WHERE user_id = ? AND status_id = ?
      `,
      [userId, unreadStatusId]
    );
    return rows[0].unread_count;
  }
};

export default NotificationModel;