import express from 'express';
import CpcgController from '../controllers/cpcg.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Router para gestionar las rutas relacionadas con PQRS 
 * (Peticiones, Quejas, Reclamos y Sugerencias).
 * Definir las rutas para crear, consultar, actualizar y eliminar PQRS,
 * aplicando verificación de token y control de acceso por módulo.
 */
const router = express.Router();
const basePath = '/cpcg';

/**
 * Aplica verificación de token para todas las rutas de PQRS.
 * Esto asegura que solo los usuarios autenticados puedan acceder a estas rutas.
 */
router.use(verifyToken);

/**
 * Rutas especializadas para PQRS
 */

/**
 * Obtener todos los PQRS de un usuario específico
 * GET /cpcg/user/:userId: Lista los PQRS asociados a un usuario
 */
router.get(`${basePath}/user/:userId`, CpcgController.getByUser);

/**
 * Obtener todos los PQRS de un tipo específico
 * GET /cpcg/type/:typeId: Lista los PQRS de un tipo determinado
 */
router.get(`${basePath}/type/:typeId`, CpcgController.getByType);

/**
 * Obtener todos los PQRS de un estado específico
 * GET /cpcg/status/:statusId: Lista los PQRS de un estado determinado
 *
 * Ejemplo de uso:
 * GET /api_v1/cpcg/status/8 → Obtiene todos los PQRS con status_id = 8 (Creado)
 */
router.get(`${basePath}/status/:statusId`, CpcgController.getByStatus);

/**
 * Definir las rutas base para PQRS,
 * GET: Obtener todos los PQRS activos
 * POST: Registrar un nuevo PQRS
 *
 * Parámetros de query para paginación:
 * - page: Número de página (por defecto: 1)
 * - limit: Cantidad de registros por página (por defecto: 10)
 *
 * Ejemplo: GET /api_v1/cpcg?page=2&limit=20
 */
router.route(basePath)
    .get(CpcgController.getAll)
    .post(CpcgController.create);

/**
 * Definir las rutas para operaciones específicas de PQRS,
 * GET: Obtener un PQRS específico por ID
 * PUT: Actualiza un PQRS específico por ID
 * DELETE: Elimina un PQRS específico por ID
 */
router.route(`${basePath}/:id`)
    .get(CpcgController.getById)
    .put(CpcgController.update)
    .delete(CpcgController.delete);

export default router;