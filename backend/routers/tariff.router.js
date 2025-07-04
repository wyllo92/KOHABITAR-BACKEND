import express from 'express';
import TariffController from '../controllers/tariff.controller.js';

const router = express.Router();

router.get('/tariff', TariffController.show);
router.get('/tariff/:id', TariffController.findById);
router.post('/tariff', TariffController.register);
router.put('/tariff/:id', TariffController.update);
router.delete('/tariff/:id', TariffController.delete);

export default router; 