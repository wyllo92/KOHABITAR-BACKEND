import express from 'express';
import PaymentController from '../controllers/payment.controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Router para gestionar las rutas relacionadas con pagos.
 * Definir las rutas para realizar operaciones CRUD y consultas especializadas
 * sobre los pagos del sistema.
 */
const router = express.Router();
const basePath = '/payments';

/**
 * Todas las rutas están protegidas con el middleware verifyToken que
 * valida la autenticación del usuario antes de permitir el acceso.
 */

/**
 * Ruta para obtener todos los pagos.
 * GET /payments - Retorna la lista completa de pagos.
 */
router.get(basePath, verifyToken, PaymentController.getAllPayments);

/**
 * Ruta para obtener los pagos asociados a una factura específica.
 * GET /payments/invoice/:invoice_id - Retorna pagos filtrados por ID de factura.
 * @param {string} invoice_id - ID de la factura
 */
router.get(`${basePath}/invoice/:invoice_id`, verifyToken, PaymentController.getPaymentsByInvoice);

/**
 * Ruta para obtener los pagos realizados por un usuario específico.
 * GET /payments/user/:user_id - Retorna pagos filtrados por ID de usuario.
 * @param {string} user_id - ID del usuario
 */
router.get(`${basePath}/user/:user_id`, verifyToken, PaymentController.getPaymentsByUser);

/**
 * Ruta para obtener un pago específico por su ID.
 * GET /payments/:id - Retorna los detalles de un pago por su ID.
 * @param {string} id - ID del pago
 */
router.get(`${basePath}/:id`, verifyToken, PaymentController.getPaymentById);

/**
 * Ruta para crear un nuevo pago.
 * POST /payments - Crear un nuevo pago con los datos proporcionados en el cuerpo de la petición.
 */
router.post(basePath, verifyToken, PaymentController.createPayment);

/**
 * Ruta para actualizar un pago existente.
 * PUT /payments/:id - Actualiza los datos de un pago específico por su ID.
 * 
 * @description Esta ruta permite actualizar la información de un pago existente.
 * El sistema verifica primero si el pago existe antes de realizar la actualización.
 * 
 * @param {string} id - ID del pago a actualizar (se envía en la URL)
 * 
 * @bodyParam {number} user_id - ID del usuario que realiza el pago
 * @bodyParam {number} amount_paid - Monto del pago
 * @bodyParam {string} payment_date - Fecha del pago (YYYY-MM-DD)
 * @bodyParam {string} method - Método de pago (Efectivo, Transferencia, etc.)
 * @bodyParam {string} reference - Número de referencia o comprobante
 * @bodyParam {number} [invoice_id] - ID de la factura relacionada (opcional)
 * @bodyParam {number} [reservation_id] - ID de la reserva relacionada (opcional)
 * @bodyParam {number} [parking_assignment_id] - ID del parqueadero relacionado (opcional)
 * @bodyParam {number} status_id - ID del estado del pago
 * 
 * @example
 * // Ejemplo de petición PUT a /api_v1/payments/123
 * {
 *   "user_id": 456,
 *   "amount_paid": 150000,
 *   "payment_date": "2025-10-26",
 *   "method": "Transferencia",
 *   "reference": "TR-789",
 *   "invoice_id": 321,
 *   "status_id": 2
 * }
 * 
 * @returns {Object} Respuesta con el pago actualizado
 * // Ejemplo de respuesta exitosa:
 * {
 *   "success": true,
 *   "data": {
 *     "payment_id": 123,
 *     "user_id": 456,
 *     ...resto de datos del pago
 *   },
 *   "message": "Pago actualizado exitosamente"
 * }
 */
router.put(`${basePath}/:id`, verifyToken, PaymentController.updatePayment);

/**
 * Ruta para eliminar un pago.
 * DELETE /payments/:id - Elimina un pago específico por su ID.
 * @param {string} id - ID del pago a eliminar
 */
router.delete(`${basePath}/:id`, verifyToken, PaymentController.deletePayment);

/**
 * Ruta para generar estado de cuenta de un usuario.
 * POST /payments/statement - Genera un estado de cuenta con resumen y detalles de pagos.
 * Body:
 * - userId: ID del usuario
 * - startDate: Fecha inicial (YYYY-MM-DD)
 * - endDate: Fecha final (YYYY-MM-DD)
 * - includeDetails: (opcional) Si se incluyen detalles de pagos
 * - propertyId: (opcional) ID de la propiedad para filtrar
 */
router.post(`${basePath}/statement`, verifyToken, PaymentController.generateStatement);

export default router; 