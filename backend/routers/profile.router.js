import { Router } from "express";
import ProfileController from "../controllers/profile.controller.js";
import upload from "../config/multer.js";
const router = Router();
const name = '/profile';

// Public route

router.route(name)
  .post(ProfileController.register) // Register a new profile
  .get(ProfileController.show);// Show all profiles

router.route(`${name}/:id`)
  .get(ProfileController.findById)// Show a profile by ID
  // Usar multer para procesar multipart/form-data en la actualización (campo 'profile_photo')
  .put(upload.single('profile_photo'), ProfileController.update)// Update a profile by ID
  .delete(ProfileController.delete);// Delete a profile by ID

export default router;