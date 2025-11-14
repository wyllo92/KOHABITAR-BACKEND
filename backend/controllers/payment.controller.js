import PaymentModel from '../models/payment.model.js';
import dotenv from 'dotenv';
dotenv.config();

class PaymentController {
  // === CREAR PAGO ===
  async create(req, res) {
    try {
      console.log('=== PAYMENT CREATE ===');
      console.log('Received request body:', req.body);
      console.log('Received file:', req.file);
      
      const { user_id, amount_paid, payment_date, method, reference } = req.body;

      // Validaciones básicas
      if (!user_id || !amount_paid || !payment_date) {
        return res.status(400).json({
          error: 'Required fields are missing (user_id, amount_paid, payment_date)',
        });
      }

      if (amount_paid <= 0) {
        return res.status(400).json({ error: 'The amount_paid must be greater than 0' });
      }

      // Obtener la ruta de la foto si fue subida
      const payment_photo = req.file ? req.file.path : null;

      const paymentId = await PaymentModel.create({
        user_id,
        amount_paid,
        payment_date,
        payment_photo,
        method,
        reference,
      });

      res.status(201).json({
        message: 'Payment created successfully',
        id: paymentId,
        payment_photo,
      });
    } catch (error) {
      console.error('=== PAYMENT CREATE ERROR ===', error);
      res.status(500).json({
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // === MOSTRAR TODOS LOS PAGOS ===
  async show(req, res) {
    try {
      console.log('=== PAYMENT SHOW ===');
      const payments = await PaymentModel.show();

      res.status(200).json({
        message: 'Payments retrieved successfully',
        data: payments,
        count: payments.length,
      });
    } catch (error) {
      console.error('=== PAYMENT SHOW ERROR ===', error);
      res.status(500).json({
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // === OBTENER PAGO POR ID ===
  async findById(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: 'Payment ID is required' });
      }

      const payment = await PaymentModel.findById(id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.status(200).json({
        message: 'Payment retrieved successfully',
        data: payment,
      });
    } catch (error) {
      console.error('=== PAYMENT FIND BY ID ERROR ===', error);
      res.status(500).json({
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // === ACTUALIZAR PAGO ===
  async update(req, res) {
    try {
      const id = req.params.id;
      const { user_id, amount_paid, payment_date, method, reference } = req.body;

      if (!id || !user_id || !amount_paid || !payment_date) {
        return res.status(400).json({
          error: 'Required fields are missing',
        });
      }

      const existing = await PaymentModel.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      // Si se sube una nueva foto, usar la nueva; si no, mantener la anterior
      const payment_photo = req.file ? req.file.path : existing.payment_photo;

      const updated = await PaymentModel.update(id, {
        user_id,
        amount_paid,
        payment_date,
        payment_photo,
        method,
        reference,
      });

      res.status(200).json({
        message: 'Payment updated successfully',
        data: updated,
      });
    } catch (error) {
      console.error('=== PAYMENT UPDATE ERROR ===', error);
      res.status(500).json({
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // === ACTUALIZAR SOLO LA FOTO DE PAGO ===
  async updatePhoto(req, res) {
    try {
      const id = req.params.id;
      
      if (!id) {
        return res.status(400).json({ error: 'Payment ID is required' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Payment photo is required' });
      }

      const existing = await PaymentModel.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      const payment_photo = req.file.path;
      const updated = await PaymentModel.updatePhoto(id, payment_photo);

      if (!updated) {
        return res.status(500).json({ error: 'Failed to update payment photo' });
      }

      res.status(200).json({
        message: 'Payment photo updated successfully',
        payment_photo,
      });
    } catch (error) {
      console.error('=== PAYMENT UPDATE PHOTO ERROR ===', error);
      res.status(500).json({
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // === ELIMINAR PAGO ===
  async delete(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: 'Payment ID is required' });
      }

      const existing = await PaymentModel.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      const deleted = await PaymentModel.delete(id);
      res.status(200).json({
        message: 'Payment deleted successfully',
        data: deleted,
      });
    } catch (error) {
      console.error('=== PAYMENT DELETE ERROR ===', error);
      res.status(500).json({
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // === OBTENER PAGOS POR USUARIO ===
  async findByUserId(req, res) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const payments = await PaymentModel.findByUserId(userId);
      res.status(200).json({
        message: 'User payments retrieved successfully',
        data: payments,
        count: payments.length,
      });
    } catch (error) {
      console.error('=== PAYMENT FIND BY USER ID ERROR ===', error);
      res.status(500).json({
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // === PAGOS POR RANGO DE FECHAS ===
  async findByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'Start date and end date are required',
        });
      }

      const payments = await PaymentModel.findByDateRange(startDate, endDate);
      res.status(200).json({
        message: 'Payments in date range retrieved successfully',
        data: payments,
        count: payments.length,
      });
    } catch (error) {
      console.error('=== PAYMENT FIND BY DATE RANGE ERROR ===', error);
      res.status(500).json({
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // === BUSCAR POR REFERENCIA ===
  async findByReference(req, res) {
    try {
      const { reference } = req.params;
      if (!reference) {
        return res.status(400).json({ error: 'Reference is required' });
      }

      const payment = await PaymentModel.findByReference(reference);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found with this reference' });
      }

      res.status(200).json({
        message: 'Payment found successfully',
        data: payment,
      });
    } catch (error) {
      console.error('=== PAYMENT FIND BY REFERENCE ERROR ===', error);
      res.status(500).json({
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // === TOTAL PAGADO POR USUARIO ===
  async getTotalAmountByUser(req, res) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const total = await PaymentModel.getTotalAmountByUser(userId);
      res.status(200).json({
        message: 'Total amount by user retrieved successfully',
        data: { userId, totalAmount: total },
      });
    } catch (error) {
      console.error('=== PAYMENT GET TOTAL AMOUNT BY USER ERROR ===', error);
      res.status(500).json({
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // === ESTADÍSTICAS GLOBALES ===
  async getPaymentStats(req, res) {
    try {
      const stats = await PaymentModel.getPaymentStats();
      res.status(200).json({
        message: 'Payment statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      console.error('=== PAYMENT GET STATS ERROR ===', error);
      res.status(500).json({
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}

export default new PaymentController();