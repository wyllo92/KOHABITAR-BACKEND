import express from 'express';
import VisitorController from '../controllers/visitor.controller.js';

const router = express.Router();

router.get('/visitor', VisitorController.show);
router.get('/visitor/:id', VisitorController.findById);
router.post('/visitor', VisitorController.register);
router.put('/visitor/:id', VisitorController.update);
router.delete('/visitor/:id', VisitorController.delete);

export default router;