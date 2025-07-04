import express from 'express';
import ParkingZoneController from '../controllers/parkingzone.controller.js';

const router = express.Router();


router.get('/parkingzone', ParkingZoneController.getAllParkingZones);
router.get('/parkingzone/:id', ParkingZoneController.getParkingZoneById);
router.post('/parkingzone', ParkingZoneController.createParkingZone);
router.put('/parkingzone/:id', ParkingZoneController.updateParkingZone);
router.delete('/parkingzone/:id', ParkingZoneController.deleteParkingZone);

export default router;