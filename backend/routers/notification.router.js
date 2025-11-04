import { Router } from "express";
import NotificationController from '../controllers/notification.controller.js';
const router = Router();

// Obtener todas las notificaciones
router.get("/", NotificationController.getAllNotifications);

// Obtener notificaciones por usuario
router.get("/user/:userId", NotificationController.getNotificationsByUser);

// Crear una nueva notificación
router.post("/", NotificationController.createNotification);

// Marcar una notificación como leída
router.put("/:id/read", NotificationController.markAsRead);

// Actualizar una notificación (por ejemplo, cambiar título, mensaje o prioridad)
router.put("/:id", NotificationController.updateNotification);

// Eliminar una notificación
router.delete("/:id", NotificationController.deleteNotification);

export default router;