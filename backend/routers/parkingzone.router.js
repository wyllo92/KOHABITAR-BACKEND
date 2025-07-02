import express from 'express';
import ParkingZoneController from '../controllers/parkingzone.controller.js';

const router = express.Router();

// Rutas para parkingzone
router.get('/', ParkingZoneController.getAllParkingZones);
router.get('/:id', ParkingZoneController.getParkingZoneById);
router.post('/', ParkingZoneController.createParkingZone);
router.put('/:id', ParkingZoneController.updateParkingZone);
router.delete('/:id', ParkingZoneController.deleteParkingZone);

export default router; 