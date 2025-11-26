/**
 * Importar el módulo Router de Express para la definición de rutas.
 * Router permite agrupar manejadores de rutas de manera modular.
 */
import { Router } from "express";

/**
 * Importar el controlador de zonas comunes (amenities).
 * Este controlador contiene todos los métodos para manejar las peticiones HTTP.
 */
import AmenityController from '../controllers/amenity.controller.js';

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
 * Definir la ruta base para todos los endpoints de zonas comunes.
 */
const basePath = '/amenities';

/**
 * Aplica el middleware de autenticación (verifyToken) a todas las rutas de zonas comunes.
 * Esto asegura que solo usuarios autenticados puedan acceder a estas rutas.
 */
router.use(verifyToken);

/**
 * Definir las rutas para la colección principal de zonas comunes.
 *
 * POST /amenities - Crear una nueva zona común.
 * GET /amenities - Obtener todas las zonas comunes activas.
 */
router.route(basePath)
    // Registrar una nueva zona común
    .post(AmenityController.register)
    // Muestra todas las zonas comunes activas
    .get(AmenityController.show);

/**
 * Definir las rutas para operaciones sobre una zona común específica.
 *
 * GET /amenities/:id - Obtener una zona común por su ID.
 * PUT /amenities/:id - Actualiza una zona común existente.
 * DELETE /amenities/:id - Elimina una zona común.
 */
router.route(`${basePath}/:id`)
    // Muestra una zona común por su ID
    .get(AmenityController.findById)
    // Actualiza una zona común por su ID
    .put(AmenityController.update)
    // Elimina una zona común por su ID
    .delete(AmenityController.delete);

/**
 * Exporta el enrutador para ser usado en la aplicación principal.
 */
export default router;