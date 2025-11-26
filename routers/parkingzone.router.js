import express from 'express';
import ParkingZoneController from '../controllers/parkingzone.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * El router gestiona las rutas relacionadas con las zonas de parqueo.
 * El sistema define las rutas para realizar operaciones CRUD y consultas especializadas
 * sobre las zonas de parqueo del sistema.
 */
const router = express.Router();
const basePath = '/parking-zones';

/**
 * El sistema aplica protección a todas las rutas con el middleware verifyToken que
 * valida la autenticación del usuario antes de permitir el acceso.
 */

/**
 * El sistema define ruta para obtener todas las zonas de parqueo.
 * GET /parking-zones - Retorna la lista completa de zonas de parqueo.
 */
router.get(basePath, verifyToken, ParkingZoneController.getAllParkingZones);

/**
 * El sistema define ruta para obtener una zona de parqueo específica.
 * GET /parking-zones/:id - Retorna los detalles de una zona de parqueo por su ID.
 * @param {string} id - ID de la zona de parqueo
 */
router.get(`${basePath}/:id`, verifyToken, ParkingZoneController.getParkingZoneById);

/**
 * El sistema define ruta para obtener la disponibilidad de espacios en una zona de parqueo.
 * GET /parking-zones/:id/availability - Retorna información sobre espacios disponibles y ocupados.
 * @param {string} id - ID de la zona de parqueo
 */
router.get(`${basePath}/:id/availability`, verifyToken, ParkingZoneController.getZoneAvailability);

/**
 * El sistema define ruta para crear una nueva zona de parqueo.
 * POST /parking-zones - Crear una nueva zona con los datos proporcionados en el cuerpo de la petición.
 */
router.post(basePath, verifyToken, ParkingZoneController.createParkingZone);

/**
 * El sistema define ruta para actualizar una zona de parqueo existente.
 * PUT /parking-zones/:id - Actualiza los datos de una zona específica por su ID.
 * @param {string} id - ID de la zona de parqueo a actualizar
 */
router.put(`${basePath}/:id`, verifyToken, ParkingZoneController.updateParkingZone);

/**
 * El sistema define ruta para eliminar una zona de parqueo.
 * DELETE /parking-zones/:id - Elimina una zona específica por su ID.
 * @param {string} id - ID de la zona de parqueo a eliminar
 */
router.delete(`${basePath}/:id`, verifyToken, ParkingZoneController.deleteParkingZone);

export default router;