import express from 'express';
import InvoiceController from '../controllers/invoice.controller.js';

const router = express.Router();

// Rutas para invoice
router.get('/', InvoiceController.getAllInvoices);
router.get('/user/:user_id', InvoiceController.getInvoicesByUser);
router.get('/property/:property_id', InvoiceController.getInvoicesByProperty);
router.get('/:id', InvoiceController.getInvoiceById);
router.post('/', InvoiceController.createInvoice);
router.put('/:id', InvoiceController.updateInvoice);
router.delete('/:id', InvoiceController.deleteInvoice);

export default router; 