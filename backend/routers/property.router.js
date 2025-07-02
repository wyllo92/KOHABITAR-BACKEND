import express from 'express';
import PropertyController from '../controllers/property.controller.js';

const router = express.Router();

// Rutas para propiedades
router.get('/', PropertyController.getAllProperties);
router.get('/search', PropertyController.searchPropertiesByName);
router.get('/type/:type', PropertyController.getPropertiesByType);
router.get('/:id', PropertyController.getPropertyById);
router.post('/', PropertyController.createProperty);
router.put('/:id', PropertyController.updateProperty);
router.delete('/:id', PropertyController.deleteProperty);

export default router; 