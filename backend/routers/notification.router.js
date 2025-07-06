import { Router } from "express";
import NotificationController from '../controllers/notification.controller.js';
const router = Router();
const name = '/notification';
// Public route

router.route(name)
    .post(NotificationController.register) // Register a new notification
    .get(NotificationController.show);// Show all notifications

router.route(`${name}/:id`)
    .get(NotificationController.findById)// Show a notification by ID
    .put(NotificationController.update)// Update a notification by ID
    .delete(NotificationController.delete);// Delete a notification by ID

export default router;