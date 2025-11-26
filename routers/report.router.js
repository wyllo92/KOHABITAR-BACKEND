import { Router } from "express";
import ReportController from '../controllers/report.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Router para gestionar las rutas relacionadas con reportes.
 * Definir las rutas para crear, obtener, actualizar y eliminar reportes,
 * así como para generar reportes específicos sobre diferentes entidades del sistema.
 */
const router = Router();
const name = '/reports';
// Rutas protegidas

/**
 * Definir las rutas base para reportes.
 * POST: Registrar un nuevo reporte
 * GET: Muestra todos los reportes
 */
router.route(name)
    .post(verifyToken, ReportController.register) // Registrar un nuevo reporte
    .get(verifyToken, ReportController.show);     // Muestra todos los reportes

/**
 * Definir la ruta para generar reportes consolidados de diferentes entidades.
 * Esta ruta debe ir antes de la ruta /:id para evitar conflictos.
 * GET: Genera y retorna múltiples reportes del sistema
 */
router.route(`${name}/generate`)
    .get(verifyToken, ReportController.generateReports); // Genera reportes de diferentes entidades

/**
 * Definir las rutas para operaciones basadas en ID.
 * Estas rutas deben estar al final para evitar conflictos con rutas específicas.
 * GET: Muestra un reporte por su ID
 * PUT: Actualiza un reporte por su ID
 * DELETE: Elimina un reporte por su ID
 */
router.route(`${name}/:id`)
    .get(verifyToken, ReportController.findById)  // Muestra un reporte por ID
    .put(verifyToken, ReportController.update)    // Actualiza un reporte por ID
    .delete(verifyToken, ReportController.delete); // Elimina un reporte por ID

export default router;