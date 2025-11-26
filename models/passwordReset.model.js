import { connect } from '../config/db/connectMysql.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendPasswordResetEmail } from '../utils/emailService.js';

/**
 * Modelo para gestionar el restablecimiento de contraseñas.
 * Manejar la generación de tokens, validación y actualización de contraseñas.

 * 1. Usuario solicita restablecer → se genera token y se envía email
 * 2. Usuario recibe email con enlace → hace clic
 * 3. Usuario ingresa nueva contraseña → sistema valida token
 * 4. Si token es válido → actualiza contraseña
 */
class PasswordResetModel {
  /**
   * PASO 1: Solicitar restablecimiento de contraseña
   * Genera un token único y lo guarda en la base de datos.
   *
   * @param {string} email - Correo electrónico del usuario
   * @returns {Object} Información del token generado
   * @throws {Error} Si el email no existe en el sistema
   */
  static async requestPasswordReset(email) {
    try {
      // PASO 1.1: Buscar el usuario por su email
      const [users] = await connect.query(`
        SELECT u.user_id, u.username, prof.email, prof.full_name
        FROM users u
        JOIN profiles prof ON u.user_id = prof.user_id
        WHERE prof.email = ?
        AND u.status_id = (SELECT status_id FROM statuses WHERE name = 'Activo' LIMIT 1)
      `, [email]);

      if (users.length === 0) {
        throw new Error('No se encontró ningún usuario activo con este correo electrónico');
      }

      const user = users[0];

      // PASO 1.2: Generar un token único aleatorio
      // crypto.randomBytes genera bytes aleatorios seguros
      // .toString('hex') convierte los bytes a texto hexadecimal
      const token = crypto.randomBytes(32).toString('hex');

      // PASO 1.3: Calcular cuándo expira el token (1 hora desde ahora)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Añade 1 hora

      // PASO 1.4: Guardar el token en la base de datos
      await connect.query(`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (?, ?, ?)
      `, [user.user_id, token, expiresAt]);

      // PASO 1.5: Enviar el email con el enlace de restablecimiento
      try {
        await sendPasswordResetEmail({
          email: user.email,
          fullName: user.full_name,
          token: token
        });
        console.log(`Email de restablecimiento enviado a: ${user.email}`);
      } catch (emailError) {
        console.error('Advertencia: Token generado pero el email no se pudo enviar:', emailError.message);
        // No lanzamos error aquí porque el token ya está creado
        // El usuario puede usar el token si lo obtiene de otra forma (logs, testing, etc.)
      }

      // PASO 1.6: Retornar información del token generado
      return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        token: token,
        expires_at: expiresAt
      };
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      throw error;
    }
  }

  /**
   * PASO 2: Validar si un token es válido
   * Verificar que el token exista, no esté usado y no haya expirado.
   *
   * @param {string} token - Token a validar
   * @returns {Object} Información del usuario si el token es válido
   * @throws {Error} Si el token es inválido, usado o expirado
   */
  static async validateToken(token) {
    try {
      // PASO 2.1: Buscar el token en la base de datos
      const [tokens] = await connect.query(`
        SELECT prt.*, u.username, prof.email, prof.full_name
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.user_id
        JOIN profiles prof ON u.user_id = prof.user_id
        WHERE prt.token = ?
      `, [token]);

      if (tokens.length === 0) {
        throw new Error('Token inválido. Por favor, solicita un nuevo enlace de restablecimiento');
      }

      const tokenData = tokens[0];

      // PASO 2.2: Verificar si el token ya fue usado
      if (tokenData.used === 1) {
        throw new Error('Este token ya fue utilizado. Por favor, solicita un nuevo enlace de restablecimiento');
      }

      // PASO 2.3: Verificar si el token expiró
      const now = new Date();
      const expiresAt = new Date(tokenData.expires_at);

      if (now > expiresAt) {
        throw new Error('Este token ha expirado. Por favor, solicita un nuevo enlace de restablecimiento');
      }

      // PASO 2.4: Si todo está bien, retornar los datos del usuario
      return {
        user_id: tokenData.user_id,
        username: tokenData.username,
        email: tokenData.email,
        full_name: tokenData.full_name,
        token_id: tokenData.token_id
      };
    } catch (error) {
      console.error('Error al validar token:', error);
      throw error;
    }
  }

  /**
   * PASO 3: Restablecer la contraseña
   * Valida el token, encripta la nueva contraseña y la actualiza en BD.
   *
   * @param {string} token - Token de restablecimiento
   * @param {string} newPassword - Nueva contraseña del usuario
   * @returns {boolean} true si se actualizó correctamente
   * @throws {Error} Si el token es inválido o hay un error
   */
  static async resetPassword(token, newPassword) {
    const connection = await connect.getConnection();
    try {
      await connection.beginTransaction();

      // PASO 3.1: Validar que el token sea correcto
      const userData = await this.validateToken(token);

      // PASO 3.2: Validar la nueva contraseña (mínimo 6 caracteres)
      if (!newPassword || newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      // PASO 3.3: Encriptar la nueva contraseña
      // bcrypt es una librería que encripta contraseñas de forma segura
      // El número 10 es el "costo" de encriptación (más alto = más seguro pero más lento)
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // PASO 3.4: Actualizar la contraseña en la base de datos
      await connection.query(`
        UPDATE users
        SET password = ?
        WHERE user_id = ?
      `, [hashedPassword, userData.user_id]);

      // PASO 3.5: Marcar el token como usado para que no se pueda reutilizar
      await connection.query(`
        UPDATE password_reset_tokens
        SET used = 1
        WHERE token = ?
      `, [token]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error al restablecer contraseña:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * UTILIDAD: Limpiar tokens expirados
   * Elimina tokens viejos de la base de datos para mantenerla limpia.
   * Se puede ejecutar periódicamente (cada noche con un cron job).
   *
   * @returns {number} Cantidad de tokens eliminados
   */
  static async cleanExpiredTokens() {
    try {
      const [result] = await connect.query(`
        DELETE FROM password_reset_tokens
        WHERE expires_at < NOW()
        OR used = 1
      `);

      return result.affectedRows;
    } catch (error) {
      console.error('Error al limpiar tokens expirados:', error);
      throw error;
    }
  }

  /**
   * UTILIDAD: Verificar si un usuario tiene tokens pendientes
   * Útil para evitar spam de solicitudes de restablecimiento.
   *
   * @param {number} userId - ID del usuario
   * @returns {boolean} true si tiene tokens válidos pendientes
   */
  static async hasPendingTokens(userId) {
    try {
      const [tokens] = await connect.query(`
        SELECT COUNT(*) as count
        FROM password_reset_tokens
        WHERE user_id = ?
        AND used = 0
        AND expires_at > NOW()
      `, [userId]);

      return tokens[0].count > 0;
    } catch (error) {
      console.error('Error al verificar tokens pendientes:', error);
      throw error;
    }
  }
}

export default PasswordResetModel;
