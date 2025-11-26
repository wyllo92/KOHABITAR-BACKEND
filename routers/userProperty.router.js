import { Router } from "express";
import UserPropertyController from '../controllers/userProperty.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Router para gestionar las rutas relacionadas con la relación entre usuarios y propiedades.
 * Definir las rutas HTTP para crear, consultar, actualizar y eliminar asociaciones
 * entre usuarios y propiedades en el sistema.
 */
const router = Router();
const basePath = '/user-property';

router.use(verifyToken);

/**
 * Rutas principales para operaciones de usuario-propiedad.
 * 
 * POST /user-property: Crear una nueva relación entre un usuario y una propiedad
 * GET /user-property: Obtener todas las relaciones usuario-propiedad
 */
router.route(basePath)
  .post(UserPropertyController.create)

  .get(UserPropertyController.show);

/**
 * Ruta para obtener todas las propiedades asociadas a un usuario específico.
 * 
 * GET /user-property/user/:userId: Devolver la lista de propiedades que pertenecen o
 * donde reside un usuario específico.
 */
router.route(`${basePath}/user/:userId`)
  .get(UserPropertyController.findByUserId);

/**
 * Ruta para obtener todos los usuarios asociados a una propiedad específica.
 * 
 * GET /user-property/property/:propertyId: Devolver la lista de usuarios que son propietarios
 * o residentes de una propiedad específica.
 */
router.route(`${basePath}/property/:propertyId`)
  .get(UserPropertyController.findByPropertyId);

/**
 * Ruta para obtener información detallada de todos los residentes de una propiedad.
 * Utiliza un procedimiento almacenado para obtener datos más completos que la ruta anterior.
 * 
 * GET /user-property/residents/:propertyId: Devolver información detallada de todos
 * los residentes de una propiedad específica.
 */
router.route(`${basePath}/residents/:propertyId`)
  .get(UserPropertyController.getPropertyResidents);

/**
 * Rutas para operaciones específicas sobre una relación usuario-propiedad.
 * 
 * PUT /user-property/:id: Actualiza una relación existente entre usuario y propiedad
 * DELETE /user-property/:id: Elimina una relación existente entre usuario y propiedad
 */
router.route(`${basePath}/:id`)
  .put(UserPropertyController.update)
  .delete(UserPropertyController.delete);

export default router;
