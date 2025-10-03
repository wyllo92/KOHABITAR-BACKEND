import { Router } from "express";
import PropertyController from '../controllers/property.controller.js';
const router = Router();
const name = '/property';
const nameSearch = '/property/search';
const nameType = '/property/type';
// Debug: ensure controller exported correctly
console.log('Property router loading - PropertyController keys:', Object.keys(PropertyController || {}));
console.log('PropertyController.show type:', typeof (PropertyController && PropertyController.show));

// Public route
router.route(name)
    .post((req, res) => PropertyController.register(req, res)) // Register a new property
    .get((req, res) => PropertyController.show(req, res)); // Show all properties

// Search route - Must come before /:id route to avoid conflicts
router.route(nameSearch)
    .get((req, res) => PropertyController.searchPropertiesByName ? PropertyController.searchPropertiesByName(req, res) : res.status(501).json({ error: 'Not implemented' })); // Search properties by name

// Type route - Must come before /:id route to avoid conflicts
router.route(`${nameType}/:type`)
    .get((req, res) => PropertyController.getPropertiesByType ? PropertyController.getPropertiesByType(req, res) : res.status(501).json({ error: 'Not implemented' })); // Get properties by type

// ID-based routes - Must come last to avoid conflicts with specific routes
router.route(`${name}/:id`)
    .get((req, res) => PropertyController.findById(req, res))// Show a property by ID
    .put((req, res) => PropertyController.update(req, res))// Update a property by ID
    .delete((req, res) => PropertyController.delete(req, res));// Delete a property by ID

export default router;