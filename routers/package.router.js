import express from 'express';
import PackageController from '../controllers/package.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * El router gestiona las rutas relacionadas con paquetes.
 * El sistema define las rutas para crear, consultar, actualizar y eliminar paquetes,
 * así como registrar su entrega y salida del conjunto residencial,
 * aplicando verificación de token y control de acceso por módulo.
 */
const router = express.Router();
const basePath = '/packages';

/**
 * El sistema aplica verificación de token para todas las rutas de paquetes.
 * Esto asegura que solo los usuarios autenticados puedan acceder a estas rutas.
 */
router.use(verifyToken);

/**
 * El sistema define rutas especializadas para paquetes
 */

/**
 * El sistema obtiene todos los paquetes de un usuario específico
 * GET /packages/user/:userId: Lista los paquetes asociados a un usuario
 */
router.get(`${basePath}/user/:userId`, PackageController.getByUser);

/**
 * El sistema registra la salida de un paquete
 * PUT /packages/:id/exit: Actualiza el estado de un paquete a entregado
 */
router.put(`${basePath}/:id/exit`, PackageController.registerExit);

/**
 * El sistema define las rutas base para paquetes,
 * GET: Obtener todos los paquetes activos
 * POST: Registrar un nuevo paquete
 */
router.route(basePath)
    .get(PackageController.getAll)
    .post(PackageController.create);

/**
 * El sistema define las rutas para operaciones específicas de paquetes,
 * GET: Obtener un paquete específico por ID
 * PUT: Actualiza un paquete específico por ID
 * DELETE: Elimina un paquete específico por ID
 */
router.route(`${basePath}/:id`)
    .get(PackageController.getById)
    .put(PackageController.update)
    .delete(PackageController.delete);

export default router;