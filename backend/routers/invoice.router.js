import express from 'express';
import InvoiceController from '../controllers/invoice.controller.js';

const router = express.Router();

router.get('/invoice', InvoiceController.getAllInvoices);
router.get('/invoice/user/:user_id', InvoiceController.getInvoicesByUser);
router.get('/invoice/property/:property_id', InvoiceController.getInvoicesByProperty);
router.get('/invoice/:id', InvoiceController.getInvoiceById);
router.post('/invoice', InvoiceController.createInvoice);
router.put('/invoice/:id', InvoiceController.updateInvoice);
router.delete('/invoice/:id', InvoiceController.deleteInvoice);

export default router; 