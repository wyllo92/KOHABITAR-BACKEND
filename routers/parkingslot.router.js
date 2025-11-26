import express from 'express';
import ParkingSlotController from '../controllers/parkingslot.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * El router gestiona las rutas relacionadas con los espacios de parqueo.
 * El sistema define las rutas para realizar operaciones CRUD y consultas especializadas
 * sobre los espacios de parqueo del sistema.
 */
const router = express.Router();
const basePath = '/parking-slots';

/**
 * El sistema aplica protección a todas las rutas con el middleware verifyToken que
 * valida la autenticación del usuario antes de permitir el acceso.
 */

/**
 * El sistema define ruta para obtener todos los espacios de parqueo.
 * GET /parking-slots - Retorna la lista completa de espacios de parqueo.
 */
router.get(basePath, verifyToken, ParkingSlotController.getAllParkingSlots);

/**
 * El sistema define ruta para obtener los espacios de parqueo disponibles (no reservados).
 * GET /parking-slots/available - Retorna los espacios con estado activo y no reservados.
 */
router.get(`${basePath}/available`, verifyToken, ParkingSlotController.getAvailableSlots);

/**
 * El sistema define ruta para obtener los espacios de parqueo que están reservados.
 * GET /parking-slots/reserved - Retorna los espacios con estado de reserva.
 */
router.get(`${basePath}/reserved`, verifyToken, ParkingSlotController.getReservedSlots);

/**
 * El sistema define ruta para obtener los espacios de parqueo por zona.
 * GET /parking-slots/zone/:parking_zone_id - Retorna los espacios asociados a una zona específica.
 * @param {string} parking_zone_id - ID de la zona de parqueo
 */
router.get(`${basePath}/zone/:parking_zone_id`, verifyToken, ParkingSlotController.getSlotsByZone);

/**
 * El sistema define ruta para obtener los espacios de parqueo por propiedad.
 * GET /parking-slots/property/:property_id - Retorna los espacios asociados a una propiedad específica.
 * @param {string} property_id - ID de la propiedad
 */
router.get(`${basePath}/property/:property_id`, verifyToken, ParkingSlotController.getSlotsByProperty);

/**
 * El sistema define ruta para obtener un espacio de parqueo específico.
 * GET /parking-slots/:id - Retorna los detalles de un espacio de parqueo por su ID.
 * @param {string} id - ID del espacio de parqueo
 */
router.get(`${basePath}/:id`, verifyToken, ParkingSlotController.getParkingSlotById);

/**
 * El sistema define ruta para crear un nuevo espacio de parqueo.
 * POST /parking-slots - Crear un nuevo espacio con los datos proporcionados en el cuerpo de la petición.
 */
router.post(basePath, verifyToken, ParkingSlotController.createParkingSlot);

/**
 * El sistema define ruta para actualizar un espacio de parqueo existente.
 * PUT /parking-slots/:id - Actualiza los datos de un espacio específico por su ID.
 * @param {string} id - ID del espacio de parqueo a actualizar
 */
router.put(`${basePath}/:id`, verifyToken, ParkingSlotController.updateParkingSlot);

/**
 * El sistema define ruta para eliminar un espacio de parqueo.
 * DELETE /parking-slots/:id - Elimina un espacio específico por su ID.
 * @param {string} id - ID del espacio de parqueo a eliminar
 */
router.delete(`${basePath}/:id`, verifyToken, ParkingSlotController.deleteParkingSlot);

export default router;