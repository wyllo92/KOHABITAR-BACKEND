import { connect } from '../config/db/connectMysql.js';
import { isValidEmail, isValidPhone, isValidLength } from '../utils/validators.js';

/**
 * Modelo para gestionar las operaciones de base de datos relacionadas con perfiles de usuario.
 * Proporciona métodos para realizar operaciones CRUD sobre la tabla profiles
 * y consultas especializadas para buscar perfiles por diferentes criterios.
 * 
 * @typedef {Object} ProfileData
 * @property {number} user_id - ID del usuario
 * @property {string} full_name - Nombre completo (máx. 150 caracteres)
 * @property {string} phone - Teléfono (formato: +57XXXXXXXXXX)
 * @property {string} email - Correo electrónico (máx. 150 caracteres)
 * @property {string} [profile_photo] - URL de la foto de perfil (máx. 512 caracteres)
 * @property {string} [address] - Dirección (máx. 255 caracteres)
 */
class ProfileModel {

  /**
   * Crear un nuevo perfil de usuario en la base de datos.
   * 
   * @param {Object} profileData - Datos del perfil a crear
   * @param {number} profileData.user_id - ID del usuario asociado al perfil
   * @param {string} profileData.full_name - Nombre completo del usuario
   * @param {string} profileData.phone - Número telefónico del usuario
   * @param {string} profileData.email - Correo electrónico del usuario
   * @param {string|null} profileData.profile_photo - URL o ruta de la foto de perfil (opcional)
   * @param {string|null} profileData.address - Dirección del usuario (opcional)
   * @returns {number} ID del perfil creado
   */
  static async create({ user_id, full_name, phone, email, profile_photo, address }) {
    // Validaciones
    if (!isValidEmail(email)) {
      throw new Error('Formato de email inválido');
    }
    if (!isValidPhone(phone)) {
      throw new Error('Formato de teléfono inválido');
    }
    if (!isValidLength(full_name, 150)) {
      throw new Error('El nombre completo excede la longitud máxima (150)');
    }
    if (profile_photo && !isValidLength(profile_photo, 512)) {
      throw new Error('La URL de la foto de perfil excede la longitud máxima (512)');
    }
    if (address && !isValidLength(address, 255)) {
      throw new Error('La dirección excede la longitud máxima (255)');
    }

    const [result] = await connect.query(
      'INSERT INTO profiles (user_id, full_name, phone, email, profile_photo, address, is_deleted) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [user_id, full_name, phone, email, profile_photo, address]
    );
    return result.insertId;
  }

  /**
   * Obtener todos los perfiles de usuario registrados en el sistema.
   * 
   * @returns {Array} Lista de perfiles de usuario ordenados por ID
   */
  static async show(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // Obtener total de registros para la paginación
      const [countResult] = await connect.query(
        'SELECT COUNT(*) as total FROM profiles WHERE is_deleted = 0'
      );
      const total = countResult[0].total;
      
      // Obtener registros paginados
      const [rows] = await connect.query(
        'SELECT user_id, full_name, phone, email, profile_photo, address FROM profiles WHERE is_deleted = 0 ORDER BY user_id LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      return {
        data: rows,
        pagination: {
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + rows.length < total
        }
      };
    } catch (error) {
      console.error('Error en show profile:', error);
      return { data: [], pagination: { total: 0, currentPage: 1, totalPages: 0, hasMore: false } };
    }
  }

  /**
   * Actualiza la información de un perfil de usuario existente.
   * 
   * @param {number} user_id - ID del usuario cuyo perfil se actualizará
   * @param {Object} profileData - Datos actualizados del perfil
   * @param {string} profileData.full_name - Nombre completo actualizado
   * @param {string} profileData.phone - Número telefónico actualizado
   * @param {string} profileData.email - Correo electrónico actualizado
   * @param {string|null} profileData.profile_photo - URL o ruta actualizada de la foto de perfil
   * @param {string|null} profileData.address - Dirección actualizada
   * @returns {Object|null} Datos del perfil actualizado o null si no se pudo actualizar
   */
  static async update(user_id, { full_name, phone, email, profile_photo, address }) {
    // Validaciones
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (!isValidPhone(phone)) {
      throw new Error('Invalid phone format');
    }
    if (!isValidLength(full_name, 150)) {
      throw new Error('Full name exceeds maximum length (150)');
    }
    if (profile_photo && !isValidLength(profile_photo, 512)) {
      throw new Error('Profile photo URL exceeds maximum length (512)');
    }
    if (address && !isValidLength(address, 255)) {
      throw new Error('Address exceeds maximum length (255)');
    }

    const [result] = await connect.query(
      'UPDATE profiles SET full_name = ?, phone = ?, email = ?, profile_photo = ?, address = ? WHERE user_id = ? AND is_deleted = 0',
      [full_name, phone, email, profile_photo, address, user_id]
    );
    return result.affectedRows > 0 ? this.findById(user_id) : null;
  }

  /**
   * Elimina un perfil de usuario de la base de datos.
   * 
   * @param {number} user_id - ID del usuario cuyo perfil se eliminará
   * @returns {boolean} true si el perfil fue eliminado exitosamente, false si no
   */
  static async delete(user_id) {
    // Implementación de soft delete
    const [result] = await connect.query(
      'UPDATE profiles SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_deleted = 0',
      [user_id]
    );
    // Retornar true si se afectó al menos una fila (perfil marcado como eliminado)
    return result.affectedRows > 0;
  }

  /**
   * Buscar un perfil de usuario por su ID de usuario.
   * 
   * @param {number} user_id - ID del usuario cuyo perfil se busca
   * @returns {Object|null} Datos del perfil encontrado o null si no existe
   */
  static async findById(user_id) {
    try {
      const [rows] = await connect.query(
        'SELECT * FROM profiles WHERE user_id = ?',
        [user_id]
      );
      return rows[0];
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Buscar un perfil de usuario por su dirección de correo electrónico.
   * 
   * @param {string} email - Correo electrónico a buscar
   * @returns {Object|null} Datos del perfil encontrado o null si no existe
   */
  static async findByEmail(email) {
    try {
      // Ejecuta la consulta SQL para buscar un perfil con el email especificado
      const [rows] = await connect.query(
        'SELECT * FROM profiles WHERE profile_email = ?',
        [email]
      );
      // Retornar el primer resultado (o undefined si no hay resultados)
      return rows[0];
    } catch (error) {
      return null;
    }
  }
}
export default ProfileModel;