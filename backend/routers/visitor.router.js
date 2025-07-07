import { Router } from "express";
import VisitorController from '../controllers/visitor.controller.js';
const router = Router();
const name = '/visitor';
// Public route

router.route(name)
    .post(VisitorController.register) // Register a new visitor
    .get(VisitorController.show);// Show all visitors

router.route(`${name}/:id`)
    .get(VisitorController.findById)// Show a visitor by ID
    .put(VisitorController.update)// Update a visitor by ID
    .delete(VisitorController.delete);// Delete a visitor by ID

export default router;