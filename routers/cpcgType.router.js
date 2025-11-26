import express from 'express';
import CpcgTypeController from '../controllers/cpcgType.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Router para gestionar las rutas relacionadas con tipos de PQRS 
 * (Peticiones, Quejas, Reclamos y Sugerencias).
 * Definir las rutas para crear, consultar, actualizar y eliminar tipos de PQRS,
 * aplicando verificación de token y control de acceso por módulo.
 */
const router = express.Router();
const basePath = '/cpcg-types';

/**
 * Aplica verificación de token para todas las rutas de tipos de PQRS.
 * Esto asegura que solo los usuarios autenticados puedan acceder a estas rutas.
 */
router.use(verifyToken);

/**
 * Definir las rutas base para tipos de PQRS,
 * GET: Obtener todos los tipos de PQRS
 * POST: Registrar un nuevo tipo de PQRS
 */
router.route(basePath)
    .get(CpcgTypeController.getAll)
    .post(CpcgTypeController.create);

/**
 * Definir las rutas para operaciones específicas de tipos de PQRS,
 * GET: Obtener un tipo de PQRS específico por ID
 * PUT: Actualiza un tipo de PQRS específico por ID
 * DELETE: Elimina un tipo de PQRS específico por ID
 */
router.route(`${basePath}/:id`)
    .get(CpcgTypeController.getById)
    .put(CpcgTypeController.update)
    .delete(CpcgTypeController.delete);

export default router;