import express from 'express';
import PaymentController from '../controllers/payment.controller.js';

const router = express.Router();

router.get('/payment', PaymentController.getAllPayments);
router.get('/payment/invoice/:invoice_id', PaymentController.getPaymentsByInvoice);
router.get('/payment/user/:user_id', PaymentController.getPaymentsByUser);
router.get('/payment/:id', PaymentController.getPaymentById);
router.post('/payment', PaymentController.createPayment);
router.put('/payment/:id', PaymentController.updatePayment);
router.delete('/payment/:id', PaymentController.deletePayment);

export default router; 