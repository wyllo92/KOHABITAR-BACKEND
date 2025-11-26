import PasswordResetModel from '../models/passwordReset.model.js';

/**
 * Controlador para gestionar el restablecimiento de contraseñas.
 * Expone endpoints HTTP para que los usuarios puedan restablecer sus contraseñas.
 *
 * ENDPOINTS DISPONIBLES:
 * 1. POST /password-reset/request - Solicitar restablecimiento
 * 2. GET /password-reset/validate/:token - Validar token
 * 3. POST /password-reset/reset - Restablecer contraseña
 */
class PasswordResetController {
  /**
   * Endpoint 1: Solicitar restablecimiento de contraseña
   * El usuario proporciona su email y recibe un enlace por correo.
   *
   * Body esperado:
   * {
   *   "email": "usuario@example.com"
   * }
   *
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      // VALIDACIÓN 1: Verificar que se envió un email
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar un correo electrónico'
        });
      }

      // VALIDACIÓN 2: Verificar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'El formato del correo electrónico no es válido'
        });
      }

      // PASO 1: Generar token de restablecimiento
      const resetData = await PasswordResetModel.requestPasswordReset(email);

      // PASO 2: Aquí deberías enviar el email
      // Por ahora, solo devolvemos el token (en producción NO se debe devolver)
      // TODO: Integrar servicio de email (nodemailer, sendgrid, etc.)

      // EJEMPLO de cómo se vería el enlace en el email:
      // https://tuapp.com/reset-password?token=abc123xyz...

      res.status(200).json({
        success: true,
        message: `Se ha enviado un enlace de restablecimiento al correo ${email}. El enlace es válido por 1 hora`,
        // IMPORTANTE: En producción, NO devuelvas el token en la respuesta
        // Solo lo incluimos aquí para pruebas
        data: {
          token: resetData.token, // QUITAR en producción
          expires_at: resetData.expires_at,
          email: resetData.email
        }
      });
    } catch (error) {
      // Si el error es porque el email no existe, usar código 404
      const statusCode = error.message.includes('No se encontró')
        ? 404
        : 500;

      res.status(statusCode).json({
        success: false,
        message: 'Error al solicitar restablecimiento de contraseña',
        error: error.message
      });
    }
  }

  /**
   * Endpoint 2: Validar si un token es válido
   * Verificar que el token exista, no esté usado y no haya expirado.
   * Útil para mostrar el formulario de nueva contraseña solo si el token es válido.
   *
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async validateToken(req, res) {
    try {
      const { token } = req.params;

      // VALIDACIÓN: Verificar que se envió un token
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar un token'
        });
      }

      // PASO 1: Validar el token
      const userData = await PasswordResetModel.validateToken(token);

      res.status(200).json({
        success: true,
        message: 'Token válido. Puedes proceder a restablecer tu contraseña',
        data: {
          username: userData.username,
          email: userData.email
        }
      });
    } catch (error) {
      // Todos los errores de validación de token son 400 (Bad Request)
      res.status(400).json({
        success: false,
        message: 'Token inválido o expirado',
        error: error.message
      });
    }
  }

  /**
   * Endpoint 3: Restablecer contraseña
   * El usuario proporciona el token y su nueva contraseña.
   *
   * Body esperado:
   * {
   *   "token": "abc123xyz...",
   *   "new_password": "nuevaContraseñaSegura123"
   * }
   *
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async resetPassword(req, res) {
    try {
      const { token, new_password } = req.body;

      // VALIDACIÓN 1: Verificar que se enviaron los datos requeridos
      if (!token || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar el token y la nueva contraseña'
        });
      }

      // VALIDACIÓN 2: Verificar longitud mínima de contraseña
      if (new_password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
      }

      // PASO 1: Restablecer la contraseña
      await PasswordResetModel.resetPassword(token, new_password);

      res.status(200).json({
        success: true,
        message: '¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión con tu nueva contraseña'
      });
    } catch (error) {
      // Si el error es de validación del token, usar código 400
      const statusCode = error.message.includes('Token') ||
                        error.message.includes('token') ||
                        error.message.includes('contraseña')
        ? 400
        : 500;

      res.status(statusCode).json({
        success: false,
        message: 'Error al restablecer contraseña',
        error: error.message
      });
    }
  }

  /**
   * Endpoint extra : Limpiar tokens expirados
   * Endpoint administrativo para mantener la base de datos limpia.
   * Solo debería ser accesible por administradores.
   *
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async cleanExpiredTokens(req, res) {
    try {
      const deletedCount = await PasswordResetModel.cleanExpiredTokens();

      res.status(200).json({
        success: true,
        message: `Se eliminaron ${deletedCount} token(s) expirado(s)`,
        data: { deleted_count: deletedCount }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al limpiar tokens expirados',
        error: error.message
      });
    }
  }
}

export default new PasswordResetController();
