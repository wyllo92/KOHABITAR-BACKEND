import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar la relación entre usuarios y propiedades.
 * Esta clase proporciona métodos para crear, consultar, actualizar y eliminar asociaciones
 * entre usuarios y propiedades, permitiendo definir propietarios y residentes.
 */
class UserPropertyModel {
  
  /**
   * Crear una nueva relación entre un usuario y una propiedad.
   * 
   * @param {Object} params - Parámetros de la relación
   * @param {number} params.user_id - ID del usuario
   * @param {number} params.property_id - ID de la propiedad
   * @param {boolean} params.is_owner - Indica si el usuario es propietario (true) o residente (false)
   * @param {Date} params.start_date - Fecha de inicio de la relación
   * @param {Date} params.end_date - Fecha de fin de la relación (opcional)
   * @param {number} params.status_id - ID del estado de la relación
   * @returns {number|null} ID de la relación creada o null si ocurre un error
   */
  static async create({ user_id, property_id, is_owner, start_date, end_date, status_id }) {
    try {
      if (!user_id || !property_id) {
        throw new Error('User ID and Property ID are required');
      }

      const [result] = await connect.query(
        `INSERT INTO user_properties (
          user_id,
          property_id,
          is_owner,
          start_date,
          end_date,
          status_id,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [user_id, property_id, is_owner, start_date || new Date(), end_date, status_id]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating user property:', error);
      return null;
    }
  }

  /**
   * Obtener todas las relaciones usuario-propiedad registradas en el sistema.
   * Incluye información detallada sobre el usuario, la propiedad y el estado de la relación.
   * 
   * @returns {Array} Lista de relaciones usuario-propiedad o un array vacío en caso de error
   */
  static async show() {
    try {
      const [rows] = await connect.query(
        `SELECT up.*, 
          u.username,
          p.name as property_name,
          s.name as status_name 
        FROM user_properties up
        JOIN users u ON up.user_id = u.user_id
        JOIN properties p ON up.property_id = p.property_id
        LEFT JOIN statuses s ON up.status_id = s.status_id
        ORDER BY up.user_property_id`
      );
      return rows;
    } catch (error) {
      console.error('Error showing user properties:', error);
      return [];
    }
  }

  /**
   * Buscar todas las propiedades asociadas a un usuario específico.
   * Devolver información detallada de cada propiedad, incluyendo su tipo y descripción.
   * Ordena los resultados mostrando primero las propiedades que el usuario posee.
   * 
   * @param {number} user_id - ID del usuario cuyas propiedades se desean consultar
   * @returns {Array} Lista de propiedades asociadas al usuario o un array vacío en caso de error
   */
  static async findByUserId(user_id) {
    try {
      const [rows] = await connect.query(
        `SELECT up.*, 
          p.name as property_name,
          p.description as property_description,
          pt.name as property_type_name,
          s.name as status_name 
        FROM user_properties up
        JOIN properties p ON up.property_id = p.property_id
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN statuses s ON up.status_id = s.status_id
        WHERE up.user_id = ?
        ORDER BY up.is_owner DESC, p.name`,
        [user_id]
      );
      return rows;
    } catch (error) {
      console.error('Error finding user properties by user ID:', error);
      return [];
    }
  }

  /**
   * Buscar todos los usuarios asociados a una propiedad específica.
   * Devolver información detallada de cada usuario, incluyendo su perfil completo.
   * Ordena los resultados mostrando primero a los propietarios y luego a los residentes.
   * 
   * @param {number} property_id - ID de la propiedad cuyos usuarios se desean consultar
   * @returns {Array} Lista de usuarios asociados a la propiedad o un array vacío en caso de error
   */
  static async findByPropertyId(property_id) {
    try {
      const [rows] = await connect.query(
        `SELECT up.*, 
          u.username,
          pr.full_name,
          pr.phone,
          pr.email,
          s.name as status_name 
        FROM user_properties up
        JOIN users u ON up.user_id = u.user_id
        LEFT JOIN profiles pr ON u.user_id = pr.user_id
        LEFT JOIN statuses s ON up.status_id = s.status_id
        WHERE up.property_id = ?
        ORDER BY up.is_owner DESC, pr.full_name`,
        [property_id]
      );
      return rows;
    } catch (error) {
      console.error('Error finding user properties by property ID:', error);
      return [];
    }
  }

  /**
   * Buscar una relación usuario-propiedad específica por su ID.
   * Incluye información detallada tanto del usuario como de la propiedad.
   * 
   * @param {number} id - ID de la relación usuario-propiedad a buscar
   * @returns {Object|null} Datos de la relación encontrada o null si no existe o hay un error
   */
  static async findById(id) {
    try {
      const [rows] = await connect.query(
        `SELECT up.*, 
          u.username,
          p.name as property_name,
          s.name as status_name 
        FROM user_properties up
        JOIN users u ON up.user_id = u.user_id
        JOIN properties p ON up.property_id = p.property_id
        LEFT JOIN statuses s ON up.status_id = s.status_id
        WHERE up.user_property_id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding user property by ID:', error);
      return null;
    }
  }

  /**
   * Actualiza una relación usuario-propiedad existente.
   * Permite modificar si es propietario, fechas de inicio/fin y estado de la relación.
   * 
   * @param {number} id - ID de la relación usuario-propiedad a actualizar
   * @param {Object} params - Parámetros a actualizar
   * @param {boolean} params.is_owner - Indica si el usuario es propietario o residente
   * @param {Date} params.start_date - Nueva fecha de inicio de la relación
   * @param {Date} params.end_date - Nueva fecha de fin de la relación
   * @param {number} params.status_id - Nuevo ID del estado de la relación
   * @returns {Object|null} Relación actualizada o null si no se encuentra o hay un error
   */
  static async update(id, { is_owner, start_date, end_date, status_id }) {
    try {
      if (!id) {
        throw new Error('User property ID is required for update');
      }

      const [result] = await connect.query(
        `UPDATE user_properties
        SET is_owner = ?,
            start_date = ?,
            end_date = ?,
            status_id = ?,
            updated_at = NOW()
        WHERE user_property_id = ?`,
        [is_owner, start_date, end_date, status_id, id]
      );
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error(`Error updating user property with id ${id}:`, error);
      return null;
    }
  }

  /**
   * Elimina una relación usuario-propiedad de la base de datos.
   * 
   * @param {number} id - ID de la relación a eliminar
   * @returns {boolean} true si la eliminación fue exitosa, false en caso contrario
   */
  static async delete(id) {
    try {
      const [result] = await connect.query(
        'DELETE FROM user_properties WHERE user_property_id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user property:', error);
      return false;
    }
  }
  
  /**
   * Obtener todos los residentes de una propiedad específica utilizando un procedimiento almacenado.
   * Este método proporciona información más detallada sobre los residentes que findByPropertyId.
   * 
   * @param {number} property_id - ID de la propiedad cuyos residentes se desean consultar
   * @returns {Array} Lista de residentes de la propiedad o un array vacío en caso de error
   */
  static async getPropertyResidents(property_id) {
    try {
      const [rows] = await connect.query(
        'CALL sp_get_property_residents(?)',
        [property_id]
      );
      return rows[0]; // Primer conjunto de resultados
    } catch (error) {
      console.error('Error getting property residents:', error);
      return [];
    }
  }
}

export default UserPropertyModel;
