import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import ParkingAssignmentController from '../controllers/parkingAssignment.controller.js';

/**
 * El router gestiona las asignaciones de espacios de parqueo.
 * El sistema define las rutas HTTP para crear, consultar, actualizar y finalizar
 * asignaciones de parqueo en el sistema.
 */
const router = Router();
const baseRoute = '/parking-assignments';

/**
 * El sistema define rutas para operaciones generales de asignaciones de parqueo
 * Todas requieren autenticación mediante token JWT
 * 
 * Endpoints disponibles:
 * 
 * POST /parking-assignments
 * El sistema crea una nueva asignación de parqueo
 * Ejemplo de body:
 * {
 *    "parking_slot_id": 1,
 *    "user_id": 8,
 *    "vehicle_id": 1,
 *    "start_time": "2025-10-22T00:00:00Z",
 *    "end_time": "2025-11-21T23:59:59Z",
 *    "status_id": 1
 * }
 * 
 * GET /parking-assignments
 * El sistema obtiene la lista de todas las asignaciones activas
 */
router.route(baseRoute)
    .post(verifyToken, ParkingAssignmentController.create)
    .get(verifyToken, ParkingAssignmentController.getAll);

/**
 * El sistema define rutas para operaciones específicas de asignación por ID
 * 
 * GET /parking-assignments/:id
 * El sistema obtiene los detalles de una asignación específica
 * 
 * PUT /parking-assignments/:id
 * El sistema actualiza una asignación existente
 * Ejemplo de body:
 * {
 *    "vehicle_id": 2,
 *    "end_time": "2025-12-21T23:59:59Z",
 *    "status_id": 2
 * }
 * 
 * DELETE /parking-assignments/:id
 * El sistema finaliza una asignación (no la elimina, solo la marca como finalizada)
 */
router.route(`${baseRoute}/:id`)
    .get(verifyToken, ParkingAssignmentController.getById)
    .put(verifyToken, ParkingAssignmentController.update)
    .delete(verifyToken, ParkingAssignmentController.end);

/**
 * El sistema define rutas para consultar asignaciones por usuario
 * 
 * GET /parking-assignments/user/:userId
 * El sistema obtiene todas las asignaciones de un usuario específico
 */
router.route(`${baseRoute}/user/:userId`)
    .get(verifyToken, ParkingAssignmentController.getByUser);

/**
 * El sistema define ruta para verificar disponibilidad de un espacio
 * 
 * GET /parking-assignments/check-availability/:slotId
 * El sistema verifica si un espacio está disponible en un rango de fechas
 * Ejemplo de query params:
 * ?start_time=2025-10-22T00:00:00Z&end_time=2025-11-21T23:59:59Z
 */
router.route(`${baseRoute}/check-availability/:slotId`)
    .get(verifyToken, ParkingAssignmentController.checkAvailability);

export default router;