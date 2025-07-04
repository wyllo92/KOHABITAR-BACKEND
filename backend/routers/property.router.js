import express from 'express';
import PropertyController from '../controllers/property.controller.js';

const router = express.Router();

router.get('/property', PropertyController.show);
router.get('/property/search', PropertyController.searchPropertiesByName);
router.get('/property/type/:type', PropertyController.getPropertiesByType);
router.get('/property/:id', PropertyController.findById);
router.post('/property', PropertyController.register);
router.put('/property/:id', PropertyController.update);
router.delete('/property/:id', PropertyController.delete);

export default router;