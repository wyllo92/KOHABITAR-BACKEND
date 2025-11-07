import { Router } from "express";
import NotificationController from "../controllers/notification.controller.js";

const router = Router();
const name = "/notification"; // prefijo base opcional, depende cómo montes el router en app.js

// 📩 Crear una nueva notificación
router.post(name, NotificationController.createNotification);

// 📋 Obtener todas las notificaciones
router.get(name, NotificationController.getAllNotifications);

// 👤 Obtener notificaciones por usuario
router.get(`${name}/user/:userId`, NotificationController.getNotificationsByUser);

// ✅ Marcar una notificación como leída
router.put(`${name}/:id/read`, NotificationController.markAsRead);

// ✏️ Actualizar una notificación
router.put(`${name}/:id`, NotificationController.updateNotification);

// 🗑️ Eliminar una notificación
router.delete(`${name}/:id`, NotificationController.deleteNotification);

export default router;
