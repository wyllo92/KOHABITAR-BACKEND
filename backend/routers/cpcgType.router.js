import { Router } from 'express';
import CpcgTypeController from '../controllers/cpcgType.controller.js';

const router = Router();

router.route('/cpcgType')
  .get(CpcgTypeController.show);

export default router;
