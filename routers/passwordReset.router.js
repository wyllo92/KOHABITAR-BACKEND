import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import PasswordResetController from '../controllers/passwordReset.controller.js';

/**
 * Router para gestionar el restablecimiento de contraseñas.
 * Definir las rutas HTTP para solicitar, validar y restablecer contraseñas.
 *
 * IMPORTANTE: Estos endpoints NO requieren autenticación (excepto el de limpieza)
 * porque el usuario no tiene acceso a su cuenta cuando olvida su contraseña.
 */
const router = Router();
const baseRoute = '/password-reset';

/**
 * POST /password-reset/request
 * Solicita un restablecimiento de contraseña.
 * El usuario proporciona su email y recibe un enlace por correo.
 *
 * Ejemplo de body:
 * {
 *   "email": "usuario@example.com"
 * }
 *
 * Respuesta exitosa:
 * {
 *   "success": true,
 *   "message": "Se ha enviado un enlace de restablecimiento al correo...",
 *   "data": {
 *     "token": "abc123...", // Solo para pruebas, quitar en producción
 *     "expires_at": "2025-11-03T22:00:00.000Z",
 *     "email": "usuario@example.com"
 *   }
 * }
 */
router.post(`${baseRoute}/request`, PasswordResetController.requestPasswordReset);

/**
 * GET /password-reset/validate/:token
 * Valida si un token de restablecimiento es válido.
 * Útil para verificar el token antes de mostrar el formulario de nueva contraseña.
 *
 * Ejemplo de uso:
 * GET /password-reset/validate/abc123xyz456...
 *
 * Respuesta si es válido:
 * {
 *   "success": true,
 *   "message": "Token válido. Puedes proceder a restablecer tu contraseña",
 *   "data": {
 *     "username": "usuario1",
 *     "email": "usuario@example.com"
 *   }
 * }
 *
 * Respuesta si es inválido:
 * {
 *   "success": false,
 *   "message": "Token inválido o expirado",
 *   "error": "Este token ha expirado. Por favor, solicita un nuevo enlace..."
 * }
 */
router.get(`${baseRoute}/validate/:token`, PasswordResetController.validateToken);

/**
 * POST /password-reset/reset
 * Restablece la contraseña del usuario.
 * El usuario proporciona el token y su nueva contraseña.
 *
 * Ejemplo de body:
 * {
 *   "token": "abc123xyz456...",
 *   "new_password": "nuevaContraseñaSegura123"
 * }
 *
 * Respuesta exitosa:
 * {
 *   "success": true,
 *   "message": "¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión con tu nueva contraseña"
 * }
 */
router.post(`${baseRoute}/reset`, PasswordResetController.resetPassword);

/**
 * DELETE /password-reset/clean
 * Limpia tokens expirados de la base de datos.
 * Endpoint administrativo que requiere autenticación.
 *
 * NOTA: Este endpoint SÍ requiere autenticación porque es solo para administradores.
 *
 * Respuesta:
 * {
 *   "success": true,
 *   "message": "Se eliminaron 5 token(s) expirado(s)",
 *   "data": {
 *     "deleted_count": 5
 *   }
 * }
 */
router.delete(`${baseRoute}/clean`, verifyToken, PasswordResetController.cleanExpiredTokens);

export default router;
