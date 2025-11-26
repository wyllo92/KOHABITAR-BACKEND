import { Router } from "express";
import ProfileController from "../controllers/profile.controller.js";
import { verifyToken } from '../middleware/authMiddleware.js';
import upload from '../utils/fileUpload.js';

/**
 * Router para gestionar las rutas relacionadas con perfiles de usuario.
 * Definir las rutas para realizar operaciones CRUD sobre los perfiles
 * y establece la protección de rutas mediante middleware de autenticación.
 */
const router = Router();
const name = '/profiles';

/**
 * Rutas protegidas con middleware de autenticación.
 * Todas estas rutas requieren un token JWT válido para acceder.
 */

/**
 * Rutas básicas para operaciones sobre perfiles.
 * POST: Registrar un nuevo perfil en el sistema.
 * GET: Obtener todos los perfiles registrados.
 */
router.route(name)
  .post(verifyToken, ProfileController.register) // Registrar un nuevo perfil
  .get(verifyToken, ProfileController.show);    // Muestra todos los perfiles

/**
 * Rutas para operaciones sobre un perfil específico identificado por su ID.
 * GET: Obtener los detalles de un perfil específico.
 * PUT: Actualiza los datos de un perfil existente.
 * DELETE: Elimina un perfil del sistema.
 * 
 * @param {string} id - ID del usuario cuyo perfil se manipulará.
 */
router.route(`${name}/:id`)
  .get(verifyToken, ProfileController.findById) // Muestra un perfil por ID
  .put(verifyToken, ProfileController.update)   // Actualiza un perfil por ID
  .delete(verifyToken, ProfileController.delete); // Elimina un perfil por ID

export default router;