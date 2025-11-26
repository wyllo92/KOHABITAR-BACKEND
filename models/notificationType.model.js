/**
 * Importa la conexión a la base de datos MySQL.
 * Esta conexión se utiliza para realizar todas las operaciones CRUD.
 */
import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar las operaciones relacionadas con tipos de notificación en la base de datos.
 * Proporciona métodos para crear, consultar, actualizar y eliminar tipos de notificación,
 * así como para realizar búsquedas por diferentes criterios como ID o nombre.
 */
class NotificationTypeModel {

  /**
   * Crea un nuevo tipo de notificación en la base de datos.
   *
   * @param {Object} typeData - Datos del tipo de notificación a crear.
   * @param {string} typeData.name - Nombre del tipo de notificación.
   * @param {string} typeData.description - Descripción detallada del tipo.
   * @returns {number|null} - ID del tipo creado o null si hay un error.
   */
  static async create({ name, description }) {
    try {
      let sqlQuery = `INSERT INTO notification_types (name, description, created_at) VALUES (?, ?, NOW())`;
      const [result] = await connect.query(sqlQuery, [name, description]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating notification type:', error);
      return null;
    }
  }

  /**
   * Obtiene todos los tipos de notificación registrados en el sistema.
   *
   * @returns {Array} - Lista de tipos de notificación con su información completa o array vacío si hay un error.
   */
  static async show() {
    try {
      let sqlQuery = `
        SELECT notification_type_id,
               name,
               description,
               created_at,
               updated_at
        FROM notification_types
        ORDER BY notification_type_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing notification types:', error);
      return [];
    }
  }

  /**
   * Actualiza un tipo de notificación existente.
   *
   * @param {number} id - ID del tipo de notificación a actualizar.
   * @param {Object} typeData - Datos actualizados del tipo.
   * @param {string} typeData.name - Nuevo nombre del tipo.
   * @param {string} typeData.description - Nueva descripción del tipo.
   * @returns {Object|null} - Tipo de notificación actualizado o null si hay un error.
   */
  static async update(id, { name, description }) {
    try {
      let sqlQuery = `
        UPDATE notification_types
        SET name = ?,
            description = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE notification_type_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [name, description, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error updating notification type:', error);
      return null;
    }
  }

  /**
   * Elimina un tipo de notificación de la base de datos.
   *
   * @param {number} id - ID del tipo de notificación a eliminar.
   * @returns {boolean} - true si se eliminó correctamente, false en caso contrario.
   */
  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM notification_types WHERE notification_type_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting notification type:', error);
      return false;
    }
  }

  /**
   * Busca un tipo de notificación específico por su ID.
   *
   * @param {number} id - ID del tipo de notificación a buscar.
   * @returns {Object|null} - Tipo de notificación encontrado o null si no existe.
   */
  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT notification_type_id,
               name,
               description,
               created_at,
               updated_at
        FROM notification_types
        WHERE notification_type_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding notification type by ID:', error);
      return null;
    }
  }

  /**
   * Busca un tipo de notificación por su nombre.
   *
   * @param {string} name - Nombre del tipo de notificación a buscar.
   * @returns {Object|null} - Tipo de notificación encontrado o null si no existe.
   */
  static async findByName(name) {
    try {
      let sqlQuery = `
        SELECT notification_type_id,
               name,
               description,
               created_at,
               updated_at
        FROM notification_types
        WHERE name = ?
      `;
      const [result] = await connect.query(sqlQuery, [name]);
      return result[0];
    } catch (error) {
      console.error('Error finding notification type by name:', error);
      return null;
    }
  }
}

export default NotificationTypeModel;
