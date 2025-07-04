import express from 'express';
import VisitorController from '../controllers/visitor.controller.js';

const router = express.Router();

// Rutas para visitor
router.get('/', VisitorController.show);
router.get('/:id', VisitorController.findById);
router.post('/', VisitorController.register);
router.put('/:id', VisitorController.update);
router.delete('/:id', VisitorController.delete);

export default router; 