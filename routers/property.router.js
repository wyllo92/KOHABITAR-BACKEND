import { Router } from "express";
import PropertyController from '../controllers/property.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Router para gestionar las rutas relacionadas con propiedades.
 * Definir las rutas para crear, obtener, actualizar y eliminar propiedades,
 * así como para realizar búsquedas por diferentes criterios y obtener tipos de propiedades.
 */
const router = Router();
const basePath = '/properties';
const searchPath = '/properties/search';
const typePath = '/properties/type';
const typesPath = '/properties/types';

/**
 * Aplica verificación de token para todas las rutas de propiedades.
 * Esto asegura que solo los usuarios autenticados puedan acceder a estas rutas.
 */
router.use(verifyToken);

/**
 * Definir las rutas base para propiedades.
 * POST: Registrar una nueva propiedad
 * GET: Muestra todas las propiedades
 */
router.route(basePath)
    .post(PropertyController.register) // Registrar una nueva propiedad
    .get(PropertyController.show);     // Muestra todas las propiedades

/**
 * Definir la ruta para obtener los tipos de propiedades.
 * GET: Obtener todos los tipos de propiedades disponibles
 */
router.route(typesPath)
    .get(PropertyController.getPropertyTypes); // Obtener todos los tipos de propiedades

/**
 * Definir la ruta para buscar propiedades por nombre.
 * Esta ruta debe estar antes de la ruta /:id para evitar conflictos.
 * GET: Busca propiedades por nombre
 */
router.route(searchPath)
    .get(PropertyController.searchPropertiesByName); // Buscar propiedades por nombre

/**
 * Definir la ruta para obtener propiedades por tipo.
 * Esta ruta debe estar antes de la ruta /:id para evitar conflictos.
 * GET: Obtener propiedades filtradas por tipo
 */
router.route(`${typePath}/:typeId`)
    .get(PropertyController.getPropertiesByType); // Obtener propiedades por tipo

/**
 * Definir la ruta para actualizar solo el estado de una propiedad.
 * Esta ruta debe estar antes de /:id para evitar conflictos.
 * PATCH: Actualiza solo el estado (activo/inactivo) de una propiedad
 */
router.route(`${basePath}/:id/status`)
    .patch(PropertyController.updateStatus);

/**
 * Definir las rutas para operaciones basadas en ID.
 * Estas rutas deben estar al final para evitar conflictos con rutas específicas.
 * GET: Muestra una propiedad por su ID
 * PUT: Actualiza una propiedad por su ID
 * DELETE: Elimina una propiedad por su ID
 */
router.route(`${basePath}/:id`)
    .get(PropertyController.findById)  // Muestra una propiedad por ID
    .put(PropertyController.update)    // Actualiza una propiedad por ID
    .delete(PropertyController.delete); // Elimina una propiedad por ID

export default router;