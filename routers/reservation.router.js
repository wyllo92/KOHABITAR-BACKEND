import express from 'express';
import ReservationController from '../controllers/reservation.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Router para gestionar las rutas relacionadas con reservas.
 * Definir las rutas para crear, obtener, actualizar, eliminar y cancelar reservas,
 * así como para obtener reservas por diferentes criterios como usuario, zona común o reservas próximas.
 */
const router = express.Router();

/**
 * Aplica verificación de token para todas las rutas de reservas.
 * Esto asegura que solo los usuarios autenticados puedan acceder a estas rutas.
 */
router.use(verifyToken);

/**
 * Definir la ruta para obtener todas las reservas.
 * GET: Obtener la lista completa de reservas
 */
router.get('/reservations', ReservationController.getAll);

/**
 * Definir la ruta para obtener reservas próximas.
 * Esta ruta debe estar antes de la ruta /:id para evitar conflictos.
 * GET: Obtener las reservas futuras con estado activo
 */
router.get('/reservations/upcoming', ReservationController.getUpcoming);

/**
 * Definir la ruta para obtener reservas por usuario.
 * Esta ruta debe estar antes de la ruta /:id para evitar conflictos.
 * GET: Obtener las reservas realizadas por un usuario específico
 */
router.get('/reservations/user/:user_id', ReservationController.getByUser);

/**
 * Definir la ruta para obtener reservas por zona común.
 * Esta ruta debe estar antes de la ruta /:id para evitar conflictos.
 * GET: Obtener las reservas asociadas a una zona común específica
 */
router.get('/reservations/amenity/:amenity_id', ReservationController.getByAmenity);

/**
 * Definir la ruta para obtener una reserva específica por ID.
 * Esta ruta debe estar después de las rutas específicas para evitar conflictos.
 * GET: Obtener una reserva por su ID
 */
router.get('/reservations/:id', ReservationController.getById);

/**
 * Definir la ruta para crear nuevas reservas.
 * POST: Crear una nueva reserva con los datos proporcionados
 */
router.post('/reservations', ReservationController.create);

/**
 * Definir la ruta para actualizar una reserva existente.
 * PUT: Actualiza los datos de una reserva existente
 */
router.put('/reservations/:id', ReservationController.update);

/**
 * Definir la ruta para cancelar una reserva.
 * Esta es una operación específica que cambia el estado de la reserva a cancelado.
 * PUT: Cancela una reserva existente
 */
router.put('/reservations/:id/cancel', ReservationController.cancel);

/**
 * Definir la ruta para eliminar una reserva.
 * DELETE: Elimina una reserva existente del sistema
 */
router.delete('/reservations/:id', ReservationController.delete);

export default router; 