import express from 'express';
import AmenityController from '../controllers/amenity.controller.js';

const router = express.Router();

router.get('/amenity', AmenityController.show);;
router.get('/amenity/:id', AmenityController.findById);
router.post('/amenity', AmenityController.register);
router.put('/amenity/:id', AmenityController.update);
router.delete('/amenity/:id', AmenityController.delete);

export default router;