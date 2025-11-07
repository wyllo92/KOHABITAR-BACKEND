import { Router } from "express";
import PaymentController from '../controllers/payment.controller.js';

const router = Router();
const name = '/payment';

// ==================== MAIN ROUTES ====================

// Create new payment and show all payments
router.route(name)
  .post(PaymentController.create)    // POST /payment - Create a new payment
  .get(PaymentController.show);      // GET /payment - Show all payments

// ==================== SPECIFIC SEARCH ROUTES (MUST BE BEFORE /:id) ====================

// Get payment statistics
router.route(`${name}/stats`)
  .get(PaymentController.getPaymentStats); // GET /payment/stats

// Get payments by date range
router.route(`${name}/daterange`)
  .get(PaymentController.findByDateRange); // GET /payment/daterange?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

// Get payments by reference
router.route(`${name}/reference/:reference`)
  .get(PaymentController.findByReference); // GET /payment/reference/:reference

// Get payments by user ID
router.route(`${name}/user/:userId`)
  .get(PaymentController.findByUserId); // GET /payment/user/:userId

// Get total amount by user
router.route(`${name}/user/:userId/total`)
  .get(PaymentController.getTotalAmountByUser); // GET /payment/user/:userId/total

// ==================== PAYMENT BY ID ROUTES (MUST BE LAST) ====================

// Payment by ID routes
router.route(`${name}/:id`)
  .get(PaymentController.findById)   // GET /payment/:id - Show a payment by ID
  .put(PaymentController.update)     // PUT /payment/:id - Update a payment by ID
  .delete(PaymentController.delete); // DELETE /payment/:id - Delete a payment by ID

export default router;