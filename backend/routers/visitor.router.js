import express from 'express';
import VisitorController from '../controllers/visitor.controller.js';

const router = express.Router();

// Rutas para visitor
router.get('/', VisitorController.getAllVisitors);
router.get('/user/:user_id', VisitorController.getVisitorsByUser);
router.get('/:id', VisitorController.getVisitorById);
router.post('/', VisitorController.createVisitor);
router.put('/:id', VisitorController.updateVisitor);
router.delete('/:id', VisitorController.deleteVisitor);

export default router; 