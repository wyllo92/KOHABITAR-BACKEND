import express from 'express';
import VehicleController from '../controllers/vehicle.controller.js';

const router = express.Router();

// Rutas para vehículos
router.get('/', VehicleController.getAllVehicles);
router.get('/user/:user_id', VehicleController.getVehiclesByUserId);
router.get('/property/:property_id', VehicleController.getVehiclesByPropertyId);
router.get('/type/:type', VehicleController.getVehiclesByType);
router.get('/:id', VehicleController.getVehicleById);
router.post('/', VehicleController.createVehicle);
router.put('/:id', VehicleController.updateVehicle);
router.delete('/:id', VehicleController.deleteVehicle);

export default router; 