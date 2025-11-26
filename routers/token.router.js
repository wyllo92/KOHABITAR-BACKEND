import { Router } from "express";
import { verifyToken } from "../controllers/token.controller.js";

/**
 * Router para gestionar las rutas relacionadas con la validación de tokens.
 * Definir rutas para verificar la validez de los tokens de autenticación.
 */
const router = Router();

/**
 * Ruta base para la validación de tokens.
 */
const name = '/validate-token';

/**
 * Definir una ruta POST para validar tokens.
 * Cuando se realiza una petición POST a '/validate-token', se ejecuta
 * el controlador verifyToken para verificar si el token proporcionado es válido.
 */
router.post(name, verifyToken);

export default router;
