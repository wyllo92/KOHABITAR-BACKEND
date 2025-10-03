import { Router } from "express";
import PaymentController from '../controllers/payment.controller.js';

const router = Router();
const name = '/payment';

// ==================== MAIN ROUTES ====================

// Create new payment
router.route(name)
  .post(PaymentController.create)    // POST /payment - Create a new payment
  .get(PaymentController.show);      // GET /payment - Show all ACTIVE payments

// Payment by ID routes
router.route(`${name}/:id`)
  .get(PaymentController.findById)   // GET /payment/:id - Show a payment by ID
  .put(PaymentController.update)     // PUT /payment/:id - Update a payment by ID
  .delete(PaymentController.delete); // DELETE /payment/:id - Delete a payment by ID

// ==================== SPECIFIC SEARCH ROUTES ====================

// Get payments by user ID
router.route(`${name}/user/:userId`)
  .get(PaymentController.findByUserId); // GET /payment/user/:userId

// Get total amount by user
router.route(`${name}/user/:userId/total`)
  .get(PaymentController.getTotalAmountByUser); // GET /payment/user/:userId/total

// Get payments by status
router.route(`${name}/status/:statusId`)
  .get(PaymentController.findByStatus); // GET /payment/status/:statusId

// Get payments by date range
router.route(`${name}/daterange`)
  .get(PaymentController.findByDateRange); // GET /payment/daterange?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

// ==================== OPTIONAL: ADDITIONAL ROUTES ====================

// Get ALL payments (including inactive) - opcional
router.route(`${name}/all`)
  .get(PaymentController.showAll); // GET /payment/all - Show ALL payments (need to create this method)

// Get payments by reference
router.route(`${name}/reference/:reference`)
  .get(PaymentController.findByReference); // GET /payment/reference/:reference (need to create this method)

// Get payments by invoice ID
router.route(`${name}/invoice/:invoiceId`)
  .get(PaymentController.findByInvoiceId); // GET /payment/invoice/:invoiceId (need to create this method)

// Get payments by reservation ID  
router.route(`${name}/reservation/:reservationId`)
  .get(PaymentController.findByReservationId); // GET /payment/reservation/:reservationId (need to create this method)

// Get payment statistics
router.route(`${name}/stats`)
  .get(PaymentController.getPaymentStats); // GET /payment/stats (need to create this method)

// TEMPORARY: Test table structures (remove in production)
router.route(`${name}/test/tables`)
  .get(PaymentController.testTables); // GET /payment/test/tables (need to create this method)

export default router;

/*
AVAILABLE ENDPOINTS:

=== MAIN ROUTES ===
POST   /payment                     - Create new payment
GET    /payment                     - Get all ACTIVE payments
GET    /payment/:id                 - Get payment by ID
PUT    /payment/:id                 - Update payment by ID
DELETE /payment/:id                 - Delete payment by ID

=== SEARCH ROUTES ===
GET    /payment/user/:userId        - Get payments by user ID
GET    /payment/user/:userId/total  - Get total amount by user ID
GET    /payment/status/:statusId    - Get payments by status ID
GET    /payment/daterange           - Get payments by date range (query: startDate, endDate)

=== OPTIONAL ROUTES ===
GET    /payment/all                 - Get ALL payments (including inactive)
GET    /payment/reference/:ref      - Get payment by reference
GET    /payment/invoice/:invoiceId  - Get payments by invoice ID
GET    /payment/reservation/:resId  - Get payments by reservation ID
GET    /payment/stats               - Get payment statistics
GET    /payment/test/tables         - Test table structures (DEVELOPMENT ONLY)

=== EXAMPLES ===
GET /payment
GET /payment/123
GET /payment/user/456
GET /payment/user/456/total
GET /payment/status/1
GET /payment/daterange?startDate=2024-01-01&endDate=2024-12-31
*/