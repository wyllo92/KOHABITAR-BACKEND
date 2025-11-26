import express from 'express';
import ReportTypeController from '../controllers/reportType.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Router para gestionar las rutas relacionadas con tipos de reportes.
 * Definir las rutas para crear, consultar, actualizar y eliminar tipos de reportes,
 * aplicando verificación de token y control de acceso por módulo.
 */
const router = express.Router();
const basePath = '/report-types';

/**
 * Aplica verificación de token para todas las rutas de tipos de reportes.
 * Esto asegura que solo los usuarios autenticados puedan acceder a estas rutas.
 */
router.use(verifyToken);

/**
 * Definir las rutas base para tipos de reportes,
 * GET: Obtener todos los tipos de reportes
 * POST: Registrar un nuevo tipo de reporte
 */
router.route(basePath)
    .get(ReportTypeController.getAll)
    .post(ReportTypeController.create);

/**
 * Definir las rutas para operaciones específicas de tipos de reportes,
 * GET: Obtener un tipo de reporte específico por ID
 * PUT: Actualiza un tipo de reporte específico por ID
 * DELETE: Elimina un tipo de reporte específico por ID
 */
router.route(`${basePath}/:id`)
    .get(ReportTypeController.getById)
    .put(ReportTypeController.update)
    .delete(ReportTypeController.delete);

export default router;