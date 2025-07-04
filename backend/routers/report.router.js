import express from 'express';
import ReportController from '../controllers/report.controller.js';

const router = express.Router();

router.get('/report', ReportController.show);
router.get('/report/:id', ReportController.findById);
router.post('/report', ReportController.register);
router.put('/report/:id', ReportController.update);
router.delete('/report/:id', ReportController.delete);

export default router;