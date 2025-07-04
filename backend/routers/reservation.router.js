import express from 'express';
import ReservationController from '../controllers/reservation.controller.js';

const router = express.Router();

router.get('/reservation', ReservationController.getAllReservations);
router.get('/reservation/user/:user_id', ReservationController.getReservationsByUser);
router.get('/reservation/amenity/:amenity_id', ReservationController.getReservationsByAmenity);
router.get('/reservation/:id', ReservationController.getReservationById);
router.post('/reservation', ReservationController.createReservation);
router.put('/reservation/:id', ReservationController.updateReservation);
router.delete('/reservation/:id', ReservationController.deleteReservation);

export default router; 