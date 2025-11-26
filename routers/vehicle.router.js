import { Router } from "express";
import VehicleController from '../controllers/vehicle.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * @fileoverview Router para gestionar las rutas relacionadas con vehículos
 * Definir rutas para crear, obtener, actualizar y eliminar vehículos,
 * así como rutas específicas para buscar por usuario, propiedad, tipo y placa
 */

const router = Router();
const basePath = '/vehicles';

/**
 * Middleware de autenticación
 * Se aplica a todas las rutas de vehículos para garantizar que solo usuarios autenticados
 * puedan acceder a las operaciones relacionadas con vehículos
 */
router.use(verifyToken);

/**
 * GET: Obtener todos los vehículos activos
 * POST: Crear un nuevo registro de vehículo
 */
router.route(basePath)
  .get(VehicleController.show)
  .post(VehicleController.register);

/**
 * Ruta para buscar un vehículo por su número de placa
 * GET: Obtener la información detallada del vehículo con la placa especificada
 */
router.route(`${basePath}/license/:license_plate`)
  .get(VehicleController.getVehicleByLicensePlate);

/**
 * Ruta para obtener vehículos por usuario
 * GET: Obtener todos los vehículos asociados a un usuario específico
 */
router.route(`${basePath}/user/:user_id`)
  .get(VehicleController.getVehiclesByUserId);

/**
 * Ruta para obtener vehículos por propiedad
 * GET: Obtener todos los vehículos asociados a una propiedad específica
 */
router.route(`${basePath}/property/:property_id`)
  .get(VehicleController.getVehiclesByPropertyId);

/**
 * Ruta para obtener vehículos por tipo
 * GET: Obtener todos los vehículos de un tipo específico (carro, moto, etc.)
 */
router.route(`${basePath}/type/:type`)
  .get(VehicleController.getVehiclesByType);

/**
 * Rutas para operaciones específicas sobre un vehículo identificado por su ID
 * GET: Obtener la información detallada de un vehículo
 * PUT: Actualiza la información de un vehículo existente
 * DELETE: Elimina un vehículo del sistema
 */
router.route(`${basePath}/:id`)
  .get(VehicleController.findById)
  .put(VehicleController.update)
  .delete(VehicleController.delete);

export default router;