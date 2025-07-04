import express from 'express';
import ParkingSlotController from '../controllers/parkingslot.controller.js';

const router = express.Router();

router.get('/parkingslot', ParkingSlotController.getAllParkingSlots);
router.get('/parkingslot/available', ParkingSlotController.getAvailableSlots);
router.get('/parkingslot/reserved', ParkingSlotController.getReservedSlots);
router.get('/parkingslot/zone/:parkingZone_id', ParkingSlotController.getSlotsByZone);
router.get('/parkingslot/:id', ParkingSlotController.getParkingSlotById);
router.post('/parkingslot', ParkingSlotController.createParkingSlot);
router.put('/parkingslot/:id', ParkingSlotController.updateParkingSlot);
router.delete('/parkingslot/:id', ParkingSlotController.deleteParkingSlot);

export default router;