/**
 * Importar el modelo de Invoice para interactuar con la base de datos.
 * El modelo contiene todos los métodos necesarios para las operaciones CRUD con facturas.
 */
import InvoiceModel from '../models/invoice.model.js';
import StatusModel from '../models/status.model.js';

/**
 * Controlador para manejar todas las operaciones relacionadas con facturas.
 * Procesa peticiones HTTP, valida datos y devuelve respuestas apropiadas.
 */
class InvoiceController {
  
  /**
   * Obtener todas las facturas almacenadas en el sistema.
   * 
   * @param {Request} req - Objeto de solicitud HTTP.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con la lista completa de facturas.
   */
  async getAllInvoices(req, res) {
    try {
      // Obtener todas las facturas desde el modelo
      const invoices = await InvoiceModel.show();
      
      // Retornar respuesta exitosa con los datos obtenidos
      res.json({
        success: true,
        data: invoices,
        message: 'Facturas obtenidas exitosamente'
      });
    } catch (error) {
      // En caso de error, retorna un mensaje de error con código 500
      res.status(500).json({
        success: false,
        message: 'Error al obtener las facturas',
        error: error.message
      });
    }
  }

  /**
   * Obtener todas las facturas asociadas a un usuario específico.
   * 
   * @param {Request} req - Objeto de solicitud HTTP con el ID de usuario en los parámetros.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con las facturas del usuario.
   */
  async getInvoicesByUser(req, res) {
    try {
      // Extraer el ID del usuario desde los parámetros de la ruta
      const { user_id } = req.params;
      
      // Consultar al modelo para obtener las facturas del usuario específico
      const invoices = await InvoiceModel.findByUser(user_id);
      
      // Retornar respuesta exitosa con las facturas encontradas
      res.json({
        success: true,
        data: invoices,
        message: `Facturas del usuario ${user_id} obtenidas exitosamente`
      });
    } catch (error) {
      // En caso de error, retorna un mensaje de error con código 500
      res.status(500).json({
        success: false,
        message: 'Error al obtener las facturas del usuario',
        error: error.message
      });
    }
  }

  /**
   * Obtener todas las facturas asociadas a una propiedad específica.
   * 
   * @param {Request} req - Objeto de solicitud HTTP con el ID de propiedad en los parámetros.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con las facturas de la propiedad.
   */
  async getInvoicesByProperty(req, res) {
    try {
      // Extraer el ID de la propiedad desde los parámetros de la ruta
      const { property_id } = req.params;
      
      // Consultar al modelo para obtener las facturas de la propiedad específica
      const invoices = await InvoiceModel.findByProperty(property_id);
      
      // Retornar respuesta exitosa con las facturas encontradas
      res.json({
        success: true,
        data: invoices,
        message: `Facturas de la propiedad ${property_id} obtenidas exitosamente`
      });
    } catch (error) {
      // En caso de error, retorna un mensaje de error con código 500
      res.status(500).json({
        success: false,
        message: 'Error al obtener las facturas de la propiedad',
        error: error.message
      });
    }
  }

  /**
   * Obtener una factura específica por su ID.
   * 
   * @param {Request} req - Objeto de solicitud HTTP con el ID de la factura en los parámetros.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con los datos de la factura solicitada.
   */
  async getInvoiceById(req, res) {
    try {
      // Extraer el ID de la factura de los parámetros de la ruta
      const { id } = req.params;
      
      // Consultar al modelo para obtener la factura por su ID
      const invoice = await InvoiceModel.findById(id);

      // Si no se encuentra la factura, retorna un error 404 (no encontrado)
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
      }

      // Si se encuentra, retorna la factura con un mensaje de éxito
      res.json({
        success: true,
        data: invoice,
        message: 'Factura obtenida exitosamente'
      });
    } catch (error) {
      // En caso de error, retorna un mensaje de error con código 500
      res.status(500).json({
        success: false,
        message: 'Error al obtener la factura',
        error: error.message
      });
    }
  }

  /**
   * Crear una nueva factura en el sistema.
   * 
   * @param {Request} req - Objeto de solicitud HTTP con los datos de la factura en el cuerpo.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con la factura creada.
   */
  async createInvoice(req, res) {
    try {
      // Extraer todos los datos de la factura desde el cuerpo de la solicitud
      const invoiceData = req.body;

      // Validar que el status_id sea válido para facturas (si se proporciona)
      if (invoiceData.status_id) {
        const isValidStatus = await StatusModel.validateStatusForEntity(invoiceData.status_id, 'invoice');
        if (!isValidStatus) {
          return res.status(400).json({
            success: false,
            message: 'El estado proporcionado no es válido para facturas. Use solo estados de tipo "invoice".'
          });
        }
      }

      // Crear la factura y obtiene el ID generado
      const invoiceId = await InvoiceModel.create(invoiceData);

      // Verificar si la factura se creó correctamente
      if (invoiceId) {
        // Buscar los datos completos de la factura recién creada
        const newInvoice = await InvoiceModel.findById(invoiceId);
        
        // Retornar respuesta exitosa con código 201 (recurso creado)
        res.status(201).json({
          success: true,
          data: newInvoice,
          message: 'Factura creada exitosamente'
        });
      } else {
        // Si no se pudo crear la factura, retorna un error 400 (solicitud incorrecta)
        res.status(400).json({
          success: false,
          message: 'Error al crear la factura'
        });
      }
    } catch (error) {
      // En caso de error en el servidor, retorna un error 500
      res.status(500).json({
        success: false,
        message: 'Error al crear la factura',
        error: error.message
      });
    }
  }

  /**
   * Actualiza una factura existente con nuevos datos.
   * 
   * @param {Request} req - Objeto de solicitud HTTP con el ID de la factura en los parámetros y datos actualizados en el cuerpo.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con la factura actualizada o mensaje de error.
   */
  async updateInvoice(req, res) {
    try {
      // Extraer el ID de la factura desde los parámetros de la ruta
      const { id } = req.params;

      // Extraer los datos actualizados del cuerpo de la solicitud
      const updateData = req.body;

      // Verificar si la factura existe antes de intentar actualizarla
      const existingInvoice = await InvoiceModel.findById(id);
      if (!existingInvoice) {
        // Si la factura no existe, retorna un error 404 (no encontrado)
        return res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
      }

      // Validar que el status_id sea válido para facturas (si se está cambiando)
      if (updateData.status_id) {
        const isValidStatus = await StatusModel.validateStatusForEntity(updateData.status_id, 'invoice');
        if (!isValidStatus) {
          return res.status(400).json({
            success: false,
            message: 'El estado proporcionado no es válido para facturas. Use solo estados de tipo "invoice".'
          });
        }
      }

      // Actualiza la factura con los nuevos datos
      const updatedInvoice = await InvoiceModel.update(id, updateData);

      // Verificar si la actualización fue exitosa
      if (updatedInvoice) {
        // Retornar respuesta exitosa con los datos actualizados
        res.json({
          success: true,
          data: updatedInvoice,
          message: 'Factura actualizada exitosamente'
        });
      } else {
        // Si no se pudo actualizar, retorna un error 400 (solicitud incorrecta)
        res.status(400).json({
          success: false,
          message: 'Error al actualizar la factura'
        });
      }
    } catch (error) {
      // En caso de error en el servidor, retorna un error 500
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la factura',
        error: error.message
      });
    }
  }

  /**
   * Elimina una factura del sistema por su ID.
   * 
   * @param {Request} req - Objeto de solicitud HTTP con el ID de la factura en los parámetros.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con mensaje de confirmación o error.
   */
  async deleteInvoice(req, res) {
    try {
      // Extraer el ID de la factura desde los parámetros de la ruta
      const { id } = req.params;

      // Verificar si la factura existe antes de intentar eliminarla
      const existingInvoice = await InvoiceModel.findById(id);
      if (!existingInvoice) {
        // Si la factura no existe, retorna un error 404 (no encontrado)
        return res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
      }

      // Elimina la factura y obtiene confirmación
      const deleted = await InvoiceModel.delete(id);

      // Verificar si la eliminación fue exitosa
      if (deleted) {
        // Retornar respuesta exitosa con mensaje de confirmación
        res.json({
          success: true,
          message: 'Factura eliminada exitosamente'
        });
      } else {
        // Si no se pudo eliminar, retorna un error 400 (solicitud incorrecta)
        res.status(400).json({
          success: false,
          message: 'Error al eliminar la factura'
        });
      }
    } catch (error) {
      // En caso de error en el servidor, retorna un error 500
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la factura',
        error: error.message
      });
    }
  }

  /**
   * Obtener todas las facturas vencidas en el sistema.
   * 
   * @param {Request} req - Objeto de solicitud HTTP.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con la lista de facturas vencidas.
   */
  async getOverdueInvoices(req, res) {
    try {
      // Consultar al modelo para obtener las facturas con fecha vencida
      const invoices = await InvoiceModel.findOverdue();
      
      // Retornar respuesta exitosa con las facturas vencidas encontradas
      res.json({
        success: true,
        data: invoices,
        message: 'Facturas vencidas obtenidas exitosamente'
      });
    } catch (error) {
      // En caso de error, retorna un mensaje de error con código 500
      res.status(500).json({
        success: false,
        message: 'Error al obtener las facturas vencidas',
        error: error.message
      });
    }
  }

  /**
   * Obtener todas las facturas pendientes de pago en el sistema.
   * 
   * @param {Request} req - Objeto de solicitud HTTP.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con la lista de facturas pendientes.
   */
  async getPendingInvoices(req, res) {
    try {
      // Consultar al modelo para obtener las facturas pendientes de pago
      const invoices = await InvoiceModel.findPending();
      
      // Retornar respuesta exitosa con las facturas pendientes encontradas
      res.json({
        success: true,
        data: invoices,
        message: 'Facturas pendientes obtenidas exitosamente'
      });
    } catch (error) {
      // En caso de error, retorna un mensaje de error con código 500
      res.status(500).json({
        success: false,
        message: 'Error al obtener las facturas pendientes',
        error: error.message
      });
    }
  }
}

export default new InvoiceController(); 