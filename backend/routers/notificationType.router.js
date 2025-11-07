import { Router } from 'express';
import NotificationTypeController from '../controllers/notificationType.controller.js';

const router = Router();

router.route('/notificationType')
  .get(NotificationTypeController.show);

export default router;
