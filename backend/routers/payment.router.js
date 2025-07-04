import express from 'express';
import PaymentController from '../controllers/payment.controller.js';

const router = express.Router();

router.get('/', PaymentController.getAllPayments);
router.get('/invoice/:invoice_id', PaymentController.getPaymentsByInvoice);
router.get('/user/:user_id', PaymentController.getPaymentsByUser);
router.get('/:id', PaymentController.getPaymentById);
router.post('/', PaymentController.createPayment);
router.put('/:id', PaymentController.updatePayment);
router.delete('/:id', PaymentController.deletePayment);

export default router; 