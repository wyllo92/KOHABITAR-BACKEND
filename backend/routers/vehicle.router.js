import { Router } from "express";
import VehicleController from '../controllers/vehicle.controller.js';
const router = Router();
const name = '/vehicle';

// Rutas agrupadas para vehículos
router.route(name)
  .get(VehicleController.show)
  .post(VehicleController.createVehicle);

router.route(`${name}/user/:user_id`)
  .get(VehicleController.getVehiclesByUserId);

router.route(`${name}/property/:property_id`)
  .get(VehicleController.getVehiclesByPropertyId);

router.route(`${name}/type/:type`)
  .get(VehicleController.getVehiclesByType);

router.route(`${name}/:id`)
  .get(VehicleController.findById)
  .put(VehicleController.updateVehicle)
  .delete(VehicleController.deleteVehicle);

export default router; 