import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para la gestión de usuarios en el sistema.
 * Proporciona métodos para crear, consultar, actualizar y eliminar registros de usuarios,
 * así como buscar usuarios por diferentes criterios como ID o nombre de usuario.
 */
class UserModel {

  /**
   * Crear un nuevo registro de usuario en la base de datos.
   * 
   * @param {Object} params - Parámetros del usuario
   * @param {string} params.username - Nombre de usuario único
   * @param {string} params.password - Contraseña encriptada del usuario
   * @param {number} params.role_id - ID del rol asignado al usuario
   * @param {number} params.status_id - ID del estado del usuario
   * @returns {number|null} El ID del usuario creado o null si ocurre un error
   */
  static async create({ username, password, role_id, status_id }) {
    try {
      const [result] = await connect.query(
        `INSERT INTO users (
          username, 
          password, 
          role_id, 
          status_id
        ) VALUES (?, ?, ?, ?)`,
        [username, password, role_id, status_id]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  /**
   * Obtener todos los usuarios registrados en el sistema.
   * Incluye información básica del usuario junto con su perfil asociado,
   * rol y estado mediante JOINs con las tablas correspondientes.
   * 
   * @returns {Array} Lista de usuarios ordenados por ID o array vacío en caso de error
   */
  static async show() {
    try {
      const [rows] = await connect.query(
        `SELECT 
          u.user_id,
          u.username,
          p.phone,
          p.email,
          r.name AS role_name, 
          s.name AS status_name 
        FROM users u 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN roles r ON u.role_id = r.role_id 
        LEFT JOIN statuses s ON u.status_id = s.status_id 
        ORDER BY u.user_id`
      );
      return rows;
    } catch (error) {
      console.error('Error showing users:', error);
      return [];
    }
  }

  /**
   * Obtener únicamente los usuarios con estado 'activo' en el sistema.
   * Filtrar la consulta para mostrar solo usuarios activos, incluyendo
   * su información de perfil, rol y estado.
   * 
   * @returns {Array} Lista de usuarios activos ordenados por ID o array vacío en caso de error
   */
  static async showActive() {
    try {
      const [rows] = await connect.query(
        `SELECT 
          u.user_id,
          u.username,
          p.phone,
          p.email,
          r.name AS role_name, 
          s.name AS status_name 
        FROM users u 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN roles r ON u.role_id = r.role_id 
        LEFT JOIN statuses s ON u.status_id = s.status_id 
        WHERE s.name IN ('activo', 'Activo')
        ORDER BY u.user_id`
      );
      return rows;
    } catch (error) {
      console.error('Error showing active users:', error);
      return [];
    }
  }

  /**
   * Actualiza la información de un usuario existente.
   * 
   * @param {number} id - ID del usuario a actualizar
   * @param {Object} params - Parámetros a actualizar
   * @param {string} params.username - Nuevo nombre de usuario
   * @param {string} params.password - Nueva contraseña (ya encriptada)
   * @param {number} params.role_id - Nuevo ID de rol
   * @param {number} params.status_id - Nuevo ID de estado
   * @returns {Object|null} El usuario actualizado o null si ocurre un error o no se encuentra
   */
  static async update(id, { username, password, role_id, status_id }) {
    try {
      if (!id) {
        throw new Error('User ID is required for update');
      }

      const [result] = await connect.query(
        `UPDATE users 
         SET username = ?, 
             password = ?, 
             role_id = ?, 
             status_id = ?,
             updated_at = NOW()
         WHERE user_id = ?`,
        [username, password, role_id, status_id, id]
      );
      
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error);
      return null;
    }
  }

  /**
   * Elimina un usuario de la base de datos.
   * 
   * @param {number} id - ID del usuario a eliminar
   * @returns {boolean} true si la eliminación fue exitosa, false en caso contrario
   */
  static async delete(id) {
    try {
      if (!id) {
        throw new Error('User ID is required for deletion');
      }
      
      const [result] = await connect.query(
        'DELETE FROM users WHERE user_id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting user with id ${id}:`, error);
      return false;
    }
  }

  /**
   * Buscar un usuario por su ID.
   * Incluye toda la información del usuario, incluida la contraseña encriptada,
   * así como datos de perfil, rol y estado.
   * 
   * @param {number} id - ID del usuario a buscar
   * @returns {Object|null} El usuario encontrado o null si no existe o hay un error
   */
  static async findById(id) {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }
      
      const [rows] = await connect.query(
        `SELECT 
          u.user_id,
          u.username,
          u.role_id,
          u.status_id,
          u.password,
          p.phone,
          p.email,
          r.name AS role_name, 
          s.name AS status_name 
        FROM users u 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN roles r ON u.role_id = r.role_id 
        LEFT JOIN statuses s ON u.status_id = s.status_id 
        WHERE u.user_id = ?`,
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error(`Error finding user with id ${id}:`, error);
      return null;
    }
  }

  /**
   * Buscar un usuario por ID que tenga estado 'activo'.
   * Permite verificar que un usuario existe y está activo antes de realizar operaciones.
   * 
   * @param {number} id - ID del usuario a buscar
   * @returns {Object|null} El usuario activo encontrado o null si no existe, está inactivo o hay un error
   */
  static async findByIdActive(id) {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }
      
      const [rows] = await connect.query(
        `SELECT 
          u.user_id,
          u.username,
          u.password,
          p.phone,
          p.email,
          r.name AS role_name, 
          s.name AS status_name 
        FROM users u 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN roles r ON u.role_id = r.role_id 
        LEFT JOIN statuses s ON u.status_id = s.status_id 
        WHERE u.user_id = ? AND s.name IN ('activo', 'Activo')`,
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error(`Error finding active user with id ${id}:`, error);
      return null;
    }
  }

  /**
   * Buscar un usuario por su nombre de usuario.
   * Utilizado principalmente para verificar la existencia de un usuario durante el registro
   * o para obtener información de usuario durante el inicio de sesión.
   * 
   * @param {string} username - Nombre de usuario a buscar
   * @returns {Object|null} El usuario encontrado o null si no existe o hay un error
   */
  static async findByName(username) {
    try {
      if (!username) {
        throw new Error('Username is required');
      }
      
      const [rows] = await connect.query(
        `SELECT 
          u.user_id,
          u.username,
          u.password,
          p.phone,
          p.email,
          r.name AS role_name, 
          s.name AS status_name 
        FROM users u 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN roles r ON u.role_id = r.role_id 
        LEFT JOIN statuses s ON u.status_id = s.status_id 
        WHERE u.username = ? AND s.name IN ('activo', 'Activo')`,
        [username]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error(`Error finding user with username ${username}:`, error);
      return null;
    }
  }

  /**
   * Actualiza el timestamp de último inicio de sesión de un usuario.
   * Se llama cada vez que un usuario inicia sesión exitosamente
   * para mantener un registro de actividad.
   * 
   * @param {number} id - ID del usuario que inició sesión
   * @returns {Object|null} El usuario actualizado o null si hay un error
   */
  static async updateLogin(id) {
    try {
      if (!id) {
        throw new Error('User ID is required for login update');
      }
      
      const [result] = await connect.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
        [id]
      );
      
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error(`Error updating login timestamp for user with id ${id}:`, error);
      return null;
    }
  }

}
export default UserModel;