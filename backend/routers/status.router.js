import express from 'express';
import StatusController from '../controllers/status.controller.js';

const router = express.Router();

// Rutas para status
router.get('/', StatusController.getAllStatus);
router.get('/entity/:entity', StatusController.getStatusByEntity);
router.get('/:id', StatusController.getStatusById);
router.post('/', StatusController.createStatus);
router.put('/:id', StatusController.updateStatus);
router.delete('/:id', StatusController.deleteStatus);

export default router; 