import { Router } from 'express';
import ReportController from '../controllers/report.controller.js';

const router = Router();

// GET /report/summary
router.get('/report/summary', ReportController.summary);

export default router;
