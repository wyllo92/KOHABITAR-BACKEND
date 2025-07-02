import express from 'express';
import ParkingSlotController from '../controllers/parkingslot.controller.js';

const router = express.Router();

// Rutas para parkingslot
router.get('/', ParkingSlotController.getAllParkingSlots);
router.get('/available', ParkingSlotController.getAvailableSlots);
router.get('/reserved', ParkingSlotController.getReservedSlots);
router.get('/zone/:parkingZone_id', ParkingSlotController.getSlotsByZone);
router.get('/:id', ParkingSlotController.getParkingSlotById);
router.post('/', ParkingSlotController.createParkingSlot);
router.put('/:id', ParkingSlotController.updateParkingSlot);
router.delete('/:id', ParkingSlotController.deleteParkingSlot);

export default router; 