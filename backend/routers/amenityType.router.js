import express from 'express';
import AmenityTypeController from '../controllers/amenityType.controller.js';

const router = express.Router();

router.get('/amenityType', AmenityTypeController.getAll);
router.get('/amenityType/active', AmenityTypeController.getActive);

export default router; 