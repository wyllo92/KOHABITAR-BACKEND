import express from 'express';
import StatusController from '../controllers/status.controller.js';

const router = express.Router();

// CRUD básico
router.get('/status', StatusController.show);
router.get('/status/:id', StatusController.findById);
router.post('/status', StatusController.register);
router.put('/status/:id', StatusController.update);
router.delete('/status/:id', StatusController.delete);

// 🔹 Nuevo endpoint: traer estados por entidad (ej: usuarios, pedidos, etc.)
router.get('/status/entity/:entity', StatusController.findByEntity);

export default router;
