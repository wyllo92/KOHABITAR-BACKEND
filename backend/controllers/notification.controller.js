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
      return res.status(400).json({ 
        message: "Faltan campos obligatorios.",
        required: ["user_id", "property_id", "notification_title", "notification_message", "status_id"]
      });
    }

    // Validar longitud de campos
    if (notification_title.length > 100) {
      return res.status(400).json({ 
        message: "El título no puede exceder 100 caracteres." 
      });
    }

    if (notification_message.length > 500) {
      return res.status(400).json({ 
        message: "El mensaje no puede exceder 500 caracteres." 
      });
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
    
    // Manejo de errores de foreign key
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        message: "El user_id, property_id o status_id no existen en la base de datos." 
      });
    }
    
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener todas las notificaciones
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await NotificationModel.getAll();
    
    res.status(200).json({
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener una notificación por ID
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        message: "El ID de la notificación es requerido." 
      });
    }

    const notification = await NotificationModel.getById(id);

    if (!notification) {
      return res.status(404).json({ 
        message: "Notificación no encontrada." 
      });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error al obtener notificación:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener notificaciones por usuario
const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        message: "El ID de usuario es requerido." 
      });
    }

    const notifications = await NotificationModel.getByUser(userId);
    
    res.status(200).json({
      user_id: userId,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error("Error al obtener notificaciones de usuario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener notificaciones por propiedad
const getNotificationsByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({ 
        message: "El ID de la propiedad es requerido." 
      });
    }

    const notifications = await NotificationModel.getByProperty(propertyId);
    
    res.status(200).json({
      property_id: propertyId,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error("Error al obtener notificaciones de propiedad:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener notificaciones por estado
const getNotificationsByStatus = async (req, res) => {
  try {
    const { statusId } = req.params;

    if (!statusId) {
      return res.status(400).json({ 
        message: "El ID del estado es requerido." 
      });
    }

    const notifications = await NotificationModel.getByStatus(statusId);
    
    res.status(200).json({
      status_id: statusId,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error("Error al obtener notificaciones por estado:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Contar notificaciones no leídas por usuario
const countUnreadByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        message: "El ID de usuario es requerido." 
      });
    }

    const unreadCount = await NotificationModel.countUnreadByUser(userId);
    
    res.status(200).json({
      user_id: userId,
      unread_count: unreadCount
    });
  } catch (error) {
    console.error("Error al contar notificaciones no leídas:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Marcar notificación como leída
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        message: "El ID de la notificación es requerido." 
      });
    }

    const updated = await NotificationModel.markAsRead(id);

    if (!updated) {
      return res.status(404).json({ 
        message: "Notificación no encontrada." 
      });
    }

    res.status(200).json({ 
      message: "Notificación marcada como leída.",
      notification_id: id
    });
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Actualizar una notificación
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      notification_title, 
      notification_message, 
      status_id,
      property_id 
    } = req.body;

    if (!id) {
      return res.status(400).json({ 
        message: "El ID de la notificación es requerido." 
      });
    }

    // Validar que al menos un campo esté presente
    if (!notification_title && !notification_message && !status_id && !property_id) {
      return res.status(400).json({ 
        message: "Debe proporcionar al menos un campo para actualizar." 
      });
    }

    // Validar longitud de campos si están presentes
    if (notification_title && notification_title.length > 100) {
      return res.status(400).json({ 
        message: "El título no puede exceder 100 caracteres." 
      });
    }

    if (notification_message && notification_message.length > 500) {
      return res.status(400).json({ 
        message: "El mensaje no puede exceder 500 caracteres." 
      });
    }

    const data = { 
      notification_title, 
      notification_message, 
      status_id,
      property_id 
    };

    const updated = await NotificationModel.update(id, data);

    if (!updated) {
      return res.status(404).json({ 
        message: "Notificación no encontrada." 
      });
    }

    res.status(200).json({ 
      message: "Notificación actualizada correctamente.",
      notification_id: id
    });
  } catch (error) {
    console.error("Error al actualizar notificación:", error);
    
    // Manejo de errores de foreign key
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        message: "El property_id o status_id no existe en la base de datos." 
      });
    }
    
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Eliminar una notificación
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        message: "El ID de la notificación es requerido." 
      });
    }

    const deleted = await NotificationModel.delete(id);

    if (!deleted) {
      return res.status(404).json({ 
        message: "Notificación no encontrada." 
      });
    }

    res.status(200).json({ 
      message: "Notificación eliminada correctamente.",
      notification_id: id
    });
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Eliminar todas las notificaciones de un usuario
const deleteNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        message: "El ID de usuario es requerido." 
      });
    }

    const deletedCount = await NotificationModel.deleteByUser(userId);

    res.status(200).json({ 
      message: `${deletedCount} notificación(es) eliminada(s) correctamente.`,
      user_id: userId,
      deleted_count: deletedCount
    });
  } catch (error) {
    console.error("Error al eliminar notificaciones de usuario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export default {
  createNotification,
  getAllNotifications,
  getNotificationById,
  getNotificationsByUser,
  getNotificationsByProperty,
  getNotificationsByStatus,
  countUnreadByUser,
  markAsRead,
  updateNotification,
  deleteNotification,
  deleteNotificationsByUser
};