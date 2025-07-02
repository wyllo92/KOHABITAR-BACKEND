import InvoiceModel from '../models/invoice.model.js';

class InvoiceController {
  
  static async getAllInvoices(req, res) {
    try {
      const invoices = await InvoiceModel.show();
      res.json({
        success: true,
        data: invoices,
        message: 'Facturas obtenidas exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las facturas',
        error: error.message
      });
    }
  }

  static async getInvoicesByUser(req, res) {
    try {
      const { user_id } = req.params;
      const invoices = await InvoiceModel.findByUser(user_id);
      res.json({
        success: true,
        data: invoices,
        message: `Facturas del usuario ${user_id} obtenidas exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las facturas del usuario',
        error: error.message
      });
    }
  }

  static async getInvoicesByProperty(req, res) {
    try {
      const { property_id } = req.params;
      const invoices = await InvoiceModel.findByProperty(property_id);
      res.json({
        success: true,
        data: invoices,
        message: `Facturas de la propiedad ${property_id} obtenidas exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las facturas de la propiedad',
        error: error.message
      });
    }
  }

  static async getInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const invoice = await InvoiceModel.findById(id);
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
      }

      res.json({
        success: true,
        data: invoice,
        message: 'Factura obtenida exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la factura',
        error: error.message
      });
    }
  }

  static async createInvoice(req, res) {
    try {
      const invoiceData = req.body;
      const invoiceId = await InvoiceModel.create(invoiceData);
      
      if (invoiceId) {
        const newInvoice = await InvoiceModel.findById(invoiceId);
        res.status(201).json({
          success: true,
          data: newInvoice,
          message: 'Factura creada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al crear la factura'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear la factura',
        error: error.message
      });
    }
  }

  static async updateInvoice(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingInvoice = await InvoiceModel.findById(id);
      if (!existingInvoice) {
        return res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
      }

      const updatedInvoice = await InvoiceModel.update(id, updateData);
      
      if (updatedInvoice) {
        res.json({
          success: true,
          data: updatedInvoice,
          message: 'Factura actualizada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al actualizar la factura'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la factura',
        error: error.message
      });
    }
  }

  static async deleteInvoice(req, res) {
    try {
      const { id } = req.params;

      const existingInvoice = await InvoiceModel.findById(id);
      if (!existingInvoice) {
        return res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
      }

      const deleted = await InvoiceModel.delete(id);
      
      if (deleted) {
        res.json({
          success: true,
          message: 'Factura eliminada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al eliminar la factura'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la factura',
        error: error.message
      });
    }
  }
}

export default InvoiceController; 