/**
 * Importar el módulo Router de Express para la definición de rutas.
 * Router permite agrupar manejadores de rutas de manera modular.
 */
import { Router } from 'express';

/**
 * Importar el controlador de tipos de zonas comunes.
 * Este controlador contiene todos los métodos para manejar las peticiones HTTP.
 */
import AmenityTypeController from '../controllers/amenityType.controller.js';

/**
 * Importar los middlewares de autenticación y autorización.
 * verifyToken verifica que el usuario esté autenticado.
 */
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Crear una nueva instancia del enrutador de Express.
 */
const router = Router();

/**
 * Definir la ruta base para todos los endpoints de tipos de zonas comunes.
 */
const basePath = '/amenity-types';

/**
 * Aplica el middleware de autenticación (verifyToken) a todas las rutas.
 * Esto asegura que solo usuarios autenticados puedan acceder a estas rutas.
 */
router.use(verifyToken);

/**
 * Definir las rutas para la colección principal de tipos de zonas comunes.
 * Estas rutas no requieren un ID específico en la URL.
 *
 * GET /amenity-types - Obtener todos los tipos de zonas comunes.
 * POST /amenity-types - Crear un nuevo tipo de zona común.
 */
router.route(basePath)
  // Obtener todos los tipos de zonas comunes
  .get(AmenityTypeController.getAll)
  // Crear un nuevo tipo de zona común
  .post(AmenityTypeController.create);

/**
 * Ruta específica para obtener solo los tipos de zonas comunes activos.
 *
 * GET /amenity-types/active - Obtener tipos de zonas comunes con estado activo.
 */
router.route(`${basePath}/active`)
  // Obtener solo los tipos de zonas comunes activos
  .get(AmenityTypeController.getActive);

/**
 * Definir las rutas para operaciones sobre un tipo de zona común específico.
 * Estas rutas requieren un ID en la URL para identificar el recurso.
 *
 * GET /amenity-types/:id - Obtener un tipo por su ID.
 * PUT /amenity-types/:id - Actualiza un tipo existente.
 * DELETE /amenity-types/:id - Elimina un tipo.
 */
router.route(`${basePath}/:id`)
  // Obtener un tipo de zona común por su ID
  .get(AmenityTypeController.getById)
  // Actualiza un tipo de zona común existente
  .put(AmenityTypeController.update)
  // Elimina un tipo de zona común
  .delete(AmenityTypeController.delete);

/**
 * Ruta específica para cambiar el estado de activación de un tipo de zona común.
 * Utiliza el método HTTP PATCH para actualización parcial del recurso.
 *
 * PATCH /amenity-types/:id/toggle-active - Activa o desactiva un tipo de zona común.
 */
router.route(`${basePath}/:id/toggle-active`)
  // Cambia el estado activo/inactivo de un tipo de zona común
  .patch(AmenityTypeController.toggleActive);

/**
 * Exporta el enrutador para ser usado en la aplicación principal.
 */
export default router;