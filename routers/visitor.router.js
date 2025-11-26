import express from 'express';
import VisitorController from '../controllers/visitor.controller.js';
import { verifyToken,  } from '../middleware/authMiddleware.js';

/**
 * @fileoverview Router para gestionar las rutas relacionadas con visitantes
 * Definir las rutas para registrar, consultar, actualizar y eliminar visitantes,
 * así como rutas específicas para estadísticas, visitantes frecuentes y
 * registro histórico de visitas.
 */


/**
 * Inicializa el router de Express para manejar las rutas de visitantes
 * @constant {Object} router - Objeto router de Express
 */
const router = express.Router();
/**
 * Ruta para obtener todos los visitantes registrados el día actual
 * Requiere autenticación (verifyToken) y acceso al módulo de visitantes con permiso de visualización
 * @route GET /visitors/today
 */
router.get('/visitors/today', verifyToken, VisitorController.getTodayVisitors);

/**
 * Ruta para obtener estadísticas generales de visitantes
 * Requiere autenticación (verifyToken) y acceso al módulo de visitantes con permiso de visualización
 * Proporciona métricas como total de visitantes, promedios y tendencias
 * @route GET /visitors/statistics
 */
router.get('/visitors/statistics', verifyToken, VisitorController.getStatistics);

/**
 * Ruta para obtener la lista de visitantes más frecuentes
 * Requiere autenticación (verifyToken) y acceso al módulo de visitantes con permiso de visualización
 * Acepta un parámetro opcional 'limit' para especificar cuántos registros devolver
 * @route GET /visitors/frequent
 */
router.get('/visitors/frequent', verifyToken, VisitorController.getFrequentVisitors);

/**
 *     responses:
 *       200:
 *         description: Historial de visitas
 *       400:
 *         description: Parámetro de documento faltante
 *       404:
 *         description: No se encontró historial
 *       500:
 *         description: Error del servidor
 */
/**
 * Ruta para consultar el historial de visitas de una persona específica por su documento de identidad
 * Requiere autenticación (verifyToken) y acceso al módulo de visitantes con permiso de visualización
 * El documento de identidad se proporciona como parámetro en la URL
 * @route GET /visitors/history/:document
 */
router.get('/visitors/history/:document', verifyToken, VisitorController.getVisitorHistory);

/**
 *     responses:
 *       200:
 *         description: Salida registrada exitosamente
 *       404:
 *         description: Visitante no encontrado
 *       500:
 *         description: Error del servidor
 */
/**
 * Ruta para registrar la salida de un visitante del establecimiento
 * Requiere autenticación (verifyToken) y acceso al módulo de visitantes con permiso de edición
 * Actualiza la hora de salida y posiblemente el estado del visitante
 * @route PUT /visitors/checkout/:id
 */
router.put('/visitors/checkout/:id', verifyToken, VisitorController.checkOut);

/**
 *     responses:
 *       200:
 *         description: Lista de visitantes activos
 *       500:
 *         description: Error del servidor
 */
/**
 * Ruta para obtener todos los visitantes activos registrados en el sistema
 * Requiere autenticación (verifyToken) y acceso al módulo de visitantes con permiso de visualización
 * @route GET /visitors
 */
router.get('/visitors', verifyToken, VisitorController.show);

/**
 *     responses:
 *       200:
 *         description: Información detallada del visitante
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Visitante no encontrado
 *       500:
 *         description: Error del servidor
 */
/**
 * Ruta para obtener la información detallada de un visitante específico por su ID
 * Requiere autenticación (verifyToken) y acceso al módulo de visitantes con permiso de visualización
 * @route GET /visitors/:id
 */
router.get('/visitors/:id', verifyToken, VisitorController.findById);

/**
 *     responses:
 *       201:
 *         description: Visitante creado exitosamente
 *       400:
 *         description: Error de validación
 *       409:
 *         description: El visitante ya existe
 *       500:
 *         description: Error del servidor
 */
/**
/**
 * Ruta para crear un nuevo registro de visitante en el sistema
 * Requiere autenticación (verifyToken) y acceso al módulo de visitantes con permiso de creación
 * Valida que no exista otro visitante activo con el mismo documento de identidad
 * @route POST /visitors
 */
router.post('/visitors', verifyToken, VisitorController.register);

/**
 *     responses:
 *       200:
 *         description: Visitante actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Visitante no encontrado
 *       500:
 *         description: Error del servidor
 */
/**
 * Ruta para actualizar la información de un visitante existente
 * Requiere autenticación (verifyToken) y acceso al módulo de visitantes con permiso de edición
 * Verificar que el visitante exista antes de intentar actualizarlo
 * @route PUT /visitors/:id
 */
router.put('/visitors/:id', verifyToken, VisitorController.update);

/**
 *     responses:
 *       200:
 *         description: Visitante eliminado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Visitante no encontrado
 *       500:
 *         description: Error del servidor
 */
/**
 * Ruta para eliminar un visitante del sistema
 * Requiere autenticación (verifyToken) y acceso al módulo de visitantes con permiso de eliminación
 * Verificar que el visitante exista antes de intentar eliminarlo
 * @route DELETE /visitors/:id
 */
router.delete('/visitors/:id', verifyToken, VisitorController.delete);

/**
 * Exporta el router con todas las rutas definidas para su uso en la aplicación
 */
export default router;