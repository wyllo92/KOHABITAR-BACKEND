import express from 'express';
import StatusController from '../controllers/status.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Router para gestionar las rutas relacionadas con estados.
 * Definir las rutas para crear, consultar, actualizar y eliminar estados,
 * aplicando verificación de token y control de acceso por módulo.
 */
const router = express.Router();
const basePath = '/statuses';

/**
 * Aplica verificación de token para todas las rutas de estados.
 * Esto asegura que solo los usuarios autenticados puedan acceder a estas rutas.
 */
router.use(verifyToken);

/**
 * Definir las rutas para operaciones con estados, cada una con su respectiva verificación de permisos.
 *
 * GET /statuses: Obtener todos los estados activos
 * GET /statuses/entity/:entity: Obtener estados filtrados por entidad
 * GET /statuses/:id: Obtener un estado específico por ID
 * POST /statuses: Crear un nuevo estado
 * PUT /statuses/:id: Actualiza un estado existente
 * DELETE /statuses/:id: Elimina un estado existente
 *
 * NOTA IMPORTANTE: La ruta /statuses/entity/:entity debe estar ANTES de /statuses/:id
 * para evitar que Express interprete 'entity' como un ID.
 */
router.get(basePath, StatusController.show);
router.get(`${basePath}/entity/:entity`, StatusController.getByEntity);
router.get(`${basePath}/:id`, StatusController.findById);
router.post(basePath, StatusController.register);
router.put(`${basePath}/:id`, StatusController.update);
router.delete(`${basePath}/:id`, StatusController.delete);

export default router; 