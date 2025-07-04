import express from 'express';
import AmenityController from '../controllers/amenity.controller.js';

const router = express.Router();

// Rutas para amenity
router.get('/', AmenityController.show);
router.get('/:id', AmenityController.findById);
router.post('/', AmenityController.register);
router.put('/:id', AmenityController.update);
router.delete('/:id', AmenityController.delete);

export default router; 