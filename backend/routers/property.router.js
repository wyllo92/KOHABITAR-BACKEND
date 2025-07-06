import { Router } from "express";
import PropertyController from '../controllers/property.controller.js';
const router = Router();
const name = '/property';
const nameSearch = '/property/search';
const nameType = '/property/type';
// Public route

router.route(name)
    .post(PropertyController.register) // Register a new property
    .get(PropertyController.show);// Show all properties

// Search route - Must come before /:id route to avoid conflicts
router.route(nameSearch)
    .get(PropertyController.searchPropertiesByName);// Search properties by name

// Type route - Must come before /:id route to avoid conflicts
router.route(`${nameType}/:type`)
    .get(PropertyController.getPropertiesByType);// Get properties by type

// ID-based routes - Must come last to avoid conflicts with specific routes
router.route(`${name}/:id`)
    .get(PropertyController.findById)// Show a property by ID
    .put(PropertyController.update)// Update a property by ID
    .delete(PropertyController.delete);// Delete a property by ID

export default router;