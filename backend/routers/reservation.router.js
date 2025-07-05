import express from 'express';
import ReservationController from '../controllers/reservation.controller.js';

const router = express.Router();



router.get('/reservation', ReservationController.getAll);
router.get('/reservation/:id', ReservationController.getById);
router.post('/reservation', ReservationController.create);
router.put('/reservation/:id', ReservationController.update);
router.delete('/reservation/:id', ReservationController.delete);

export default router; 