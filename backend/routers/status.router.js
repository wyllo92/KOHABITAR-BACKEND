import express from 'express';
import StatusController from '../controllers/status.controller.js';

const router = express.Router();

router.get('/status', StatusController.show);
router.get('/status/:id', StatusController.findById);
router.post('/status', StatusController.register);
router.put('/status/:id', StatusController.update);
router.delete('/status/:id', StatusController.delete);

export default router; 