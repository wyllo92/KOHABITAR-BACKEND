import { Router } from "express";
import PqrsController from '../controllers/cpcg.controller.js';

const router = Router();
const name = '/pqrs';

// Main PQRS routes
router.route(name)
  .post(PqrsController.create) // Create a new PQRS
  .get(PqrsController.show);   // Show all active PQRS

router.route(`${name}/:id`)
  .get(PqrsController.findById)    // Show a PQRS by ID
  .put(PqrsController.update)      // Update a PQRS by ID
  .delete(PqrsController.delete);  // Delete a PQRS by ID (soft delete)

// Search routes by different criteria
router.route(`${name}/user/:userId`)
  .get(PqrsController.findByUserId); // Get PQRS by user ID

router.route(`${name}/property/:propertyId`)
  .get(PqrsController.findByPropertyId); // Get PQRS by property ID

router.route(`${name}/type/:typeId`)
  .get(PqrsController.findByType); // Get PQRS by type ID

router.route(`${name}/status/:statusId`)
  .get(PqrsController.findByStatus); // Get PQRS by status ID

// Status update route
router.route(`${name}/:id/status`)
  .patch(PqrsController.updateStatus); // Update only the status of a PQRS

export default router;