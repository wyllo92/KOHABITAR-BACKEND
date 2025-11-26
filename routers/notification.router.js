/**
 * Importar el módulo Router de Express para definir rutas.
 * Este módulo permite crear un enrutador modular que puede ser montado en la aplicación principal.
 */
import { Router } from "express";

/**
 * Importar el controlador de notificaciones que contiene la lógica para manejar las peticiones HTTP.
 * Este controlador implementa los métodos para crear, leer, actualizar y eliminar notificaciones.
 */
import NotificationController from '../controllers/notification.controller.js';

/**
 * Importar el middleware de autenticación para proteger las rutas.
 * Verificar que las peticiones incluyan un token JWT válido antes de permitir el acceso.
 */
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Crear una nueva instancia del enrutador de Express.
 * Este enrutador manejará todas las rutas relacionadas con notificaciones.
 */
const router = Router();

/**
 * Definir la ruta base para todos los endpoints de notificaciones.
 * Todas las rutas definidas en este archivo tendrán este prefijo.
 */
const basePath = '/notifications';

/**
 * Rutas protegidas con middleware de autenticación.
 * Todas estas rutas requieren un token JWT válido para acceder.
 */

/**
 * Aplica el middleware de autenticación a todas las rutas de notificaciones.
 */
router.use(verifyToken);

/**
 * Rutas básicas para operaciones CRUD de notificaciones.
 * POST: Registrar una nueva notificación en el sistema.
 * GET: Obtener todas las notificaciones del sistema.
 */
router.route(basePath)
    .post(NotificationController.register) // Registrar una nueva notificación
    .get(NotificationController.show); // Muestra todas las notificaciones

/**
 * Ruta para obtener todas las notificaciones de un usuario específico.
 * GET: Retorna una lista de notificaciones filtradas por el ID de usuario proporcionado en la URL.
 *
 * @param {string} user_id - ID del usuario cuyas notificaciones se desean consultar.
 */
router.route(`${basePath}/user/:user_id`)
    .get(NotificationController.findByUserId); // Muestra notificaciones por ID de usuario

/**
 * Ruta para marcar una notificación como leída.
 * PATCH: Actualiza el campo read_at de la notificación con la fecha y hora actual.
 *
 * @param {string} id - ID de la notificación a marcar como leída.
 */
router.route(`${basePath}/:id/read`)
    .patch(NotificationController.markAsRead); // Marca una notificación como leída

/**
 * Rutas para operaciones sobre una notificación específica identificada por su ID.
 * GET: Obtener los detalles de una notificación específica.
 * PUT: Actualiza los datos de una notificación existente.
 * DELETE: Elimina una notificación del sistema.
 *
 * @param {string} id - ID de la notificación sobre la cual se realizará la operación.
 */
router.route(`${basePath}/:id`)
    .get(NotificationController.findById) // Muestra una notificación por ID
    .put(NotificationController.update) // Actualiza una notificación por ID
    .delete(NotificationController.delete); // Elimina una notificación por ID

export default router;