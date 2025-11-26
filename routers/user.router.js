import { Router } from "express";
import UserController from '../controllers/user.controller.js';

/**
 * Router para gestionar las rutas relacionadas con usuarios.
 * Definir las rutas HTTP para el registro, autenticación, actualización
 * y eliminación de usuarios en el sistema.
 */
const router = Router();
const name = '/user';
const nameLogin = '/login';

/**
 * Rutas públicas que no requieren autenticación previa
 */

/**
 * Rutas para operaciones generales de usuarios
 * 
 * POST /user: Registrar un nuevo usuario en el sistema
 * GET /user: Obtener la lista de todos los usuarios activos
 */
router.route(name)
  .post(UserController.register) 
  .get(UserController.show);

/**
 * Rutas para operaciones específicas de usuario por ID
 * 
 * GET /user/:id: Obtener la información de un usuario específico
 * PUT /user/:id: Actualiza la información de un usuario existente
 * DELETE /user/:id: Elimina un usuario del sistema
 */
router.route(`${name}/:id`)
  .get(UserController.findById)
  .put(UserController.update)
  .delete(UserController.delete);

/**
 * Ruta de autenticación
 * 
 * POST /login: Autentica un usuario y devuelve un token JWT
 */
router.route(nameLogin)
  .post(UserController.login);

export default router;