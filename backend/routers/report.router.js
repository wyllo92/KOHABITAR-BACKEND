import { Router } from "express";
import ReportController from '../controllers/report.controller.js';
const router = Router();
const name = '/report';
// Public route

router.route(name)
    .post(ReportController.register) // Register a new report
    .get(ReportController.show);// Show all reports

router.route(`${name}/:id`)
    .get(ReportController.findById)// Show a report by ID
    .put(ReportController.update)// Update a report by ID
    .delete(ReportController.delete);// Delete a report by ID

export default router;