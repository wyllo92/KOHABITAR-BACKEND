import PaymentModel from '../models/payment.model.js';

class PaymentController {
  
  static async getAllPayments(req, res) {
    try {
      const payments = await PaymentModel.show();
      res.json({
        success: true,
        data: payments,
        message: 'Pagos obtenidos exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pagos',
        error: error.message
      });
    }
  }

  static async getPaymentsByInvoice(req, res) {
    try {
      const { invoice_id } = req.params;
      const payments = await PaymentModel.findByInvoice(invoice_id);
      res.json({
        success: true,
        data: payments,
        message: `Pagos de la factura ${invoice_id} obtenidos exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pagos de la factura',
        error: error.message
      });
    }
  }

  static async getPaymentsByUser(req, res) {
    try {
      const { user_id } = req.params;
      const payments = await PaymentModel.findByUser(user_id);
      res.json({
        success: true,
        data: payments,
        message: `Pagos del usuario ${user_id} obtenidos exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pagos del usuario',
        error: error.message
      });
    }
  }

  static async getPaymentById(req, res) {
    try {
      const { id } = req.params;
      const payment = await PaymentModel.findById(id);
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      res.json({
        success: true,
        data: payment,
        message: 'Pago obtenido exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el pago',
        error: error.message
      });
    }
  }

  static async createPayment(req, res) {
    try {
      const paymentData = req.body;
      const paymentId = await PaymentModel.create(paymentData);
      
      if (paymentId) {
        const newPayment = await PaymentModel.findById(paymentId);
        res.status(201).json({
          success: true,
          data: newPayment,
          message: 'Pago creado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al crear el pago'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el pago',
        error: error.message
      });
    }
  }

  static async updatePayment(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingPayment = await PaymentModel.findById(id);
      if (!existingPayment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      const updatedPayment = await PaymentModel.update(id, updateData);
      
      if (updatedPayment) {
        res.json({
          success: true,
          data: updatedPayment,
          message: 'Pago actualizado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al actualizar el pago'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el pago',
        error: error.message
      });
    }
  }

  static async deletePayment(req, res) {
    try {
      const { id } = req.params;

      const existingPayment = await PaymentModel.findById(id);
      if (!existingPayment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      const deleted = await PaymentModel.delete(id);
      
      if (deleted) {
        res.json({
          success: true,
          message: 'Pago eliminado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al eliminar el pago'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el pago',
        error: error.message
      });
    }
  }
}

export default PaymentController; 