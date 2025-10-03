import PaymentModel from '../models/payment.model.js';
import dotenv from 'dotenv';
dotenv.config();

class PaymentController {

  async create(req, res) {
    try {
      console.log('=== PAYMENT CREATE ===');
      console.log('Received request body:', req.body);
      
      const { 
        user_id, 
        amount_paid, 
        payment_date, 
        method, 
        reference, 
        invoice_id, 
        reservation_id, 
        parking_assignment_id, 
        status_id, 
        payment_type_id 
      } = req.body;
  
      // Validación básica
      if (!user_id || !amount_paid || !payment_date) {
        console.log('Validation failed: missing required fields');
        return res.status(400).json({ 
          error: 'Required fields are missing (user_id, amount_paid, payment_date)',
          received: { user_id, amount_paid, payment_date }
        });
      }
  
      // Validación adicional
      if (amount_paid <= 0) {
        console.log('Validation failed: amount_paid <= 0');
        return res.status(400).json({
          error: 'The amount paid must be greater than 0'
        });
      }
  
      console.log('About to call PaymentModel.create with:', {
        user_id,
        amount_paid,
        payment_date,
        method,
        reference,
        invoice_id,
        reservation_id,
        parking_assignment_id,
        status_id,
        payment_type_id
      });
  
      const paymentId = await PaymentModel.create({
        user_id,
        amount_paid,
        payment_date,
        method,
        reference,
        invoice_id,
        reservation_id,
        parking_assignment_id,
        status_id,
        payment_type_id
      });
  
      console.log('PaymentModel.create returned:', paymentId);
  
      res.status(201).json({
        message: 'Payment created successfully',
        id: paymentId
      });
    } catch (error) {
      console.error('=== PAYMENT CREATE ERROR ===');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      console.error('Stack:', error.stack);
      
      // Manejo específico de errores de DB
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({ 
          error: 'Database table not found',
          debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(500).json({ 
          error: 'Database column not found',
          debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(500).json({ 
          error: 'Database connection failed',
          debug: process.env.NODE_ENV === 'development' ? 'MySQL server is not running' : undefined
        });
      }

      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async show(req, res) {
    try {
      console.log('=== PAYMENT SHOW ===');
      console.log('Fetching all active payments...');
      
      // Get all active payments
      const payments = await PaymentModel.showActive();
      
      console.log('Payments retrieved:', payments?.length || 0, 'records');
      
      res.status(200).json({
        message: 'Payments retrieved successfully',
        data: payments || [],
        count: payments?.length || 0
      });
    } catch (error) {
      console.error('=== PAYMENT SHOW ERROR ===');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      console.error('SQL:', error.sql);
      
      // Manejo específico de errores de DB
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({ 
          error: 'Database table not found',
          details: 'One or more tables referenced in the query do not exist',
          debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(500).json({ 
          error: 'Database column not found',
          details: 'One or more columns referenced in the query do not exist',
          debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(500).json({ 
          error: 'Database connection failed',
          details: 'Cannot connect to MySQL server',
          debug: process.env.NODE_ENV === 'development' ? 'Check if MySQL is running on port 3306' : undefined
        });
      }

      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async update(req, res) {
    try {
      console.log('=== PAYMENT UPDATE ===');
      console.log('Request params:', req.params);
      console.log('Request body:', req.body);
      
      const { 
        user_id, 
        amount_paid, 
        payment_date, 
        method, 
        reference, 
        invoice_id, 
        reservation_id, 
        parking_assignment_id, 
        status_id, 
        payment_type_id 
      } = req.body;
      const id = req.params.id;

      // Basic validation
      if (!user_id || !amount_paid || !payment_date || !id) {
        return res.status(400).json({ 
          error: 'Required fields are missing',
          required: ['id (in params)', 'user_id', 'amount_paid', 'payment_date'],
          received: { id, user_id, amount_paid, payment_date }
        });
      }

      // Verify if the Payment exists  
      console.log('Checking if payment exists with ID:', id);
      const existingPayment = await PaymentModel.findByIdActive(id);
      if (!existingPayment) {
        console.log('Payment not found with ID:', id);
        return res.status(404).json({ error: 'Payment not found' });
      }

      // Validación adicional
      if (amount_paid <= 0) {
        return res.status(400).json({
          error: 'The amount paid must be greater than 0'
        });
      }

      console.log('Updating payment with ID:', id);
      const updatedPayment = await PaymentModel.update(id, {
        user_id,
        amount_paid,
        payment_date,
        method,
        reference,
        invoice_id,
        reservation_id,
        parking_assignment_id,
        status_id,
        payment_type_id
      });

      console.log('Payment updated successfully:', updatedPayment);
      res.status(200).json({
        message: 'Payment updated successfully',
        data: updatedPayment
      });
    } catch (error) {
      console.error('=== PAYMENT UPDATE ERROR ===');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async delete(req, res) {
    try {
      console.log('=== PAYMENT DELETE ===');
      console.log('Request params:', req.params);
      
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(400).json({ 
          error: 'Required fields are missing',
          required: ['id (in params)']
        });
      }

      // Verify if payment exists before deleting
      console.log('Checking if payment exists with ID:', id);
      const existingPayment = await PaymentModel.findByIdActive(id);
      if (!existingPayment) {
        console.log('Payment not found with ID:', id);
        return res.status(404).json({ error: 'Payment not found' });
      }

      // Delete payment
      console.log('Deleting payment with ID:', id);
      const deletedPayment = await PaymentModel.delete(id);
      
      console.log('Payment deleted successfully:', deletedPayment);
      res.status(200).json({
        message: 'Payment deleted successfully',
        data: deletedPayment
      });
    } catch (error) {
      console.error('=== PAYMENT DELETE ERROR ===');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async findById(req, res) {
    try {
      console.log('=== PAYMENT FIND BY ID ===');
      console.log('Request params:', req.params);
      
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(400).json({ 
          error: 'Required fields are missing',
          required: ['id (in params)']
        });
      }

      // Get payment by ID
      console.log('Finding payment with ID:', id);
      const existingPayment = await PaymentModel.findByIdActive(id);
      if (!existingPayment) {
        console.log('Payment not found with ID:', id);
        return res.status(404).json({ error: 'Payment not found' });
      }

      console.log('Payment found:', existingPayment);
      res.status(200).json({
        message: 'Payment found successfully',
        data: existingPayment
      });
    } catch (error) {
      console.error('=== PAYMENT FIND BY ID ERROR ===');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async findByUserId(req, res) {
    try {
      console.log('=== PAYMENT FIND BY USER ID ===');
      console.log('Request params:', req.params);
      
      const userId = req.params.userId;
      // Basic validate
      if (!userId) {
        return res.status(400).json({ 
          error: 'User ID is required',
          required: ['userId (in params)']
        });
      }

      // Get payments by user ID
      console.log('Finding payments for user ID:', userId);
      const userPayments = await PaymentModel.findByUserId(userId);
      
      console.log('Found payments for user:', userPayments?.length || 0, 'records');
      res.status(200).json({
        message: 'User payments retrieved successfully',
        data: userPayments || [],
        count: userPayments?.length || 0
      });
    } catch (error) {
      console.error('=== PAYMENT FIND BY USER ID ERROR ===');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async findByDateRange(req, res) {
    try {
      console.log('=== PAYMENT FIND BY DATE RANGE ===');
      console.log('Request query:', req.query);
      
      const { startDate, endDate } = req.query;
      
      // Basic validate
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          error: 'Start date and end date are required',
          required: ['startDate (query param)', 'endDate (query param)'],
          received: { startDate, endDate }
        });
      }

      // Get payments by date range
      console.log('Finding payments between:', startDate, 'and', endDate);
      const paymentsInRange = await PaymentModel.findByDateRange(startDate, endDate);
      
      console.log('Found payments in range:', paymentsInRange?.length || 0, 'records');
      res.status(200).json({
        message: 'Payments in date range retrieved successfully',
        data: paymentsInRange || [],
        count: paymentsInRange?.length || 0,
        dateRange: { startDate, endDate }
      });
    } catch (error) {
      console.error('=== PAYMENT FIND BY DATE RANGE ERROR ===');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async findByStatus(req, res) {
    try {
      console.log('=== PAYMENT FIND BY STATUS ===');
      console.log('Request params:', req.params);
      
      const statusId = req.params.statusId;
      // Basic validate
      if (!statusId) {
        return res.status(400).json({ 
          error: 'Status ID is required',
          required: ['statusId (in params)']
        });
      }

      // Get payments by status
      console.log('Finding payments with status ID:', statusId);
      const paymentsByStatus = await PaymentModel.findByStatus(statusId);
      
      console.log('Found payments by status:', paymentsByStatus?.length || 0, 'records');
      res.status(200).json({
        message: 'Payments by status retrieved successfully',
        data: paymentsByStatus || [],
        count: paymentsByStatus?.length || 0
      });
    } catch (error) {
      console.error('=== PAYMENT FIND BY STATUS ERROR ===');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getTotalAmountByUser(req, res) {
    try {
      console.log('=== PAYMENT GET TOTAL AMOUNT BY USER ===');
      console.log('Request params:', req.params);
      
      const userId = req.params.userId;
      // Basic validate
      if (!userId) {
        return res.status(400).json({ 
          error: 'User ID is required',
          required: ['userId (in params)']
        });
      }

      // Get total amount paid by user
      console.log('Getting total amount for user ID:', userId);
      const totalAmount = await PaymentModel.getTotalAmountByUser(userId);
      
      console.log('Total amount for user:', totalAmount);
      res.status(200).json({
        message: 'Total amount by user retrieved successfully',
        data: { userId, totalAmount: totalAmount || 0 }
      });
    } catch (error) {
      console.error('=== PAYMENT GET TOTAL AMOUNT BY USER ERROR ===');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // MÉTODOS ADICIONALES PARA LAS NUEVAS RUTAS
  
  async showAll(req, res) {
    try {
      console.log('=== PAYMENT SHOW ALL ===');
      console.log('Fetching ALL payments (including inactive)...');
      
      const payments = await PaymentModel.show();
      
      console.log('All payments retrieved:', payments?.length || 0, 'records');
      
      res.status(200).json({
        message: 'All payments retrieved successfully',
        data: payments || [],
        count: payments?.length || 0
      });
    } catch (error) {
      console.error('=== PAYMENT SHOW ALL ERROR ===');
      console.error('Error:', error.message);
      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async findByReference(req, res) {
    try {
      console.log('=== PAYMENT FIND BY REFERENCE ===');
      console.log('Request params:', req.params);
      
      const reference = req.params.reference;
      if (!reference) {
        return res.status(400).json({ 
          error: 'Reference is required',
          required: ['reference (in params)']
        });
      }

      console.log('Finding payment with reference:', reference);
      const payment = await PaymentModel.findByReference(reference);
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found with this reference' });
      }

      res.status(200).json({
        message: 'Payment found successfully',
        data: payment
      });
    } catch (error) {
      console.error('=== PAYMENT FIND BY REFERENCE ERROR ===');
      console.error('Error:', error.message);
      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async findByInvoiceId(req, res) {
    try {
      console.log('=== PAYMENT FIND BY INVOICE ID ===');
      console.log('Request params:', req.params);
      
      const invoiceId = req.params.invoiceId;
      if (!invoiceId) {
        return res.status(400).json({ 
          error: 'Invoice ID is required',
          required: ['invoiceId (in params)']
        });
      }

      console.log('Finding payments for invoice ID:', invoiceId);
      const payments = await PaymentModel.findByInvoiceId(invoiceId);
      
      res.status(200).json({
        message: 'Payments for invoice retrieved successfully',
        data: payments || [],
        count: payments?.length || 0
      });
    } catch (error) {
      console.error('=== PAYMENT FIND BY INVOICE ID ERROR ===');
      console.error('Error:', error.message);
      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async findByReservationId(req, res) {
    try {
      console.log('=== PAYMENT FIND BY RESERVATION ID ===');
      console.log('Request params:', req.params);
      
      const reservationId = req.params.reservationId;
      if (!reservationId) {
        return res.status(400).json({ 
          error: 'Reservation ID is required',
          required: ['reservationId (in params)']
        });
      }

      console.log('Finding payments for reservation ID:', reservationId);
      const payments = await PaymentModel.findByReservationId(reservationId);
      
      res.status(200).json({
        message: 'Payments for reservation retrieved successfully',
        data: payments || [],
        count: payments?.length || 0
      });
    } catch (error) {
      console.error('=== PAYMENT FIND BY RESERVATION ID ERROR ===');
      console.error('Error:', error.message);
      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getPaymentStats(req, res) {
    try {
      console.log('=== PAYMENT GET STATS ===');
      
      const stats = await PaymentModel.getPaymentStats();
      
      console.log('Payment stats retrieved:', stats);
      res.status(200).json({
        message: 'Payment statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('=== PAYMENT GET STATS ERROR ===');
      console.error('Error:', error.message);
      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // MÉTODO TEMPORAL PARA TESTING (REMOVER EN PRODUCCIÓN)
  async testTables(req, res) {
    try {
      console.log('=== PAYMENT TEST TABLES ===');
      
      await PaymentModel.testTableStructures();
      
      res.status(200).json({
        message: 'Table structures tested - check console for details',
        note: 'This is a development endpoint, remove in production'
      });
    } catch (error) {
      console.error('=== PAYMENT TEST TABLES ERROR ===');
      console.error('Error:', error.message);
      res.status(500).json({ 
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default new PaymentController();