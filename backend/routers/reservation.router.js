import express from 'express';
import ReservationController from '../controllers/reservation.controller.js';

const router = express.Router();

// Rutas para reservation
router.get('/', ReservationController.getAllReservations);
router.get('/user/:user_id', ReservationController.getReservationsByUser);
router.get('/amenity/:amenity_id', ReservationController.getReservationsByAmenity);
router.get('/:id', ReservationController.getReservationById);
router.post('/', ReservationController.createReservation);
router.put('/:id', ReservationController.updateReservation);
router.delete('/:id', ReservationController.deleteReservation);

export default router; 