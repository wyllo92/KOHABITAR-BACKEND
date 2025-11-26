/**
 * Importar el módulo Router de Express para definir rutas.
 * Este módulo permite crear un enrutador modular que puede ser montado en la aplicación principal.
 */
import { Router } from 'express';

/**
 * Importar el controlador de facturas que contiene la lógica para manejar las peticiones HTTP.
 * Este controlador implementa los métodos para crear, leer, actualizar y eliminar facturas.
 */
import InvoiceController from '../controllers/invoice.controller.js';

/**
 * Importar el middleware de autenticación para proteger las rutas.
 * Verificar que las peticiones incluyan un token JWT válido antes de permitir el acceso.
 */
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Crear una nueva instancia del enrutador de Express.
 * Este enrutador manejará todas las rutas relacionadas con facturas.
 */
const router = Router();

/**
 * Definir la ruta base para todos los endpoints de facturas.
 * Todas las rutas definidas en este archivo tendrán este prefijo.
 */
const basePath = '/invoice';

/**
 * Aplica el middleware de autenticación a todas las rutas de facturas.
 * Esto asegura que solo los usuarios autenticados puedan acceder a estos endpoints.
 */
router.use(verifyToken);

/**
 * Rutas básicas para el manejo de facturas.
 * GET: Obtener todas las facturas.
 * POST: Crear una nueva factura con los datos proporcionados en el cuerpo de la solicitud.
 */
router.route(basePath)
  .get(InvoiceController.getAllInvoices)
  .post(InvoiceController.createInvoice);

/**
 * Rutas para filtrar facturas según su estado.
 * Estas rutas permiten obtener facturas con características específicas.
 */

/**
 * Obtener todas las facturas vencidas (fecha de vencimiento pasada y no pagadas).
 * GET: Retorna una lista de facturas vencidas con información detallada.
 */
router.route(`${basePath}/overdue`)
  .get(InvoiceController.getOverdueInvoices);

/**
 * Obtener todas las facturas pendientes de pago.
 * GET: Retorna una lista de facturas con estado 'pendiente'.
 */
router.route(`${basePath}/pending`)
  .get(InvoiceController.getPendingInvoices);

/**
 * Obtener todas las facturas asociadas a un usuario específico.
 * GET: Retorna una lista de facturas filtradas por el ID de usuario proporcionado en la URL.
 * 
 * @param {string} user_id - ID del usuario cuyos facturas se desean consultar.
 */
router.route(`${basePath}/user/:user_id`)
  .get(InvoiceController.getInvoicesByUser);

/**
 * Obtener todas las facturas asociadas a una propiedad específica.
 * GET: Retorna una lista de facturas filtradas por el ID de propiedad proporcionado en la URL.
 * 
 * @param {string} property_id - ID de la propiedad cuyas facturas se desean consultar.
 */
router.route(`${basePath}/property/:property_id`)
  .get(InvoiceController.getInvoicesByProperty);

/**
 * Rutas para operaciones sobre una factura específica identificada por su ID.
 * GET: Obtener los detalles de una factura.
 * PUT: Actualiza los datos de una factura existente.
 * DELETE: Elimina una factura del sistema.
 * 
 * @param {string} id - ID de la factura sobre la cual se realizará la operación.
 */
router.route(`${basePath}/:id`)
  .get(InvoiceController.getInvoiceById)
  .put(InvoiceController.updateInvoice)
  .delete(InvoiceController.deleteInvoice);

/**
 * Exporta el enrutador para ser utilizado en la aplicación principal.
 * Esto permite que todas las rutas definidas aquí sean accesibles desde la app.
 */
export default router; 