import express from 'express';
import AmenityController from '../controllers/amenity.controller.js';

const router = express.Router();

// Rutas para amenity
router.get('/', AmenityController.getAllAmenities);
router.get('/:id', AmenityController.getAmenityById);
router.post('/', AmenityController.createAmenity);
router.put('/:id', AmenityController.updateAmenity);
router.delete('/:id', AmenityController.deleteAmenity);

export default router; 