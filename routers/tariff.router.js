import express from 'express';
import TariffController from '../controllers/tariff.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Router para gestionar las rutas relacionadas con tarifas.
 * Definir las rutas HTTP para crear, consultar, actualizar y eliminar tarifas en el sistema.
 */
const router = express.Router();
const basePath = '/tariffs';

/**
 * Aplica el middleware de verificación de token a todas las rutas de tarifas.
 * Asegura que solo usuarios autenticados puedan acceder a estas rutas.
 */
router.use(verifyToken);

/**
 * Rutas específicas que deben definirse primero para evitar conflictos de ruta.
 *
 * GET /tariffs/active: Obtener todas las tarifas con estado activo
 */
router.get(`${basePath}/active`, TariffController.findActive);

/**
 * Rutas CRUD estándar para la gestión de tarifas.
 *
 * GET /tariffs: Obtener todas las tarifas`
 * GET /tariffs/:id: Obtener una tarifa específica por ID
 * POST /tariffs: Crear una nueva tarifa
 * PUT /tariffs/:id: Actualiza una tarifa existente
 * DELETE /tariffs/:id: Elimina una tarifa existente
 */
router.get(basePath, TariffController.show);
router.get(`${basePath}/:id`, TariffController.findById);
router.post(basePath, TariffController.register);
router.put(`${basePath}/:id`, TariffController.update);
router.delete(`${basePath}/:id`, TariffController.delete);

export default router; 