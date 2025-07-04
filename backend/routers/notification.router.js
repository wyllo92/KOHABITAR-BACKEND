import express from 'express';
import NotificationController from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/notification', NotificationController.show);
router.get('/notification/:id', NotificationController.findById);
router.post('/notification', NotificationController.register);
router.put('/notification/:id', NotificationController.update);
router.delete('/notification/:id', NotificationController.delete);

export default router;