/**
 * Importa el módulo Router de Express para definir rutas.
 * Este módulo permite crear un enrutador modular que puede ser montado en la aplicación principal.
 */
import { Router } from "express";

/**
 * Importa el controlador de tipos de notificación que contiene la lógica para manejar las peticiones HTTP.
 * Este controlador implementa los métodos para crear, leer, actualizar y eliminar tipos de notificación.
 */
import NotificationTypeController from '../controllers/notificationType.controller.js';

/**
 * Importa el middleware de autenticación para proteger las rutas.
 * Verifica que las peticiones incluyan un token JWT válido antes de permitir el acceso.
 */
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Crea una nueva instancia del enrutador de Express.
 * Este enrutador manejará todas las rutas relacionadas con tipos de notificación.
 */
const router = Router();

/**
 * Define la ruta base para todos los endpoints de tipos de notificación.
 * Todas las rutas definidas en este archivo tendrán este prefijo.
 */
const basePath = '/notificationType';

/**
 * Aplica el middleware de autenticación a todas las rutas de tipos de notificación.
 * Esto asegura que solo los usuarios autenticados puedan acceder a estas rutas.
 */
router.use(verifyToken);

/**
 * Define las rutas base para tipos de notificación.
 * POST: Registra un nuevo tipo de notificación.
 * GET: Obtiene todos los tipos de notificación.
 */
router.route(basePath)
  .post(NotificationTypeController.register)  // Registra un nuevo tipo
  .get(NotificationTypeController.show);       // Muestra todos los tipos

/**
 * Define las rutas para operaciones basadas en ID.
 * GET: Obtiene un tipo de notificación específico por ID.
 * PUT: Actualiza un tipo de notificación específico por ID.
 * DELETE: Elimina un tipo de notificación específico por ID.
 *
 * @param {string} id - ID del tipo de notificación sobre el cual se realizará la operación.
 */
router.route(`${basePath}/:id`)
  .get(NotificationTypeController.findById)   // Muestra un tipo por ID
  .put(NotificationTypeController.update)      // Actualiza un tipo por ID
  .delete(NotificationTypeController.delete);  // Elimina un tipo por ID

export default router;
