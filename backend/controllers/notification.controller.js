
import NotificationModel from "../models/notification.model.js";


const createNotification = async (req, res) => {
  try {
    const {
      User_id,
      Property_id,
      Notification_type_id,
      Notification_title,
      Notification_message,
      Status_id,
      Notification_priority,
    } = req.body;

    // 🧩 Validación básica
    if (
      !User_id ||
      !Property_id ||
      !Notification_type_id ||
      !Notification_title ||
      !Notification_message
    ) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    const data = {
      User_id,
      Property_id,
      Notification_type_id,
      Notification_title,
      Notification_message,
      Status_id: Status_id || 1, // Estado inicial
      Notification_priority: Notification_priority || 3, // Prioridad por defecto
    };

    const result = await NotificationModel.create(data);

    res.status(201).json({
      message: "Notificación creada correctamente.",
      notification: result,
    });
  } catch (error) {
    console.error("❌ Error al crear notificación:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const notifications = await NotificationModel.getAll();
    res.status(200).json(notifications);
  } catch (error) {
    console.error("❌ Error al obtener notificaciones:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};


const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await NotificationModel.getByUser(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("❌ Error al obtener notificaciones de usuario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};


const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await NotificationModel.markAsRead(id);

    if (!updated) {
      return res.status(404).json({ message: "Notificación no encontrada." });
    }

    res.status(200).json({ message: "Notificación marcada como leída." });
  } catch (error) {
    console.error("❌ Error al marcar como leída:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};


const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await NotificationModel.update(id, data);

    if (!updated) {
      return res.status(404).json({ message: "Notificación no encontrada." });
    }

    res.status(200).json({ message: "Notificación actualizada correctamente." });
  } catch (error) {
    console.error("❌ Error al actualizar notificación:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};


const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await NotificationModel.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Notificación no encontrada." });
    }

    res.status(200).json({ message: "Notificación eliminada correctamente." });
  } catch (error) {
    console.error("❌ Error al eliminar notificación:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};


export default {
  createNotification,
  getAllNotifications,
  getNotificationsByUser,
  markAsRead,
  updateNotification,
  deleteNotification,
};
