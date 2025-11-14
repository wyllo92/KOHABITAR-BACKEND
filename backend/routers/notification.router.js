import { Router } from "express";
import NotificationController from "../controllers/notification.controller.js";

const router = Router();
const name = "/notification";

router.post(name, NotificationController.createNotification);

router.get(name, NotificationController.getAllNotifications);

router.get(`${name}/user/:userId`, NotificationController.getNotificationsByUser);

router.get(`${name}/:id`, NotificationController.getNotificationById);

router.get(`${name}/user/:userId/unread`, NotificationController.countUnreadByUser);

router.put(`${name}/:id/read`, NotificationController.markAsRead);

router.put(`${name}/:id`, NotificationController.updateNotification);

router.delete(`${name}/:id`, NotificationController.deleteNotification);

export default router;
