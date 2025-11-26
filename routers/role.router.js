import { Router } from "express";
import RoleController from '../controllers/role.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Router para gestionar las rutas relacionadas con roles.
 * Definir las rutas para crear, consultar, actualizar y eliminar roles,
 * aplicando verificación de token y control de acceso por módulo.
 */
const router = Router();
const basePath = '/roles';

/**
 * Aplica verificación de token para todas las rutas de roles.
 * Esto asegura que solo los usuarios autenticados puedan acceder a estas rutas.
 */
router.use(verifyToken);

/**
 * Definir las rutas base para roles,
 * POST: Registrar un nuevo rol
 * GET: Muestra todos los roles
 */
router.route(basePath)
  .post(RoleController.register)
  .get(RoleController.show);

/**
 * Definir las rutas para operaciones basadas en ID,
 * GET: Muestra un rol específico por ID
 * PUT: Actualiza un rol específico por ID
 * DELETE: Elimina un rol específico por ID
 */
router.route(`${basePath}/:id`)
  .get(RoleController.findById)
  .put(RoleController.update)
  .delete(RoleController.delete);

export default router;