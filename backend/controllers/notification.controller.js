import NotificationModel from "../models/notification.model.js";

// Crear una nueva notificación
const createNotification = async (req, res) => {
  try {
    const {
      user_id,
      property_id,
      notification_title,
      notification_message,
      status_id
    } = req.body;

    // Validar campos obligatorios
    if (
      !user_id ||
      !property_id ||
      !notification_title ||
      !notification_message ||
      !status_id
    ) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    // Datos para crear la notificación
    const data = {
      user_id,
      property_id,
      notification_title,
      notification_message,
      status_id
    };

    const result = await NotificationModel.create(data);

    res.status(201).json({
      message: "Notificación creada correctamente.",
      notification: result
    });
  } catch (error) {
    console.error("Error al crear notificación:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener todas las notificaciones
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await NotificationModel.getAll();
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener notificaciones por usuario
const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "El ID de usuario es requerido." });
    }

    const notifications = await NotificationModel.getByUser(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error al obtener notificaciones de usuario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Marcar notificación como leída
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "El ID de la notificación es requerido." });
    }

    const updated = await NotificationModel.markAsRead(id);

    if (!updated) {
      return res.status(404).json({ message: "Notificación no encontrada." });
    }

    res.status(200).json({ message: "Notificación marcada como leída." });
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Actualizar una notificación
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { notification_title, notification_message, status_id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "El ID de la notificación es requerido." });
    }

    const data = { notification_title, notification_message, status_id };

    const updated = await NotificationModel.update(id, data);

    if (!updated) {
      return res.status(404).json({ message: "Notificación no encontrada." });
    }

    res.status(200).json({ message: "Notificación actualizada correctamente." });
  } catch (error) {
    console.error("Error al actualizar notificación:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Eliminar una notificación
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "El ID de la notificación es requerido." });
    }

    const deleted = await NotificationModel.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Notificación no encontrada." });
    }

    res.status(200).json({ message: "Notificación eliminada correctamente." });
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export default {
  createNotification,
  getAllNotifications,
  getNotificationsByUser,
  markAsRead,
  updateNotification,
  deleteNotification
};