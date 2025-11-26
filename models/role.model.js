import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar las operaciones relacionadas con roles en la base de datos.
 * Proporciona métodos para crear, consultar, actualizar y eliminar roles,
 * así como para realizar búsquedas por diferentes criterios como ID o nombre.
 */
class RoleModel {

  /**
   * Crear un nuevo rol en la base de datos.
   * 
   * @param {Object} roleData - Datos del rol a crear
   * @param {string} roleData.name - Nombre del rol
   * @param {string} roleData.description - Descripción detallada del rol
   * @param {number} roleData.status_id - ID del estado inicial del rol
   * @returns {number|null} ID del rol creado o null si hay un error
   */
  static async create({ name, description, status_id }) {
    try {
      let sqlQuery = `INSERT INTO roles (name, description, status_id, created_at) VALUES (?, ?, ?, NOW())`;
      const [result] = await connect.query(sqlQuery, [name, description, status_id]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating role:', error);
      return null;
    }
  }

  /**
   * Obtener todos los roles registrados en el sistema.
   * Incluye el nombre del estado asociado a cada rol.
   * 
   * @returns {Array} Lista de roles con su información completa o array vacío si hay un error
   */
  static async show() {
    try {
      let sqlQuery = `
        SELECT r.*, 
               s.name AS status_name 
        FROM roles r 
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        ORDER BY r.role_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing roles:', error);
      return [];
    }
  }

  static async showActive() {
    try {
      // Simplemente retorna todos los roles sin filtrar por estado
      // ya que los roles no tienen estados específicos asignados correctamente
      let sqlQuery = `
        SELECT r.role_id,
               r.name AS role_name,
               r.description,
               r.status_id,
               r.created_at,
               r.updated_at,
               s.name AS status_name
        FROM roles r
        LEFT JOIN statuses s ON r.status_id = s.status_id
        ORDER BY r.role_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing active roles:', error);
      return [];
    }
  }

  static async update(id, { name, description, status_id }) {
    try {
      let sqlQuery = `
        UPDATE roles 
        SET name = ?, 
            description = ?, 
            status_id = ?, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE role_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [name, description, status_id, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error updating role:', error);
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM roles WHERE role_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting role:', error);
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT r.*, 
               s.name AS status_name 
        FROM roles r 
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        WHERE r.role_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding role by ID:', error);
      return null;
    }
  }

  static async findByIdActive(id) {
    try {
      let sqlQuery = `
        SELECT r.*, 
               s.name AS status_name 
        FROM roles r 
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        WHERE r.role_id = ? AND s.name = 'Activo'
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding active role by ID:', error);
      return null;
    }
  }

  static async findByName(name) {
    try {
      let sqlQuery = `
        SELECT r.*, 
               s.name AS status_name 
        FROM roles r 
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        WHERE r.name = ?
      `;
      const [result] = await connect.query(sqlQuery, [name]);
      return result[0];
    } catch (error) {
      console.error('Error finding role by name:', error);
      return null;
    }
  }
}

export default RoleModel;