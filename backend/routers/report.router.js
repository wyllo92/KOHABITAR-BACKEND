import { Router } from 'express';
import ReportController from '../controllers/report.controller.js';

const router = Router();

// GET /report/summary - Resumen general
router.get('/report/summary', ReportController.summary);

// GET /report/payments-chart - Datos de pagos para gráfico
router.get('/report/payments-chart', ReportController.paymentsChart);

// GET /report/pqrs-chart - Datos de PQRS para gráfico
router.get('/report/pqrs-chart', ReportController.pqrsChart);

// GET /report/full - Reporte completo para exportación
router.get('/report/full', ReportController.fullReport);

export default router;
